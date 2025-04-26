import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { GameStateService, Player } from '../../services/game-state.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { NgIf, NgClass } from '@angular/common';
import html2canvas from 'html2canvas';
import { AddRoundModalComponent } from './add-round-modal.component';

interface PlayerRank {
  score: number;
  i: number;
  rank: number;
}

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, NgIf, NgClass],
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  players: Player[] = [];
  rounds: number[][] = [];
  gameType = '';
  totalScores: number[] = [];
  ranks: number[] = [];
  @ViewChild('scoreboardCard', { static: false }) scoreboardCardRef!: ElementRef;

  // Add property to track summary modal
  showSummary = false;
  summaryData: { rank: number, avatar: string, name: string, score: number, isWinner: boolean }[] = [];

  constructor(private gs: GameStateService, private dialog: MatDialog) {}

  ngOnInit() {
    const state = this.gs.load();
    if (state) {
      this.players = state.players;
      this.rounds = state.rounds;
      this.gameType = state.gameType;
      this.calculateTotalsAndRanks();
    }
    // Dynamically load confetti script if not present
    if (!(window as any).confetti) {
      const script = document.createElement('script');
      script.src = '/assets/canvas-confetti.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }

  calculateTotalsAndRanks() {
    this.totalScores = this.players.map((_, i) =>
      this.rounds.reduce((sum, round) => sum + (round[i] ?? 0), 0)
    );
    // Lower score is better for both Rummy and Least Count
    const playerScores = this.totalScores.map((score, i) => ({ score, i }));
    // Sort and assign ranks
    const sorted = [...playerScores].sort((a, b) => a.score - b.score);
    const ranksArr: number[] = Array(this.players.length).fill(0);
    let currentRank = 1;
    for (let idx = 0; idx < sorted.length; idx++) {
      if (idx > 0 && sorted[idx].score === sorted[idx - 1].score) {
        // Same score, same rank
        ranksArr[sorted[idx].i] = ranksArr[sorted[idx - 1].i];
      } else {
        ranksArr[sorted[idx].i] = currentRank;
      }
      currentRank++;
    }
    this.ranks = ranksArr;
  }

  openAddRoundModal() {
    const dialogRef = this.dialog.open(AddRoundModalComponent, {
      data: { players: this.players },
      width: '350px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((scores: number[] | undefined) => {
      if (scores && scores.length === this.players.length) {
        this.rounds.push(scores);
        this.gs.save({ ...this.gs.state!, rounds: this.rounds });
        this.calculateTotalsAndRanks();
      }
    });
  }

  undoLastRound() {
    if (this.rounds.length > 0) {
      this.rounds.pop();
      this.gs.save({ ...this.gs.state!, rounds: this.rounds });
      this.calculateTotalsAndRanks();
    }
  }

  finishGame() {
    if (this.gs.state) {
      const stateCopy = JSON.parse(JSON.stringify(this.gs.state));
      this.gs.saveGameToHistory(stateCopy, new Date().toISOString());
      this.gs.clear();
      this.triggerConfetti();
      // Instead of redirect, show summary
      setTimeout(() => {
        this.openGameSummary();
      }, 1200);
    }
  }

  exportScores() {
    // Export scores as text (copy to clipboard or download)
    let text = `Game: ${this.gameType}\n`;
    text += this.players.map((p, i) => `${p.avatar} ${p.name}: ${this.totalScores[i]}`).join('\n');
    text += `\nWinner(s): ` + this.players.filter((_, i) => this.ranks[i] === 1).map((p, i) => `${p.avatar} ${p.name}`).join(', ');
    const blob = new Blob([text], { type: 'text/plain' });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Scores copied to clipboard!');
      }, () => {
        // fallback to download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'final-scores.txt';
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      // fallback to download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'final-scores.txt';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  exportScoreboardImage() {
    if (!this.scoreboardCardRef) return;
    // Remove problematic CSS variables for html2canvas
    const el = this.scoreboardCardRef.nativeElement;
    const prevColor = el.style.color;
    // Set a safe color for html2canvas
    el.style.color = '#fff';
    html2canvas(el, {
      backgroundColor: '#22223b',
      useCORS: true,
      logging: false,
      // filter out problematic computed styles
      onclone: (doc) => {
        // Remove any 'color-mix', 'color()' or unsupported color functions
        doc.querySelectorAll('*').forEach(node => {
          if (node instanceof HTMLElement) {
            const style = getComputedStyle(node);
            if (style.color && style.color.includes('color(')) {
              node.style.color = '#fff';
            }
            if (style.background && style.background.includes('color(')) {
              node.style.background = '#22223b';
            }
          }
        });
      }
    }).then(canvas => {
      el.style.color = prevColor;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'scoreboard.png';
      link.click();
    }).catch(() => {
      el.style.color = prevColor;
      alert('Export failed. Some CSS features may not be supported.');
    });
  }

  triggerConfetti() {
    // Wait for confetti lib to load, then fire confetti
    const tryFire = () => {
      if ((window as any).confetti) {
        (window as any).confetti();
      } else {
        setTimeout(tryFire, 100);
      }
    };
    tryFire();
  }

  // Call this to open the summary overlay/modal
  openGameSummary() {
    // Calculate final standings
    const playerScores = this.players.map((p, i) => ({
      name: p.name,
      avatar: p.avatar,
      score: this.totalScores[i],
      i
    }));
    playerScores.sort((a, b) => a.score - b.score);
    let currentRank = 1;
    let lastScore: number | null = null;
    playerScores.forEach((p, idx) => {
      if (lastScore !== null && p.score !== lastScore) currentRank = idx + 1;
      (p as any).rank = currentRank;
      lastScore = p.score;
    });
    this.summaryData = playerScores.map(p => ({
      ...p,
      rank: (p as any).rank,
      isWinner: p.score === playerScores[0].score
    }));
    this.showSummary = true;
    // Optionally trigger confetti or sound here
    this.triggerConfetti();
  }

  closeGameSummary() {
    this.showSummary = false;
    // Reset scoreboard state after summary is closed
    this.players = [];
    this.rounds = [];
    this.gameType = '';
    this.totalScores = [];
    this.ranks = [];
    this.gs.clear();
  }
}

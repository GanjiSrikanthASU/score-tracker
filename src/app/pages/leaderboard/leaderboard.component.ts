import { Component, OnInit, DoCheck, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService, GameHistoryEntry } from '../../services/game-state.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
  animations: [
    trigger('podiumAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-40px) scale(0.8)' }),
        animate('600ms cubic-bezier(.5,1.8,.5,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':increment', [
        animate('500ms cubic-bezier(.2,1.2,.4,1)', style({ boxShadow: '0 0 40px gold', transform: 'scale(1.12)' }))
      ]),
      transition(':decrement', [
        animate('400ms cubic-bezier(.2,1.2,.4,1)', style({ opacity: 0.7, transform: 'scale(0.93)' }))
      ])
    ]),
    trigger('cardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px) scale(0.8)' }),
        animate('600ms 80ms cubic-bezier(.5,1.8,.5,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':increment', [
        animate('400ms cubic-bezier(.2,1.2,.4,1)', style({ boxShadow: '0 0 18px #ffd700', transform: 'scale(1.09)' }))
      ]),
      transition(':decrement', [
        animate('350ms cubic-bezier(.2,1.2,.4,1)', style({ opacity: 0.8, transform: 'scale(0.94)' }))
      ])
    ])
  ]
})
export class LeaderboardComponent implements OnInit, DoCheck, AfterViewInit {
  history: GameHistoryEntry[] = [];
  playerStats: { name: string; avatar: string; score: number }[] = [];
  topThree: { name: string; avatar: string; score: number }[] = [];
  others: { name: string; avatar: string; score: number }[] = [];
  prevPlayerStats: { name: string; avatar: string; score: number }[] = [];

  @ViewChild('confettiCanvas', { static: false }) confettiCanvasRef!: ElementRef;
  confettiStarted = false;

  constructor(private gs: GameStateService) {}

  ngOnInit() {
    this.updateStats();
  }

  ngAfterViewInit() {
    setTimeout(() => this.launchConfetti(), 350);
  }

  ngDoCheck() {
    this.updateStats();
  }

  updateStats() {
    this.history = this.gs.getHistory();
    const scoreMap = new Map<string, { name: string; avatar: string; score: number }>();
    // Use all players from all history entries, not just winners
    for (const entry of this.history) {
      if (entry.players && Array.isArray(entry.players)) {
        for (const player of entry.players) {
          if (!scoreMap.has(player.name)) {
            scoreMap.set(player.name, { name: player.name, avatar: player.avatar, score: 0 });
          }
        }
        // Sum up scores for each player in this entry
        entry.players.forEach((player, idx) => {
          const stat = scoreMap.get(player.name)!;
          // Calculate total score for this entry
          const entryScore = Array.isArray(player.scores) ? player.scores.reduce((a, b) => a + b, 0) : 0;
          stat.score += entryScore;
        });
      }
    }
    this.prevPlayerStats = this.playerStats;
    this.playerStats = Array.from(scoreMap.values()).sort((a, b) => b.score - a.score);
    this.topThree = this.playerStats.slice(0, 3);
    this.others = this.playerStats.slice(3, 10); // Only ranks 4-10
  }

  launchConfetti() {
    if (this.confettiStarted) return;
    this.confettiStarted = true;
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (!canvas) return;
    // Simple confetti animation (vanilla JS, golden theme)
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confettiCount = 54;
    const confettiColors = ['#ffd700', '#fffbe7', '#ffe082', '#fff9c4'];
    const confetti = Array.from({ length: confettiCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: 8 + Math.random() * 8,
      d: 8 + Math.random() * 12,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltAngleIncremental: (Math.random() * 0.07) + .01
    }));
    let angle = 0;
    function drawConfetti() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + (c.r / 3), c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.d);
        ctx.stroke();
      }
      updateConfetti();
    }
    function updateConfetti() {
      angle += 0.01;
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        c.y += (Math.cos(angle + i) + 2 + c.r / 6) * 0.9;
        c.x += Math.sin(angle) * 1.2;
        c.tiltAngle += c.tiltAngleIncremental;
        c.tilt = Math.sin(c.tiltAngle - (i % 3)) * 15;
        if (c.y > H) {
          c.y = -10;
          c.x = Math.random() * W;
        }
      }
    }
    function animateConfetti() {
      drawConfetti();
      requestAnimationFrame(animateConfetti);
    }
    animateConfetti();
  }
}

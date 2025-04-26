import { Injectable } from '@angular/core';

export interface Player {
  name: string;
  avatar: string;
  scores: number[];
  penalties?: { fifty: number; zero: number };
}

export interface GameState {
  players: Player[];
  gameType: 'rummy' | 'least-count';
  rounds: number[][];
  started: boolean;
  createdAt: string;
}

export interface GameHistoryEntry {
  players: Player[];
  gameType: 'rummy' | 'least-count';
  rounds: number[][];
  started: boolean;
  createdAt: string;
  finishedAt: string;
  winners: { name: string; avatar: string; score: number }[];
}

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private readonly KEY = 'score-tracker-game';
  private readonly HISTORY_KEY = 'score-tracker-history';
  state: GameState | null = null;
  history: GameHistoryEntry[] = [];

  load(): GameState | null {
    if (this.state) return this.state;
    const raw = localStorage.getItem(this.KEY);
    if (raw) {
      this.state = JSON.parse(raw);
      return this.state;
    }
    return null;
  }

  save(state: GameState) {
    this.state = state;
    localStorage.setItem(this.KEY, JSON.stringify(state));
  }

  clear() {
    localStorage.removeItem(this.KEY);
    this.state = null;
  }

  // --- History Management ---
  saveGameToHistory(state: GameState, finishedAt: string) {
    const history = this.getHistory();
    // Calculate winners (lowest score)
    const totals = state.players.map((_, i) => state.rounds.reduce((sum, round) => sum + (round[i] ?? 0), 0));
    const minScore = Math.min(...totals);
    const winners = state.players
      .map((p, i) => ({ name: p.name, avatar: p.avatar, score: totals[i] }))
      .filter(p => p.score === minScore);
    const entry = {
      ...state,
      finishedAt,
      winners,
      // Defensive: flatten player scores for leaderboard
      players: state.players.map((p, i) => ({
        ...p,
        scores: state.rounds.map(r => r[i] ?? 0)
      }))
    };
    history.unshift(entry);
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  }

  getHistory(): GameHistoryEntry[] {
    if (this.history.length) return this.history;
    const raw = localStorage.getItem(this.HISTORY_KEY);
    this.history = raw ? JSON.parse(raw) : [];
    return this.history;
  }

  clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
    this.history = [];
  }
}

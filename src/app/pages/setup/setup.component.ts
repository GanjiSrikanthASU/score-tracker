import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { GameStateService, GameState, Player } from '../../services/game-state.service';
import { AVATARS } from '../../shared/avatars';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, ReactiveFormsModule, NgFor, NgIf, NgClass, MatIconModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  form: FormGroup;
  avatars = AVATARS;
  selectedAvatars: string[] = [];
  maxPlayers = 12;
  minPlayers = 2;

  constructor(private fb: FormBuilder, private gs: GameStateService, private router: Router) {
    this.form = this.fb.group({
      playerNames: ['', [Validators.required]],
      gameType: ['rummy', Validators.required],
      avatars: [[]]
    });
  }

  get playerNameList(): string[] {
    return this.form.value.playerNames
      ? this.form.value.playerNames.split(',').map((n: string) => n.trim()).filter((n: string) => n)
      : [];
  }

  pickAvatar(avatar: string) {
    if (this.selectedAvatars.includes(avatar)) return;
    if (this.selectedAvatars.length < this.playerNameList.length) {
      this.selectedAvatars.push(avatar);
      this.form.patchValue({ avatars: this.selectedAvatars });
    }
  }

  removeAvatar(avatar: string) {
    this.selectedAvatars = this.selectedAvatars.filter(a => a !== avatar);
    this.form.patchValue({ avatars: this.selectedAvatars });
  }

  startGame() {
    // Clear leaderboard/history when starting a new game
    this.gs.clearHistory();
    if (this.form.invalid || this.playerNameList.length < this.minPlayers || this.playerNameList.length > this.maxPlayers) return;
    const players: Player[] = this.playerNameList.map((name, i) => ({
      name,
      avatar: this.selectedAvatars[i] || this.avatars[i],
      scores: [],
      penalties: { fifty: 0, zero: 0 }
    }));
    const state: GameState = {
      players,
      gameType: this.form.value.gameType,
      rounds: [],
      started: true,
      createdAt: new Date().toISOString()
    };
    this.gs.save(state);
    this.router.navigate(['/scoreboard']);
  }
}

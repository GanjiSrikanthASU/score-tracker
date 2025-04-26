import { Component, OnInit } from '@angular/core';
import { GameStateService, GameHistoryEntry } from '../../services/game-state.service';
import { NgFor, NgIf, TitleCasePipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [NgFor, NgIf, TitleCasePipe, DatePipe],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  history: GameHistoryEntry[] = [];

  constructor(private gs: GameStateService) {}

  ngOnInit() {
    this.history = this.gs.getHistory();
  }
}

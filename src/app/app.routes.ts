import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { SetupComponent } from './pages/setup';
import { ScoreboardComponent } from './pages/scoreboard';
import { LeaderboardComponent } from './pages/leaderboard';
import { HistoryComponent } from './pages/history';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'setup', component: SetupComponent },
  { path: 'scoreboard', component: ScoreboardComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '' }
];

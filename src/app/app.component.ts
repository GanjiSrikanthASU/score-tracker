import { Component, HostListener } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './pages/home/home.component';
import { SetupComponent } from './pages/setup/setup.component';
import { ScoreboardComponent } from './pages/scoreboard/scoreboard.component';
import { LeaderboardComponent } from './pages/leaderboard/leaderboard.component';
import { HistoryComponent } from './pages/history/history.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    HomeComponent,
    SetupComponent,
    ScoreboardComponent,
    LeaderboardComponent,
    HistoryComponent,
    NgClass
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('sectionAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(60px) scale(0.97)' }),
        animate('700ms cubic-bezier(.5,1.8,.5,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'score-tracker';
  activeSection: string = 'home-bg'; // default when page loads

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const scrollY = window.scrollY;
    const height = window.innerHeight;

    if (scrollY < height * 0.8) {
      this.activeSection = 'home-bg';
    } else if (scrollY < height * 1.8) {
      this.activeSection = 'setup-bg';
    } else if (scrollY < height * 2.8) {
      this.activeSection = 'scoreboard-bg';
    } else if (scrollY < height * 3.8) {
      this.activeSection = 'leaderboard-bg';
    } else {
      this.activeSection = 'history-bg';
    }
  }
}

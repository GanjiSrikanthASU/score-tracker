import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, MatButtonModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  taglineIndex = 0;
  taglines = [
    'A game night worth remembering.',
    'Track. Brag. Repeat.',
    'No more score fights, just game nights.'
  ];
  carouselImages = [
    { src: '/assets/images/screenshot1.jpg', caption: 'Track scores in real time' },
    { src: '/assets/images/screenshot2.jpg', caption: 'Leaderboard highlights' },
    { src: '/assets/images/screenshot3.jpg', caption: 'Game history at a glance' }
  ];

  private taglineInterval: any;

  ngOnInit() {
    this.taglineInterval = setInterval(() => {
      this.taglineIndex = (this.taglineIndex + 1) % this.taglines.length;
    }, 2800);
  }
  ngOnDestroy() {
    if (this.taglineInterval) {
      clearInterval(this.taglineInterval);
    }
  }
}

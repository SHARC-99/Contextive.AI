import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-history',
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent implements OnInit {
  history: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const stored = localStorage.getItem('contextive_history');
        if (stored) {
          this.history = JSON.parse(stored);
        } else {
          // Initialize with default placeholders
          this.history = [
            {
              filename: "requirements.txt",
              date: "May 10, 2025",
              type: "User Stories",
            },
            {
              filename: "interview.mp3",
              date: "May 9, 2025",
              type: "Test Cases",
            },
            {
              filename: "product-demo.mp4",
              date: "May 8, 2025",
              type: "Custom Format",
            },
          ];
          localStorage.setItem('contextive_history', JSON.stringify(this.history));
        }
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }

  clearHistory() {
    this.history = [];
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('contextive_history');
      } catch (e) {
        console.error('Failed to clear history:', e);
      }
    }
  }
}
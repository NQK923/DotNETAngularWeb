import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private router: Router) {}
  goToIndex() {
    this.router.navigate(['/']);
  }
  goTolistview() {
    this.router.navigate(['/list-view']);
  }
  goToRank() {
    this.router.navigate(['/rank']);
  }
  goToHistory() {
    this.router.navigate(['/history']);
  }
  goToFaverite() {
    this.router.navigate(['/faverite']);
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
  goToNotification() {
    this.router.navigate(['/notification']);
  }
  goToclientmanager() {
    this.router.navigate(['/client-manager']);
  }

}

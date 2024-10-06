import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent {
  constructor(private router: Router) {}
  goToIndex() {
    this.router.navigate(['/']);
  }
  goToForgotpassword() {
    this.router.navigate(['/forgot-password']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  navigateToDashboard() {
    if (this.authService.isLoggedIn) {
      if (this.authService.isCustomer) {
        this.router.navigate(['/customer-dashboard']);
      } else if (this.authService.isMover) {
        this.router.navigate(['/mover-dashboard']);
      } else if (this.authService.isAdmin) {
        this.router.navigate(['/admin-dashboard']);
      }
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  navigateToBooking() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/booking']);
    } else {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/booking' } });
    }
  }
}
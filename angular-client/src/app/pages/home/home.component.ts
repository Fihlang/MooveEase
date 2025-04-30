import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  userRole: UserRole | null = null;
  UserRole = UserRole; // Expose enum to template

  // Testimonials data
  testimonials = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      comment: 'MoveEase made my moving day stress-free! The movers were professional, careful with my furniture, and very friendly. I will definitely use this service again.'
    },
    {
      name: 'Michael Rodriguez',
      rating: 4,
      comment: 'Very happy with the service. The app made it easy to book and track my movers. My furniture arrived in perfect condition.'
    },
    {
      name: 'Emily Chen',
      rating: 5,
      comment: 'Excellent service from start to finish. The movers handled my antique furniture with extreme care. Highly recommended!'
    }
  ];

  // Services data
  services = [
    {
      title: 'Small Items Move',
      description: 'Perfect for moving a few furniture pieces or small apartment items',
      price: 'From $49',
      imageUrl: 'assets/images/small-move.jpg'
    },
    {
      title: 'Apartment Move',
      description: 'Complete solution for moving studio to 2-bedroom apartment furniture',
      price: 'From $99',
      imageUrl: 'assets/images/apartment-move.jpg'
    },
    {
      title: 'House Move',
      description: 'Comprehensive service for moving larger homes with multiple furniture items',
      price: 'From $199',
      imageUrl: 'assets/images/house-move.jpg'
    }
  ];

  // How it works steps
  steps = [
    {
      title: 'Book Your Move',
      description: 'Select your pickup and delivery locations, preferred date and time, and furniture details',
      icon: 'calendar'
    },
    {
      title: 'Get Matched',
      description: 'We will connect you with professional movers who specialize in your type of furniture',
      icon: 'users'
    },
    {
      title: 'Track in Real-Time',
      description: 'Follow your furniture journey with our real-time GPS tracking',
      icon: 'map-pin'
    },
    {
      title: 'Safe Delivery',
      description: 'Your furniture arrives safely at your destination, handled with care',
      icon: 'check-circle'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = user?.role || null;
    });
  }

  navigateToBooking(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/booking']);
    } else {
      this.router.navigate(['/auth'], { queryParams: { returnUrl: '/booking' } });
    }
  }

  navigateToDashboard(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/auth']);
      return;
    }

    switch (this.userRole) {
      case UserRole.CUSTOMER:
        this.router.navigate(['/customer-dashboard']);
        break;
      case UserRole.MOVER:
        this.router.navigate(['/mover-dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin-dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }
}
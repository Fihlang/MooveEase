import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isMenuOpen = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to the auth state to detect changes
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
  
  closeMenu(): void {
    this.isMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.closeMenu();
      }
    });
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }
  
  navigateToDashboard(): void {
    if (!this.currentUser) return;
    
    switch(this.currentUser.role) {
      case UserRole.CUSTOMER:
        this.navigateTo('/customer-dashboard');
        break;
      case UserRole.MOVER:
        this.navigateTo('/mover-dashboard');
        break;
      case UserRole.ADMIN:
        this.navigateTo('/admin-dashboard');
        break;
      default:
        this.navigateTo('/');
    }
  }
}
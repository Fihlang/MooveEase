import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRole = route.data['role'] as UserRole;
    
    if (this.authService.isAuthenticated() && this.authService.hasRole(requiredRole)) {
      return true;
    }

    // User doesn't have required role
    if (this.authService.isAuthenticated()) {
      // If logged in but wrong role, send to home or dashboard
      this.router.navigate(['/']);
    } else {
      // Not logged in, redirect to login page
      this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
    }
    
    return false;
  }
}
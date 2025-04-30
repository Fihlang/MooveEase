import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const RoleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Get required roles from route data
  const requiredRole = route.data['role'] as UserRole | UserRole[];
  
  // First check if user is logged in
  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  // Then check if user has the required role
  if (!authService.hasRole(requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    const user = authService.userValue;
    if (user) {
      switch (user.role) {
        case UserRole.CUSTOMER:
          router.navigate(['/customer-dashboard']);
          break;
        case UserRole.MOVER:
          router.navigate(['/mover-dashboard']);
          break;
        case UserRole.ADMIN:
          router.navigate(['/admin-dashboard']);
          break;
        default:
          router.navigate(['/']);
      }
    } else {
      router.navigate(['/']);
    }
    return false;
  }
  
  return true;
};
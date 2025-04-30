import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AuthComponent } from './pages/auth/auth.component';

// Guards (we'll implement these in a future step)
// import { AuthGuard } from './guards/auth.guard';
// import { RoleGuard } from './guards/role.guard';
// import { UserRole } from './models/user.model';

const routes: Routes = [
  // Auth routes
  { path: 'auth/login', component: AuthComponent, data: { title: 'Sign In' } },
  { path: 'auth/register', component: AuthComponent, data: { title: 'Sign Up' } },
  
  // Add more routes as components are created
  // { path: '', component: HomeComponent, data: { title: 'Home' } },
  // { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Customer Dashboard', roles: [UserRole.CUSTOMER] } },
  // { path: 'mover-dashboard', component: MoverDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Mover Dashboard', roles: [UserRole.MOVER] } },
  // { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, RoleGuard], data: { title: 'Admin Dashboard', roles: [UserRole.ADMIN] } },
  
  // Redirect to home if route doesn't exist
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
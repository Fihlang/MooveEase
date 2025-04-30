import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

// We'll import our components once they are created
// import { HomeComponent } from './pages/home/home.component';
// import { AuthComponent } from './pages/auth/auth.component';
// import { BookingComponent } from './pages/booking/booking.component';
// import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard.component';
// import { MoverDashboardComponent } from './pages/mover-dashboard/mover-dashboard.component';
// import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
// import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  { 
    path: '', 
    // component: HomeComponent,
    pathMatch: 'full' 
  },
  {
    path: 'auth',
    // component: AuthComponent
  },
  {
    path: 'booking',
    // component: BookingComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'customer-dashboard',
    // component: CustomerDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: UserRole.CUSTOMER }
  },
  {
    path: 'mover-dashboard',
    // component: MoverDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: UserRole.MOVER }
  },
  {
    path: 'admin-dashboard',
    // component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { role: UserRole.ADMIN }
  },
  { 
    path: '**', 
    // component: NotFoundComponent 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
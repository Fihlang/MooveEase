import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Route guards will be imported here
// Components will be imported here

const routes: Routes = [
  // Routes will be defined here
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // { path: 'home', component: HomeComponent },
  // { path: 'auth', component: AuthComponent },
  // { path: 'booking', component: BookingComponent, canActivate: [AuthGuard] },
  // { path: 'customer-dashboard', component: CustomerDashboardComponent, canActivate: [AuthGuard] },
  // { path: 'mover-dashboard', component: MoverDashboardComponent, canActivate: [AuthGuard] },
  // { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard, AdminGuard] },
  // { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
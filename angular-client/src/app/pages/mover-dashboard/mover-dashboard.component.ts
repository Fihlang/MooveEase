import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/order.model';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-mover-dashboard',
  templateUrl: './mover-dashboard.component.html',
  styleUrls: ['./mover-dashboard.component.scss']
})
export class MoverDashboardComponent implements OnInit {
  myOrders: Order[] = [];
  activeOrders: Order[] = [];
  completedOrders: Order[] = [];
  availableOrders: Order[] = [];
  
  isLoadingMyOrders = false;
  isLoadingAvailableOrders = false;
  myOrdersError: string | null = null;
  availableOrdersError: string | null = null;
  
  averageRating: number | null = null;
  reviewCount: number = 0;
  
  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMoverData();
  }
  
  loadMoverData(): void {
    this.isLoadingMyOrders = true;
    this.isLoadingAvailableOrders = true;
    
    const user = this.authService.userValue;
    if (!user) return;
    
    // Load mover's assigned orders
    this.orderService.getMoverOrders()
      .pipe(
        catchError(error => {
          this.myOrdersError = error.message || 'Failed to load your orders';
          this.snackBar.open(this.myOrdersError, 'Close', { duration: 5000 });
          return of([] as Order[]);
        })
      )
      .subscribe({
        next: (orders) => {
          this.myOrders = orders;
          this.filterOrders();
          this.isLoadingMyOrders = false;
        },
        error: () => {
          this.isLoadingMyOrders = false;
        }
      });
    
    // Load available orders for mover to accept
    this.orderService.getAvailableOrders()
      .pipe(
        catchError(error => {
          this.availableOrdersError = error.message || 'Failed to load available orders';
          this.snackBar.open(this.availableOrdersError, 'Close', { duration: 5000 });
          return of([] as Order[]);
        })
      )
      .subscribe({
        next: (orders) => {
          this.availableOrders = orders;
          this.isLoadingAvailableOrders = false;
        },
        error: () => {
          this.isLoadingAvailableOrders = false;
        }
      });
    
    // Load mover ratings
    if (user.id) {
      this.userService.getMoverRatings(user.id)
        .subscribe({
          next: (data) => {
            this.averageRating = data.averageRating;
            this.reviewCount = data.reviewCount;
          },
          error: () => {
            // Silently fail, not critical
          }
        });
    }
  }
  
  filterOrders(): void {
    // Active orders: accepted, in_progress
    this.activeOrders = this.myOrders.filter(order => 
      ['accepted', 'in_progress'].includes(order.status)
    );
    
    // Completed orders: completed
    this.completedOrders = this.myOrders.filter(order => 
      order.status === 'completed'
    );
  }
  
  acceptOrder(order: Order): void {
    const user = this.authService.userValue;
    if (!user) return;
    
    this.orderService.assignMover(order.id, user.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Order accepted successfully', 'Close', { duration: 3000 });
          this.loadMoverData();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to accept order', 'Close', { duration: 5000 });
        }
      });
  }
  
  startOrder(order: Order): void {
    this.orderService.updateOrderStatus(order.id, 'in_progress')
      .subscribe({
        next: () => {
          this.snackBar.open('Order started successfully', 'Close', { duration: 3000 });
          this.loadMoverData();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to start order', 'Close', { duration: 5000 });
        }
      });
  }
  
  completeOrder(order: Order): void {
    this.orderService.completeOrder(order.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Order completed successfully', 'Close', { duration: 3000 });
          this.loadMoverData();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to complete order', 'Close', { duration: 5000 });
        }
      });
  }
  
  updateTracking(order: Order): void {
    // In a real app, we would get location from device
    // For demo, we'll use hardcoded values or a map interface
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const trackingData = {
            orderId: order.id,
            locationData: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          };
          
          this.orderService.updateTracking(trackingData)
            .subscribe({
              next: () => {
                this.snackBar.open('Location updated', 'Close', { duration: 2000 });
              },
              error: (error) => {
                this.snackBar.open(error.message || 'Failed to update location', 'Close', { duration: 5000 });
              }
            });
        },
        (error) => {
          this.snackBar.open('Unable to get location: ' + error.message, 'Close', { duration: 5000 });
        }
      );
    } else {
      this.snackBar.open('Geolocation is not supported by this browser', 'Close', { duration: 5000 });
    }
  }
  
  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
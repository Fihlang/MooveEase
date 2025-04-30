import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order.model';
import { CreateReviewRequest } from '../../models/review.model';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {
  orders: Order[] = [];
  activeOrders: Order[] = [];
  pastOrders: Order[] = [];
  pendingOrders: Order[] = [];
  isLoading = false;
  error: string | null = null;
  
  constructor(
    private orderService: OrderService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.orderService.getCustomerOrders()
      .pipe(
        catchError(error => {
          this.error = error.message || 'Failed to load orders';
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
          return of([] as Order[]);
        })
      )
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.filterOrders();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }
  
  filterOrders(): void {
    // Active orders: pending, accepted, in_progress
    this.activeOrders = this.orders.filter(order => 
      ['pending', 'accepted', 'in_progress'].includes(order.status)
    );
    
    // Pending orders (subset of active)
    this.pendingOrders = this.orders.filter(order => 
      order.status === 'pending'
    );
    
    // Past orders: completed, cancelled
    this.pastOrders = this.orders.filter(order => 
      ['completed', 'cancelled'].includes(order.status)
    );
  }
  
  navigateToBooking(): void {
    this.router.navigate(['/booking']);
  }
  
  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id)
        .subscribe({
          next: () => {
            this.snackBar.open('Order cancelled successfully', 'Close', { duration: 3000 });
            this.loadOrders();
          },
          error: (error) => {
            this.snackBar.open(error.message || 'Failed to cancel order', 'Close', { duration: 5000 });
          }
        });
    }
  }
  
  trackOrder(order: Order): void {
    // Navigate to tracking page or open tracking dialog
    this.router.navigate(['/track', order.id]);
  }
  
  submitReview(orderId: number, moverId: number, rating: number, comment: string): void {
    if (!rating) {
      this.snackBar.open('Please select a rating', 'Close', { duration: 3000 });
      return;
    }
    
    const reviewData: CreateReviewRequest = {
      orderId,
      moverId,
      rating,
      comment
    };
    
    this.reviewService.createReview(reviewData)
      .subscribe({
        next: () => {
          this.snackBar.open('Review submitted successfully', 'Close', { duration: 3000 });
          this.loadOrders();
        },
        error: (error) => {
          this.snackBar.open(error.message || 'Failed to submit review', 'Close', { duration: 5000 });
        }
      });
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
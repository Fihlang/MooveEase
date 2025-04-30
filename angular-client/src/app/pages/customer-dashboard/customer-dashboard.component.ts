import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  
  // For review submission
  reviewForm: FormGroup;
  selectedOrderId: number | null = null;
  selectedMoverId: number | null = null;
  isSubmittingReview = false;
  reviewSuccessMessage = '';
  reviewErrorMessage = '';
  
  constructor(
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Initialize review form
    this.reviewForm = this.formBuilder.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.maxLength(500)]]
    });
  }
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }
  
  // Get current date for comparison
  getCurrentDate(): Date {
    return new Date();
  }
  
  // Format date to display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }
  
  // Get readable status text
  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
  
  // Check if an order can be cancelled
  canCancelOrder(order: Order): boolean {
    return order.status === 'pending';
  }
  
  // Cancel an order
  cancelOrder(orderId: number): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.updateOrderStatus(orderId, 'cancelled').subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to cancel order. Please try again.';
        }
      });
    }
  }
  
  // Check if order can be reviewed
  canReviewOrder(order: Order): boolean {
    return order.status === 'completed' && order.moverId !== undefined;
  }
  
  // Open review form
  openReviewForm(orderId: number, moverId: number | undefined): void {
    if (moverId === undefined) {
      return;
    }
    
    this.selectedOrderId = orderId;
    this.selectedMoverId = moverId;
    this.reviewForm.reset({ rating: 5, comment: '' });
    this.reviewSuccessMessage = '';
    this.reviewErrorMessage = '';
  }
  
  // Close review form
  closeReviewForm(): void {
    this.selectedOrderId = null;
    this.selectedMoverId = null;
  }
  
  // Submit a review
  submitReview(): void {
    if (this.reviewForm.invalid || !this.selectedOrderId || !this.selectedMoverId) {
      return;
    }
    
    this.isSubmittingReview = true;
    this.reviewSuccessMessage = '';
    this.reviewErrorMessage = '';
    
    const reviewData = {
      orderId: this.selectedOrderId,
      moverId: this.selectedMoverId,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };
    
    this.orderService.createReview(reviewData).subscribe({
      next: () => {
        this.reviewSuccessMessage = 'Review submitted successfully!';
        this.isSubmittingReview = false;
        
        // Close form after short delay
        setTimeout(() => {
          this.closeReviewForm();
          this.loadOrders(); // Refresh orders to update UI
        }, 2000);
      },
      error: (error) => {
        this.reviewErrorMessage = error.message || 'Failed to submit review. Please try again.';
        this.isSubmittingReview = false;
      }
    });
  }
  
  // Navigate to booking page
  navigateToBooking(): void {
    this.router.navigate(['/booking']);
  }
}
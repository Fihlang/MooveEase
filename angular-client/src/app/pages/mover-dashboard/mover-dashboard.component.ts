import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-mover-dashboard',
  templateUrl: './mover-dashboard.component.html',
  styleUrls: ['./mover-dashboard.component.scss']
})
export class MoverDashboardComponent implements OnInit {
  assignedOrders: Order[] = [];
  availableOrders: Order[] = [];
  isLoadingAssigned = true;
  isLoadingAvailable = true;
  errorMessage = '';
  activeTab = 'assigned'; // 'assigned' or 'available'
  isAccepting = false;
  isUpdating = false;
  
  constructor(private orderService: OrderService) { }
  
  ngOnInit(): void {
    this.loadOrders();
  }
  
  loadOrders(): void {
    this.isLoadingAssigned = true;
    this.isLoadingAvailable = true;
    this.errorMessage = '';
    
    // Load assigned orders
    this.orderService.getMoverOrders().subscribe({
      next: (orders) => {
        this.assignedOrders = orders;
        this.isLoadingAssigned = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load your orders. Please try again.';
        this.isLoadingAssigned = false;
      }
    });
    
    // Load available orders
    this.orderService.getAvailableOrders().subscribe({
      next: (orders) => {
        this.availableOrders = orders;
        this.isLoadingAvailable = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load available orders. Please try again.';
        this.isLoadingAvailable = false;
      }
    });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
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
  
  // Accept an order
  acceptOrder(orderId: number): void {
    this.isAccepting = true;
    
    this.orderService.assignOrder(orderId).subscribe({
      next: () => {
        this.isAccepting = false;
        this.loadOrders(); // Refresh both lists
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to accept order. Please try again.';
        this.isAccepting = false;
      }
    });
  }
  
  // Start an order
  startOrder(orderId: number): void {
    this.isUpdating = true;
    
    this.orderService.updateOrderStatus(orderId, 'in_progress').subscribe({
      next: () => {
        this.isUpdating = false;
        this.loadOrders();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to start order. Please try again.';
        this.isUpdating = false;
      }
    });
  }
  
  // Complete an order
  completeOrder(orderId: number): void {
    this.isUpdating = true;
    
    this.orderService.updateOrderStatus(orderId, 'completed').subscribe({
      next: () => {
        this.isUpdating = false;
        this.loadOrders();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to complete order. Please try again.';
        this.isUpdating = false;
      }
    });
  }
  
  // Update tracking location (placeholder for real GPS tracking)
  updateTracking(orderId: number): void {
    // In a real implementation, this would get the current GPS location
    // and send it to the server
    const mockLocationData = {
      latitude: 40.7128, // Example latitude
      longitude: -74.0060 // Example longitude
    };
    
    this.orderService.updateTracking(orderId, mockLocationData).subscribe({
      next: () => {
        console.log('Location updated');
      },
      error: (error) => {
        console.error('Failed to update location', error);
      }
    });
  }
}
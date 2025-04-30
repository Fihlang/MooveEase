import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { Order, OrderStatus } from '../../models/order.model';
import { User, UserRole } from '../../models/user.model';
import { catchError, forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

interface UserStats {
  totalUsers: number;
  customers: number;
  movers: number;
  admins: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Tab control
  activeTab = 'orders';
  
  // User data
  users: User[] = [];
  filteredUsers: User[] = [];
  userRoleFilter = 'all';
  isLoadingUsers = false;
  usersError: string | null = null;
  
  // Order data
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  orderStatusFilter = 'all';
  isLoadingOrders = false;
  ordersError: string | null = null;
  
  // Summary stats
  userStats: UserStats = {
    totalUsers: 0,
    customers: 0,
    movers: 0,
    admins: 0
  };
  
  orderStats: OrderStats = {
    totalOrders: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0
  };

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoadingUsers = true;
    this.isLoadingOrders = true;
    
    // Using forkJoin to make parallel requests
    forkJoin({
      users: this.userService.getAllUsers().pipe(
        catchError(error => {
          this.usersError = error.message || 'Failed to load users';
          this.snackBar.open(this.usersError, 'Close', { duration: 5000 });
          this.isLoadingUsers = false;
          return [];
        })
      ),
      orders: this.orderService.getAllOrders().pipe(
        catchError(error => {
          this.ordersError = error.message || 'Failed to load orders';
          this.snackBar.open(this.ordersError, 'Close', { duration: 5000 });
          this.isLoadingOrders = false;
          return [];
        })
      )
    }).subscribe({
      next: ({ users, orders }) => {
        // Set users data
        this.users = users;
        this.filteredUsers = users;
        this.isLoadingUsers = false;
        
        // Set orders data
        this.orders = orders;
        this.filteredOrders = orders;
        this.isLoadingOrders = false;
        
        // Calculate stats
        this.calculateUserStats();
        this.calculateOrderStats();
      },
      error: (error) => {
        this.snackBar.open('Failed to load dashboard data', 'Close', { duration: 5000 });
        this.isLoadingUsers = false;
        this.isLoadingOrders = false;
      }
    });
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  // Filter users based on role
  filterUsers(): void {
    if (this.userRoleFilter === 'all') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user => user.role === this.userRoleFilter);
    }
  }
  
  // Filter orders based on status
  filterOrders(): void {
    if (this.orderStatusFilter === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.orderStatusFilter);
    }
  }
  
  // Calculate user statistics
  calculateUserStats(): void {
    this.userStats.totalUsers = this.users.length;
    this.userStats.customers = this.users.filter(user => user.role === UserRole.CUSTOMER).length;
    this.userStats.movers = this.users.filter(user => user.role === UserRole.MOVER).length;
    this.userStats.admins = this.users.filter(user => user.role === UserRole.ADMIN).length;
  }
  
  // Calculate order statistics
  calculateOrderStats(): void {
    this.orderStats.totalOrders = this.orders.length;
    this.orderStats.pendingOrders = this.orders.filter(order => order.status === 'pending').length;
    this.orderStats.acceptedOrders = this.orders.filter(order => order.status === 'accepted').length;
    this.orderStats.activeOrders = this.orders.filter(order => order.status === 'in_progress').length;
    this.orderStats.completedOrders = this.orders.filter(order => order.status === 'completed').length;
    this.orderStats.cancelledOrders = this.orders.filter(order => order.status === 'cancelled').length;
    
    // Calculate total revenue from completed orders
    this.orderStats.totalRevenue = this.orders
      .filter(order => order.status === 'completed' && order.price)
      .reduce((total, order) => total + (order.price || 0), 0);
  }
  
  // Format date for display
  formatDate(date: Date): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  }
  
  // Get CSS class for order status
  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
  
  // Get CSS class for user role
  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN: return 'role-admin';
      case UserRole.MOVER: return 'role-mover';
      case UserRole.CUSTOMER: return 'role-customer';
      default: return '';
    }
  }
}
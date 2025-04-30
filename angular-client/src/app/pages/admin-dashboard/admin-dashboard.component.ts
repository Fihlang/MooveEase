import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../models/order.model';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'orders'; // 'orders' or 'users'
  
  orders: Order[] = [];
  users: User[] = [];
  
  isLoadingOrders = true;
  isLoadingUsers = true;
  ordersError = '';
  usersError = '';
  
  // For filtering
  orderStatusFilter = 'all';
  userRoleFilter = 'all';
  
  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) { }
  
  ngOnInit(): void {
    this.loadOrders();
    this.loadUsers();
  }
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.ordersError = '';
    
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoadingOrders = false;
      },
      error: (error) => {
        this.ordersError = error.message || 'Failed to load orders. Please try again.';
        this.isLoadingOrders = false;
      }
    });
  }
  
  loadUsers(): void {
    this.isLoadingUsers = true;
    this.usersError = '';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        this.usersError = error.message || 'Failed to load users. Please try again.';
        this.isLoadingUsers = false;
      }
    });
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
  
  // Get role class for styling
  getRoleClass(role: string): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'role-admin';
      case UserRole.MOVER:
        return 'role-mover';
      case UserRole.CUSTOMER:
        return 'role-customer';
      default:
        return '';
    }
  }
  
  // Filter orders by status
  get filteredOrders(): Order[] {
    if (this.orderStatusFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(order => order.status === this.orderStatusFilter);
  }
  
  // Filter users by role
  get filteredUsers(): User[] {
    if (this.userRoleFilter === 'all') {
      return this.users;
    }
    return this.users.filter(user => user.role === this.userRoleFilter);
  }
  
  // Get statistics
  get orderStats() {
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    const activeOrders = this.orders.filter(o => o.status === 'accepted' || o.status === 'in_progress').length;
    const completedOrders = this.orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = this.orders.filter(o => o.status === 'cancelled').length;
    
    // Calculate total revenue from completed orders
    const totalRevenue = this.orders
      .filter(o => o.status === 'completed' && o.price)
      .reduce((sum, order) => sum + (order.price || 0), 0);
    
    return {
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue
    };
  }
  
  get userStats() {
    const totalUsers = this.users.length;
    const customers = this.users.filter(u => u.role === UserRole.CUSTOMER).length;
    const movers = this.users.filter(u => u.role === UserRole.MOVER).length;
    const admins = this.users.filter(u => u.role === UserRole.ADMIN).length;
    
    return {
      totalUsers,
      customers,
      movers,
      admins
    };
  }
}
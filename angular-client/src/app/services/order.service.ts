import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order, BookingRequest, TrackingUpdate } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }
  
  // Get all orders (admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to fetch orders'))
      );
  }
  
  // Get available orders (for movers)
  getAvailableOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/available`)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to fetch available orders'))
      );
  }
  
  // Get orders for current user (customer or mover)
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/user`)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to fetch your orders'))
      );
  }
  
  // Get order by ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to fetch order details'))
      );
  }
  
  // Create new order (customer)
  createOrder(bookingRequest: BookingRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, bookingRequest)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to create booking'))
      );
  }
  
  // Update order status (mover)
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${id}`, { status })
      .pipe(
        catchError(error => this.handleError(error, 'Failed to update order status'))
      );
  }
  
  // Accept order (mover)
  acceptOrder(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'accepted');
  }
  
  // Start job (mover)
  startJob(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'in_progress');
  }
  
  // Complete job (mover)
  completeJob(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'completed');
  }
  
  // Cancel order (customer)
  cancelOrder(id: number): Observable<Order> {
    return this.updateOrderStatus(id, 'cancelled');
  }
  
  // Send location update (mover)
  sendTrackingUpdate(trackingUpdate: TrackingUpdate): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tracking`, trackingUpdate)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to update location'))
      );
  }
  
  // Get tracking updates for an order
  getTrackingUpdates(orderId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tracking/${orderId}`)
      .pipe(
        catchError(error => this.handleError(error, 'Failed to fetch tracking updates'))
      );
  }
  
  // Error handling
  private handleError(error: any, message: string) {
    console.error(error);
    const errorMessage = error.error?.message || message;
    return throwError(() => new Error(errorMessage));
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookingRequest, Order, OrderSummary, TrackingUpdate } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;
  
  constructor(private http: HttpClient) { }
  
  // Get all orders (admin only)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
  
  // Get order summary statistics (admin only)
  getOrderSummary(): Observable<OrderSummary> {
    return this.http.get<OrderSummary>(`${this.apiUrl}/summary`);
  }
  
  // Get single order by ID
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }
  
  // Get orders for current customer
  getCustomerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/customer`);
  }
  
  // Get orders for current mover
  getMoverOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/mover`);
  }
  
  // Get available orders for movers to accept
  getAvailableOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/available`);
  }
  
  // Create a new order (booking)
  createOrder(orderData: BookingRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData);
  }
  
  // Update order status
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }
  
  // Assign mover to order
  assignMover(id: number, moverId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/assign`, { moverId });
  }
  
  // Update order tracking
  updateTracking(trackingData: TrackingUpdate): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${trackingData.orderId}/tracking`, trackingData);
  }
  
  // Get tracking history for an order
  getOrderTracking(orderId: number): Observable<TrackingUpdate[]> {
    return this.http.get<TrackingUpdate[]>(`${this.apiUrl}/${orderId}/tracking`);
  }
  
  // Cancel an order
  cancelOrder(id: number, reason?: string): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/cancel`, { reason });
  }
  
  // Complete an order
  completeOrder(id: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${id}/complete`, {});
  }
}
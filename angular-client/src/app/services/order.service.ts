import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { Review } from '../models/review.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) { }
  
  // Get all orders (Admin only)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load orders'));
        })
      );
  }
  
  // Get user's orders (both customer and mover based on auth)
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load your orders'));
        })
      );
  }
  
  // Get mover orders (for mover dashboard)
  getMoverOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/mover-orders`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load your mover orders'));
        })
      );
  }
  
  // Get available orders (for movers)
  getAvailableOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/available`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load available orders'));
        })
      );
  }
  
  // Get a specific order by ID
  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load order details'));
        })
      );
  }
  
  // Create a new order
  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to create order'));
        })
      );
  }
  
  // Update order status
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update order status'));
        })
      );
  }
  
  // Assign order to mover
  assignOrder(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders/${orderId}/assign`, {})
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to assign order'));
        })
      );
  }
  
  // Cancel order
  cancelOrder(orderId: number): Observable<Order> {
    return this.updateOrderStatus(orderId, 'cancelled');
  }
  
  // Get reviews for an order
  getOrderReviews(orderId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/orders/${orderId}/reviews`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load reviews'));
        })
      );
  }
  
  // Create a review
  createReview(reviewData: any): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, reviewData)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to submit review'));
        })
      );
  }
  
  // Update tracking info
  updateTracking(orderId: number, locationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/tracking`, locationData)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update tracking'));
        })
      );
  }
}
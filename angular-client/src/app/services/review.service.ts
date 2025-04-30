import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateReviewRequest, Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;
  
  constructor(private http: HttpClient) { }
  
  // Get reviews for a specific mover
  getMoverReviews(moverId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/mover/${moverId}`);
  }
  
  // Get review by ID
  getReview(id: number): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }
  
  // Get reviews for a specific order
  getOrderReview(orderId: number): Observable<Review | null> {
    return this.http.get<Review | null>(`${this.apiUrl}/order/${orderId}`);
  }
  
  // Create a new review
  createReview(reviewData: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, reviewData);
  }
  
  // Update an existing review
  updateReview(id: number, reviewData: Partial<CreateReviewRequest>): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${id}`, reviewData);
  }
}
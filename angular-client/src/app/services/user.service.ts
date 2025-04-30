import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) { }
  
  // Get all users (Admin only)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load users'));
        })
      );
  }
  
  // Get users by role
  getUsersByRole(role: UserRole): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || `Failed to load ${role} users`));
        })
      );
  }
  
  // Get user by ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load user details'));
        })
      );
  }
  
  // Update user data
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update user data'));
        })
      );
  }
  
  // Update user role (Admin only)
  updateUserRole(id: number, role: UserRole): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to update user role'));
        })
      );
  }
  
  // Get movers with highest ratings
  getTopMovers(limit: number = 5): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/movers/top?limit=${limit}`)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Failed to load top movers'));
        })
      );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Retrieve user from localStorage on init if exists
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  public get isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'admin';
  }

  public get isMover(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'mover';
  }

  public get isCustomer(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === 'customer';
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(user => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }

  register(userDetails: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, userDetails)
      .pipe(
        tap(user => {
          // Store user details and jwt token in local storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          // Remove user from local storage
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
        }),
        catchError(error => {
          console.error('Logout error:', error);
          // Even if the API call fails, clear the user from local storage
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
          return throwError(() => new Error(error.error?.message || 'Logout failed'));
        })
      );
  }

  refreshToken(): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/refresh-token`, {})
      .pipe(
        tap(user => {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          console.error('Token refresh error:', error);
          // If refresh fails, log the user out
          this.handleAuthError();
          return throwError(() => new Error(error.error?.message || 'Token refresh failed'));
        })
      );
  }

  // Handle authentication errors (expired token, etc.)
  private handleAuthError(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}
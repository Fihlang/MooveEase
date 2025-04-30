import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  login(loginRequest: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(user => {
          // Store user details and jwt token in local storage to keep user logged in
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }
  
  register(registerRequest: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, registerRequest)
      .pipe(
        tap(user => {
          // Auto login after registration
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }
  
  logout(): Observable<boolean> {
    // Call logout API
    return this.http.post<any>(`${this.apiUrl}/auth/logout`, {}).pipe(
      map(() => {
        // Remove user from local storage and set current user to null
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        return true;
      }),
      catchError(() => {
        // Ensure user is logged out locally even if API call fails
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        return of(true);
      })
    );
  }
  
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
  
  hasRole(requiredRole: string | string[]): boolean {
    const user = this.currentUserValue;
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  }
}
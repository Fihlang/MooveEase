import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.userSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.userSubject.next(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }
  
  public get userValue(): User | null {
    return this.userSubject.value;
  }
  
  register(name: string, email: string, username: string, password: string, role: UserRole = UserRole.CUSTOMER): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, {
      name, 
      email, 
      username, 
      password, 
      role
    }).pipe(
      tap(user => {
        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.userSubject.next(user);
        }
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Registration failed. Please try again.'));
      })
    );
  }
  
  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.userSubject.next(user);
          }
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Invalid username or password.'));
        })
      );
  }
  
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          localStorage.removeItem('currentUser');
          this.userSubject.next(null);
        }),
        catchError(error => {
          // Still clear local storage and user subject on error
          localStorage.removeItem('currentUser');
          this.userSubject.next(null);
          return throwError(() => new Error(error.error?.message || 'Logout failed.'));
        })
      );
  }
  
  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`)
      .pipe(
        tap(user => {
          if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.userSubject.next(user);
          }
        }),
        catchError(error => {
          if (error.status === 401) {
            localStorage.removeItem('currentUser');
            this.userSubject.next(null);
          }
          return throwError(() => new Error(error.error?.message || 'Failed to get user data.'));
        })
      );
  }
  
  isLoggedIn(): boolean {
    return !!this.userValue;
  }
  
  hasRole(requiredRole: UserRole | UserRole[]): boolean {
    const user = this.userValue;
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  }
}
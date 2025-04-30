import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`;
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    this.getCurrentUser().subscribe();
  }
  
  // Get the current user value without subscribing
  public get userValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  // Check if user is logged in
  public isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  
  // Check if user has specific role(s)
  public hasRole(roles: UserRole | UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    } else {
      return user.role === roles;
    }
  }
  
  // Register a new user
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }
  
  // Login user
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }
  
  // Logout user
  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      })
    );
  }
  
  // Get current user info
  getCurrentUser(): Observable<User | null> {
    return this.http.get<User>(`${this.apiUrl}/current-user`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      }),
      // If the request fails, handle the error gracefully
      map(user => user, () => {
        this.currentUserSubject.next(null);
        return null;
      })
    );
  }
}
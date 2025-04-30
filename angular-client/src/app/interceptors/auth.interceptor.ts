import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add withCredentials to every request to handle cookie-based auth
    // This ensures that cookies are sent with cross-domain requests
    request = request.clone({
      withCredentials: true
    });
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle authentication errors (401 Unauthorized)
        if (error.status === 401) {
          // Navigate to login page
          this.router.navigate(['/auth/login']);
        }
        
        // Handle forbidden errors (403 Forbidden)
        if (error.status === 403) {
          // Navigate to home page or access denied page
          this.router.navigate(['/']);
        }
        
        return throwError(() => error);
      })
    );
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLogin = true; // Default to login view
  loading = false;
  submitted = false;
  returnUrl: string = '/';
  error: string = '';
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // Initialize forms
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: [UserRole.CUSTOMER, Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    
    // Check if we should show registration form directly
    this.route.url.subscribe(segments => {
      if (segments.length > 0 && segments[0].path === 'register') {
        this.isLogin = false;
      }
    });
  }
  
  // Custom validator to check if passwords match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  
  // Convenience getters for easy access to form fields
  get lf() { return this.loginForm.controls; }
  get rf() { return this.registerForm.controls; }
  
  onLoginSubmit() {
    this.submitted = true;
    
    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.authService.login({
      username: this.lf['username'].value,
      password: this.lf['password'].value
    }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.error = error;
        this.loading = false;
      }
    });
  }
  
  onRegisterSubmit() {
    this.submitted = true;
    
    // Stop if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Create user object from form values
    this.authService.register({
      name: this.rf['name'].value,
      email: this.rf['email'].value,
      username: this.rf['username'].value,
      password: this.rf['password'].value,
      role: this.rf['role'].value
    }).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: error => {
        this.error = error;
        this.loading = false;
      }
    });
  }
  
  toggleView() {
    this.isLogin = !this.isLogin;
    this.submitted = false;
    this.error = '';
  }
}
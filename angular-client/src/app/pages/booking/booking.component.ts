import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { BookingRequest } from '../../models/order.model';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  bookingForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  // Define furniture types for dropdown
  furnitureTypes = [
    { value: 'sofa', label: 'Sofa / Couch' },
    { value: 'bed', label: 'Bed' },
    { value: 'table', label: 'Table' },
    { value: 'chair', label: 'Chair / Stool' },
    { value: 'cabinet', label: 'Cabinet / Wardrobe' },
    { value: 'appliance', label: 'Large Appliance' },
    { value: 'mixed', label: 'Multiple Items' }
  ];
  
  // Define time slots for pickup
  timeSlots = [
    { value: 'morning', label: 'Morning (8AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
    { value: 'evening', label: 'Evening (4PM - 8PM)' }
  ];
  
  constructor(
    private orderService: OrderService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // Initialize booking form
    this.bookingForm = this.formBuilder.group({
      pickupAddress: ['', [Validators.required]],
      dropoffAddress: ['', [Validators.required]],
      pickupDate: ['', [Validators.required]],
      preferredTime: ['morning', [Validators.required]],
      furnitureType: ['', [Validators.required]],
      furnitureDetails: [''],
      specialInstructions: ['']
    });
  }
  
  ngOnInit(): void {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.bookingForm.get('pickupDate')?.setValue(this.formatDate(tomorrow));
  }
  
  // Format date to YYYY-MM-DD for date input
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  onSubmit(): void {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    
    // Form validation
    if (this.bookingForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Prepare the booking request
    const bookingRequest: BookingRequest = {
      pickupAddress: this.bookingForm.value.pickupAddress,
      dropoffAddress: this.bookingForm.value.dropoffAddress,
      pickupDate: new Date(this.bookingForm.value.pickupDate),
      preferredTime: this.bookingForm.value.preferredTime,
      furnitureType: this.bookingForm.value.furnitureType,
      furnitureDetails: this.bookingForm.value.furnitureDetails,
      specialInstructions: this.bookingForm.value.specialInstructions
    };
    
    // Submit the booking request
    this.orderService.createOrder(bookingRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Booking created successfully!';
        this.isSubmitting = false;
        
        // Reset form after successful submission
        this.bookingForm.reset();
        
        // Set default values again
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.bookingForm.patchValue({
          pickupDate: this.formatDate(tomorrow),
          preferredTime: 'morning'
        });
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          this.router.navigate(['/customer-dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create booking. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
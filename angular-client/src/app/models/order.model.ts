export interface Order {
  id: number;
  customerId: number;
  moverId?: number;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: Date;
  preferredTime: string;
  furnitureType: string;
  furnitureDetails?: string;
  specialInstructions?: string;
  status: OrderStatus;
  price?: number;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}

export type OrderStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed';

export interface BookingRequest {
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: Date;
  preferredTime: string;
  furnitureType: string;
  furnitureDetails?: string;
  specialInstructions?: string;
}

export interface TrackingUpdate {
  orderId: number;
  locationData: {
    latitude: number;
    longitude: number;
  };
}
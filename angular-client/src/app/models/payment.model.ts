export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  status: PaymentStatus;
  createdAt: Date;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentRequest {
  orderId: number;
  amount: number;
  paymentMethod: string;
}
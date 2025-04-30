export interface Review {
  id: number;
  orderId: number;
  customerId: number;
  moverId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ReviewRequest {
  orderId: number;
  moverId: number;
  rating: number;
  comment?: string;
}
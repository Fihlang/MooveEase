export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password?: string; // Only included in registration, not in responses
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number;
  reviewCount?: number;
}

export enum UserRole {
  CUSTOMER = 'customer',
  MOVER = 'mover',
  ADMIN = 'admin'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role?: UserRole;
}
export enum UserRole {
  CUSTOMER = 'customer',
  MOVER = 'mover',
  ADMIN = 'admin'
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  bio?: string;
  isActive: boolean;
  rating?: number;
  ratingCount?: number;
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  address?: string;
  bio?: string;
}
import { users, type User, type InsertUser, orders, type Order, type InsertOrder, reviews, type Review, type InsertReview, tracking, type Tracking, type InsertTracking, payments, type Payment, type InsertPayment, UserRole } from "@shared/schema";
import { nanoid } from "nanoid";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByMover(moverId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByMover(moverId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Tracking operations
  getTracking(orderId: number): Promise<Tracking[]>;
  createTracking(tracking: InsertTracking): Promise<Tracking>;
  
  // Payment operations
  getPayment(orderId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private reviews: Map<number, Review>;
  private trackings: Map<number, Tracking>;
  private payments: Map<number, Payment>;
  private userIdCounter: number;
  private orderIdCounter: number;
  private reviewIdCounter: number;
  private trackingIdCounter: number;
  private paymentIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.reviews = new Map();
    this.trackings = new Map();
    this.payments = new Map();
    this.userIdCounter = 1;
    this.orderIdCounter = 1;
    this.reviewIdCounter = 1;
    this.trackingIdCounter = 1;
    this.paymentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "adminpass",
      email: "admin@moveease.com",
      fullName: "Admin User",
      role: UserRole.ADMIN
    });
    
    // Create sample mover
    this.createUser({
      username: "mover1",
      password: "moverpass",
      email: "mover1@moveease.com",
      fullName: "John Mover",
      phone: "555-123-4567",
      role: UserRole.MOVER,
      address: "123 Mover St, City",
      bio: "Professional mover with 5 years of experience",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id, 
      createdAt: now, 
      rating: 0, 
      ratingCount: 0, 
      isActive: true 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.customerId === customerId
    );
  }
  
  async getOrdersByMover(moverId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      order => order.moverId === moverId
    );
  }
  
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderIdCounter++;
    const now = new Date();
    
    const order: Order = {
      ...orderData,
      id,
      moverId: null,
      status: "pending",
      price: this.calculateEstimatedPrice(orderData.furnitureType),
      distance: 0, // Would calculate from pickupAddress to dropoffAddress in real implementation
      paymentStatus: "pending",
      createdAt: now,
      updatedAt: now
    };
    
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      ...data,
      updatedAt: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByMover(moverId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.moverId === moverId
    );
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    
    const review: Review = {
      ...reviewData,
      id,
      createdAt: now
    };
    
    this.reviews.set(id, review);
    
    // Update mover's rating
    const mover = await this.getUser(reviewData.moverId);
    if (mover) {
      const totalRating = mover.rating * mover.ratingCount + reviewData.rating;
      const newRatingCount = mover.ratingCount + 1;
      const newRating = totalRating / newRatingCount;
      
      await this.updateUser(mover.id, {
        rating: newRating,
        ratingCount: newRatingCount
      });
    }
    
    return review;
  }
  
  // Tracking operations
  async getTracking(orderId: number): Promise<Tracking[]> {
    return Array.from(this.trackings.values()).filter(
      tracking => tracking.orderId === orderId
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createTracking(trackingData: InsertTracking): Promise<Tracking> {
    const id = this.trackingIdCounter++;
    const now = new Date();
    
    const tracking: Tracking = {
      ...trackingData,
      id,
      timestamp: now
    };
    
    this.trackings.set(id, tracking);
    return tracking;
  }
  
  // Payment operations
  async getPayment(orderId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      payment => payment.orderId === orderId
    );
  }
  
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const now = new Date();
    
    const payment: Payment = {
      ...paymentData,
      id,
      status: "pending",
      timestamp: now
    };
    
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const payment = Array.from(this.payments.values()).find(p => p.id === id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...data };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Helper methods
  private calculateEstimatedPrice(furnitureType: string): number {
    switch (furnitureType) {
      case "small":
        return 29.99;
      case "medium":
        return 49.99;
      case "large":
        return 79.99;
      case "specialty":
        return 99.99;
      case "multiple":
        return 129.99;
      default:
        return 39.99;
    }
  }
}

export const storage = new MemStorage();

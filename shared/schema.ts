import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User role enum
export enum UserRole {
  CUSTOMER = "customer",
  MOVER = "mover",
  ADMIN = "admin",
}

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default(UserRole.CUSTOMER),
  address: text("address"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
  rating: doublePrecision("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  isActive: boolean("is_active").default(true),
});

// Furniture move order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  moverId: integer("mover_id"),
  status: text("status").notNull().default("pending"), // pending, accepted, in_progress, completed, cancelled
  pickupAddress: text("pickup_address").notNull(),
  dropoffAddress: text("dropoff_address").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  preferredTime: text("preferred_time"),
  furnitureType: text("furniture_type").notNull(),
  furnitureDetails: text("furniture_details"),
  furnitureImages: text("furniture_images"),
  specialInstructions: text("special_instructions"),
  price: doublePrecision("price"),
  distance: doublePrecision("distance"),
  paymentStatus: text("payment_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  moverId: integer("mover_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Location tracking schema
export const tracking = pgTable("tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  moverId: integer("mover_id").notNull(),
  locationData: json("location_data").notNull(), // {latitude, longitude}
  timestamp: timestamp("timestamp").defaultNow(),
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  rating: true,
  ratingCount: true,
  isActive: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  moverId: true,
  status: true,
  price: true,
  distance: true,
  paymentStatus: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertTrackingSchema = createInsertSchema(tracking).omit({
  id: true,
  timestamp: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  status: true,
  timestamp: true,
});

// Custom login schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Tracking = typeof tracking.$inferSelect;
export type InsertTracking = z.infer<typeof insertTrackingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

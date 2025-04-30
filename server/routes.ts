import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hasRole } from "./auth";
import { UserRole, insertOrderSchema, insertReviewSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Error handler for zod validation errors
  const handleZodError = (error: any, res: any) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    throw error;
  };

  // --- User Routes ---
  
  // Get all movers
  app.get("/api/movers", async (req, res) => {
    try {
      const movers = await storage.getUsersByRole(UserRole.MOVER);
      // Remove passwords
      const moversWithoutPasswords = movers.map(({ password, ...mover }) => mover);
      res.json(moversWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch movers" });
    }
  });
  
  // Get specific user profile
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only send sensitive info if it's the current user or an admin
      if (req.user.id === user.id || req.user.role === UserRole.ADMIN) {
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      } else {
        // For other users, only send public info
        const { password, email, phone, ...publicUser } = user;
        return res.json(publicUser);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update user profile
  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if it's current user or admin
      if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Don't allow role change unless admin
      if (req.body.role && req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: "Cannot change role" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // --- Order Routes ---
  
  // Create new order
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertOrderSchema.parse(req.body);
      
      // Create order
      const order = await storage.createOrder({
        ...validatedData,
        customerId: req.user.id
      });
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  // Get all orders (admin only)
  app.get("/api/orders", isAuthenticated, hasRole(UserRole.ADMIN), async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get user's orders
  app.get("/api/user/orders", isAuthenticated, async (req, res) => {
    try {
      let orders;
      
      if (req.user.role === UserRole.CUSTOMER) {
        orders = await storage.getOrdersByCustomer(req.user.id);
      } else if (req.user.role === UserRole.MOVER) {
        orders = await storage.getOrdersByMover(req.user.id);
      } else if (req.user.role === UserRole.ADMIN) {
        orders = await storage.getAllOrders();
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  
  // Get specific order
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user is allowed to see this order
      if (
        order.customerId !== req.user.id &&
        order.moverId !== req.user.id &&
        req.user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  
  // Update order status (mover or admin)
  app.patch("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Validate permissions
      if (req.user.role === UserRole.CUSTOMER && order.customerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (req.user.role === UserRole.MOVER) {
        // If order doesn't have a mover yet, assign this mover
        if (!order.moverId && req.body.status === "accepted") {
          req.body.moverId = req.user.id;
        } 
        // Otherwise check if this mover is assigned to the order
        else if (order.moverId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const updatedOrder = await storage.updateOrder(orderId, req.body);
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  
  // --- Review Routes ---
  
  // Create review for a completed order
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      // Validate request
      const validatedData = insertReviewSchema.parse(req.body);
      
      // Verify that the user is the customer of this order
      const order = await storage.getOrder(validatedData.orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.customerId !== req.user.id) {
        return res.status(403).json({ message: "You can only review your own orders" });
      }
      
      if (order.status !== "completed") {
        return res.status(400).json({ message: "You can only review completed orders" });
      }
      
      // Check if review already exists
      const existingReviews = await storage.getReviewsByMover(validatedData.moverId);
      const alreadyReviewed = existingReviews.some(review => review.orderId === validatedData.orderId);
      
      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this order" });
      }
      
      // Create review
      const review = await storage.createReview({
        ...validatedData,
        customerId: req.user.id
      });
      
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error, res);
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  // Get reviews for a mover
  app.get("/api/movers/:id/reviews", async (req, res) => {
    try {
      const moverId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByMover(moverId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // --- Tracking Routes ---
  
  // Update tracking location (mover only)
  app.post("/api/tracking", isAuthenticated, hasRole(UserRole.MOVER), async (req, res) => {
    try {
      const { orderId, locationData } = req.body;
      
      if (!orderId || !locationData) {
        return res.status(400).json({ message: "Invalid tracking data" });
      }
      
      // Verify order belongs to this mover
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.moverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Create tracking record
      const tracking = await storage.createTracking({
        orderId,
        moverId: req.user.id,
        locationData
      });
      
      res.status(201).json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tracking" });
    }
  });
  
  // Get tracking updates for an order
  app.get("/api/orders/:id/tracking", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      // Verify user has access to this order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (
        order.customerId !== req.user.id &&
        order.moverId !== req.user.id &&
        req.user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const tracking = await storage.getTracking(orderId);
      res.json(tracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracking data" });
    }
  });
  
  // --- Payment Routes (mock) ---
  
  // Process payment for an order
  app.post("/api/payments", isAuthenticated, hasRole(UserRole.CUSTOMER), async (req, res) => {
    try {
      const { orderId, amount, paymentMethod } = req.body;
      
      if (!orderId || !amount || !paymentMethod) {
        return res.status(400).json({ message: "Invalid payment data" });
      }
      
      // Verify order belongs to this customer
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.customerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Check if payment already exists
      const existingPayment = await storage.getPayment(orderId);
      
      if (existingPayment && existingPayment.status === "completed") {
        return res.status(400).json({ message: "Payment already completed" });
      }
      
      // Create/update payment
      let payment;
      if (existingPayment) {
        payment = await storage.updatePayment(existingPayment.id, {
          amount,
          paymentMethod,
          status: "completed",
          transactionId: `tr_${Date.now()}`
        });
      } else {
        payment = await storage.createPayment({
          orderId,
          customerId: req.user.id,
          amount,
          paymentMethod,
          transactionId: `tr_${Date.now()}`
        });
        
        // Update payment status to completed (mock successful payment)
        payment = await storage.updatePayment(payment.id, { status: "completed" });
      }
      
      // Update order payment status
      await storage.updateOrder(orderId, { paymentStatus: "completed" });
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  
  // Get payment details for an order
  app.get("/api/orders/:id/payment", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      // Verify user has access to this order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (
        order.customerId !== req.user.id &&
        order.moverId !== req.user.id &&
        req.user.role !== UserRole.ADMIN
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const payment = await storage.getPayment(orderId);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}

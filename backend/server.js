const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");
const { checkDB } = require("./config/db");
const mongoose = require("mongoose");
const logger = require("./config/logger");
const redis = require("./config/redis");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Route imports
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const delhiveryRoutes = require("./routes/delhiveryRoutes");
const contactRoutes = require("./routes/contactRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Trust proxy (required for rate limiting behind reverse proxy like Nginx)
app.set("trust proxy", 1);

// Helmet - Sets security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS - Restrict to allowed origins only
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Compression - Gzip responses
app.use(compression());

// Rate Limiting - Prevent brute force and DDoS
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/auth", authLimiter);

// Stricter rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many payment requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/payment", paymentLimiter);

// Body parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// ============================================
// DB DEPENDENCY CHECK MIDDLEWARE
// ============================================
const requireDB = (req, res, next) => {
  if (!checkDB()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable. Please whitelist your IP on MongoDB Atlas, or check your MONGO_URI configuration.",
      code: "DB_UNAVAILABLE",
    });
  }
  next();
};

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const redisStatus = redis.status === "ready" ? "connected" : "disconnected";

  res.status(dbStatus === "connected" ? 200 : 503).json({
    success: dbStatus === "connected",
    message: dbStatus === "connected" ? "Nayamo API is healthy" : "Database unavailable",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    redis: redisStatus,
    uptime: process.uptime(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Nayamo API Running");
});

// ============================================
// API ROUTES (Versioned - with DB check)
// ============================================
app.use("/api/v1/auth", requireDB, authRoutes);
app.use("/api/v1/admin", requireDB, adminRoutes);
app.use("/api/v1/cart", requireDB, cartRoutes);
app.use("/api/v1/wishlist", requireDB, wishlistRoutes);
app.use("/api/v1/orders", requireDB, orderRoutes);
app.use("/api/v1/products", requireDB, productRoutes);
app.use("/api/v1/payment", requireDB, paymentRoutes);
app.use("/api/v1/delhivery", requireDB, delhiveryRoutes);

// Stricter rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many contact form submissions. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/contact", contactLimiter);
app.use("/api/v1/contact", requireDB, contactRoutes);

// Reviews routes (public for product reviews, admin for management)
app.use("/api/v1/reviews", reviewRoutes);

// Webhook rate limiter
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many webhook requests" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Razorpay webhook (must be raw body for signature verification)
app.post("/webhook/razorpay", webhookLimiter, express.raw({ type: "application/json" }), (req, res) => {
  const crypto = require("crypto");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    logger.error("Razorpay webhook secret not configured");
    return res.status(503).send("Webhook not configured");
  }

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(req.body);
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    logger.warn("Invalid Razorpay webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body);
  logger.info(`Razorpay webhook received: ${event.event}`);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const Order = require("./models/Order");
    Order.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      { paymentStatus: "paid", isPaid: true, paidAt: new Date(), razorpayPaymentId: payment.id },
      { new: true }
    ).catch((err) => logger.error("Webhook order update failed:", err.message));
  }

  res.status(200).send("OK");
});

// ============================================
// ERROR HANDLING (Must be last)
// ============================================
app.use(notFound);
app.use(errorHandler);

// Socket.IO Real-time Server (logger already imported)
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Notification = require('./models/Notification');

// Create HTTP server for Socket.IO
const httpServer = require('http').createServer(app);

// Initialize Socket.IO with CORS matching Express
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO Auth Middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.replace('Bearer ', '');
  
  if (!token) return next(new Error('Authentication required'));
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return next(new Error('Admin access required'));
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

// Admin Namespace - Isolated for security
const adminNamespace = io.of('/admin');
adminNamespace.use(socketAuth);

// Handle admin connections
adminNamespace.on('connection', (socket) => {
  logger.info(`Admin ${socket.user.id} connected via Socket.IO`);
  
  // Join admin room
  socket.join(`admin_${socket.user.id}`);
  
  // Send existing unread notifications
  Notification.find({ adminId: socket.user.id, isRead: false })
    .sort({ createdAt: -1 })
    .limit(10)
    .then(notifs => {
      socket.emit('notifications', notifs);
    });
  
  // Listen for ack
  socket.on('notification:read', async (notificationId) => {
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    socket.emit('notification:read:ack', notificationId);
  });
  
  // Connection cleanup
  socket.on('disconnect', () => {
    logger.info(`Admin ${socket.user.id} disconnected`);
  });
});

// Global event emitters for other services
const emitToAdmins = (event, data) => {
  adminNamespace.emit(event, data);
};

// Make emitters globally available
global.emitToAdmins = emitToAdmins;
global.io = io;

// ============================================
// SERVER START
// ============================================
const startServer = async () => {
  try {
    const requiredEnvVars = [
      "MONGO_URI",
      "JWT_SECRET",
      "JWT_REFRESH_SECRET",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ];

    if (process.env.NODE_ENV === "production") {
      requiredEnvVars.push("RAZORPAY_WEBHOOK_SECRET");
    }

    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      logger.warn("RAZORPAY_WEBHOOK_SECRET is not configured. Razorpay webhooks are disabled.");
    }

    // Try to connect DB but don't block server start
    const dbConnected = await connectDB();

    const server = httpServer.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
      if (!dbConnected) {
        logger.warn("⚠️ Server started WITHOUT database connection. Login and other DB-dependent routes will return 503 until MongoDB is available.");
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        try {
          await mongoose.connection.close(false);
          logger.info("MongoDB connection closed.");
          await redis.quit();
          logger.info("Redis connection closed.");
          process.exit(0);
        } catch (err) {
          logger.error("Error during shutdown:", err);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (err) => {
      logger.error("UNCAUGHT EXCEPTION! Shutting down...");
      logger.error(err.name, err.message);
      process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
      logger.error("UNHANDLED REJECTION! Shutting down...");
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    logger.error("Server Start Error: %s", error.message);
    process.exit(1);
  }
};

startServer();

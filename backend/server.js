const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const morgan = require("morgan");
const compression = require("compression");
require("dotenv").config();

const connectDB = require("./config/db");
const mongoose = require("mongoose");
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
  : ["http://localhost:3000"];

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

// Custom MongoDB sanitization (express-mongo-sanitize v2 is incompatible with Express 5)
const sanitizeMongo = (obj) => {
  if (typeof obj === "string") {
    // Remove MongoDB operators like $gt, $lt, $ne, etc.
    return obj.replace(/\$[a-zA-Z]+/g, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongo);
  }
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Remove keys that start with $ (MongoDB operators)
        if (!key.startsWith("$")) {
          clean[key] = sanitizeMongo(obj[key]);
        }
      }
    }
    return clean;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeMongo(req.body);
  if (req.params) req.params = sanitizeMongo(req.params);
  next();
});

// Custom XSS sanitization middleware (Express 5 compatible)
const sanitizeXSS = (obj) => {
  if (typeof obj === "string") {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<\/?[^>]+(>|$)/g, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeXSS);
  }
  if (obj && typeof obj === "object") {
    const clean = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clean[key] = sanitizeXSS(obj[key]);
      }
    }
    return clean;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeXSS(req.body);
  if (req.params) req.params = sanitizeXSS(req.params);
  next();
});

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Request logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ============================================
// HEALTH CHECK
// ============================================
app.get("/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  res.status(200).json({
    success: true,
    message: "Nayamo API is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    uptime: process.uptime(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.send("Nayamo API Running");
});

// ============================================
// API ROUTES (Versioned)
// ============================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/delhivery", delhiveryRoutes);

// ============================================
// ERROR HANDLING (Must be last)
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================
const startServer = async () => {
  try {
    // Validate critical environment variables
    const requiredEnvVars = [
      "MONGO_URI",
      "JWT_SECRET",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ];

    const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // JWT_REFRESH_SECRET fallback (uses JWT_SECRET if not set - not ideal for production but prevents crash)
    if (!process.env.JWT_REFRESH_SECRET) {
      console.warn("⚠️  JWT_REFRESH_SECRET not set, falling back to JWT_SECRET. Set a separate JWT_REFRESH_SECRET for production.");
      process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET;
    }

    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log("HTTP server closed.");
        try {
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("Error during shutdown:", err);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION! Shutting down...");
      console.error(err.name, err.message);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Server Start Error:", error.message);
    process.exit(1);
  }
};

startServer();

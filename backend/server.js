require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require('socket.io');
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const logger = require("./config/logger");
const connectDB = require("./config/db");
const { checkDB } = require("./config/db");
const redis = require("./config/redis");

// Routes
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

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

// ================= CORS CONFIGURATION =================
// Production CORS - multi-origin + credentials + preflight
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [
      // Local development
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      // Production
      "https://nayamo-client.vercel.app",
      "https://nayamo-admin.vercel.app",
    ];

const corsOptions = {
  // Dynamic origin validation (not wildcard "*")
  origin: (origin, callback) => {
    // Allow requests without origin (server-to-server, mobile clients)
    if (!origin) {
      return callback(null, true);
    }
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn(`CORS origin denied: ${origin}`);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],

  // Allowed request headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Accept-Language",
    "Content-Language",
    "X-CSRF-Token",
  ],

  // Expose response headers to frontend if needed
  exposedHeaders: [
    "X-Total-Count",
    "X-Page-Number",
    "X-Total-Pages",
    "Content-Disposition",
  ],

  // Preflight caching (in seconds)
  maxAge: 86400, // 24 hours

  // Don't pass CORS preflight response to next handler
  preflightContinue: false,

  // HTTP 204 for successful OPTIONS requests
  optionsSuccessStatus: 204,
};

const PORT = process.env.PORT || 5000;

logger.info("🚀 Starting Nayamo server...");

// ================= SECURITY =================
app.set("trust proxy", 1);

// ⚠️ CRITICAL: Apply CORS BEFORE any other middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

app.use(helmet({
  contentSecurityPolicy: false, // Disable for CRA/Craco compatibility
  crossOriginResourcePolicy: false, // Allow CORS
}));

// ================= SOCKET.IO SETUP =================
// Socket.IO CORS must align with Express CORS
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`Socket.IO CORS origin denied: ${origin}`);
      return callback(new Error(`Socket.IO CORS origin not allowed: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Global emit helper
global.emitToAdmins = (event, data) => {
  io.of('/admin').emit(event, data);
};

// Make io available globally
global.io = io;

logger.info(`✅ CORS Origins enabled: ${corsOrigins.join(', ')}`);

// ================= BODY PARSERS & SECURITY =================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(hpp());

// ================= LOGGING =================
app.use(morgan("combined", { stream: { write: msg => logger.info(msg.trim()) } }));

// ================= RATE LIMIT =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1', apiLimiter);

// ================= DB CHECK =================
const requireDB = (req, res, next) => {
  if (!checkDB()) {
    return res.status(503).json({
      success: false,
      message: "Database temporarily unavailable"
    });
  }
  next();
};

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: Date.now(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redis?.status === 'ready' ? "connected" : "disconnected",
    services: {
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      delhivery: !!process.env.DELHIVERY_API_KEY,
      corsOrigins: corsOrigins.length
    }
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Nayamo API v1.0 - Production Ready 🚀",
    docs: "https://nayamo.onrender.com/health",
    endpoints: "/api/v1/"
  });
});

// ================= ROUTES =================
app.use("/api/v1/products", requireDB, productRoutes);
app.use("/api/v1/auth", requireDB, authRoutes);
app.use("/api/v1/cart", requireDB, cartRoutes);
app.use("/api/v1/wishlist", requireDB, wishlistRoutes);
app.use("/api/v1/orders", requireDB, orderRoutes);
app.use("/api/v1/reviews", requireDB, reviewRoutes);
app.use("/api/v1/contact", requireDB, contactRoutes);
app.use("/api/v1/admin", requireDB, adminRoutes);

// ================= OPTIONAL SERVICES =================
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  app.use("/api/v1/payment", requireDB, paymentRoutes);
  logger.info("✅ Razorpay enabled");
}
if (process.env.DELHIVERY_API_KEY) {
  app.use("/api/v1/delhivery", requireDB, delhiveryRoutes);
  logger.info("✅ Delhivery enabled");
}

// ================= ERROR HANDLING =================
app.use(notFound);
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    const required = ["MONGO_URI", "JWT_SECRET", "CORS_ORIGINS"];
    const missing = required.filter(v => !process.env[v]);
    if (missing.length) {
      logger.error(`Missing required env vars: ${missing.join(', ')}`);
      process.exit(1);
    }

    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

  } catch (err) {
    logger.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();

// ================= GRACEFUL SHUTDOWN =================
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

async function shutDown() {
  logger.info('Shutting down gracefully...');
  await mongoose.connection.close();
  if (redis) await redis.quit();
  process.exit(0);
}


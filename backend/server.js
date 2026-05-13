require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
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
const { getDelhiveryToken, isConfigured } = require("./config/env");

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
const imageRoutes = require("./routes/imageRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

logger.info("Starting Nayamo server...");

// ================= ENV VALIDATION =================
const requiredEnv = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  logger.error(`❌ Missing env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// ================= CORS =================
const defaultCorsOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const corsOrigins = (process.env.CORS_ORIGINS || defaultCorsOrigins.join(","))
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowVercelPreview = process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === "true";

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, "");

    let hostname = "";
    try {
      hostname = new URL(normalizedOrigin).hostname;
    } catch (_err) {
      return callback(new Error("Invalid CORS origin"));
    }

    if (
      corsOrigins.includes(normalizedOrigin) ||
      (allowVercelPreview && /\.vercel\.app$/.test(hostname))
    ) {
      return callback(null, true);
    }

    logger.warn(`Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// 🔥 APPLY FIRST
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

logger.info(`✅ CORS Origins: ${corsOrigins.join(", ")}`);

// ================= SECURITY =================
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(compression());
app.use("/api/v1/webhook", webhookRoutes);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(mongoSanitize());
app.use(hpp());

// ================= LOGGING =================
app.use(
  morgan("combined", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ================= RATE LIMIT =================
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: 10,
  message: { success: false, message: "Too many login attempts" },
});

const passwordResetLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.PASSWORD_RESET_RATE_LIMIT_MAX) || 5,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 500,
});

app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/forgot-password", passwordResetLimiter);
app.use("/api/v1/auth/forgotPassword", passwordResetLimiter);
app.use("/api/v1/auth/reset-password", passwordResetLimiter);
app.use("/api/v1/auth/resetPassword", passwordResetLimiter);
app.use("/api/v1", apiLimiter);

// ================= SOCKET.IO =================
const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
    credentials: true,
  },
});

global.io = io;

// ================= DB CHECK =================
const requireDB = (req, res, next) => {
  if (!checkDB()) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
  next();
};

// ================= ROOT (IMPORTANT) =================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Nayamo API is running",
  });
});

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1,
    uptime: process.uptime(),
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
app.use("/api/v1/images", imageRoutes);

if (
  isConfigured(process.env.RAZORPAY_KEY_ID) &&
  isConfigured(process.env.RAZORPAY_KEY_SECRET)
) {
  app.use("/api/v1/payment", requireDB, paymentRoutes);
}

if (isConfigured(getDelhiveryToken())) {
  app.use("/api/v1/delhivery", requireDB, delhiveryRoutes);
}

// ================= ERRORS =================
app.use(notFound);
app.use(errorHandler);

// ================= START =================
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
      logger.info(
        `✅ Server running on port ${PORT} (${process.env.NODE_ENV})`
      );
    });
  } catch (err) {
    logger.error("❌ Server failed:", err);
    process.exit(1);
  }
};

startServer();

// ================= SHUTDOWN =================
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function shutdown() {
  logger.info("🛑 Shutting down...");
  await mongoose.connection.close();
  if (redis) await redis.quit();
  process.exit(0);
}

require("dotenv").config();

const express = require("express");
const http = require("http");
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
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting Nayamo server...");

// ================= SECURITY =================
app.set("trust proxy", 1);

app.use(helmet());

const corsOrigins = (process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());

// ================= LOGGING =================
app.use(morgan("dev"));

// ================= RATE LIMIT =================
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
}));

// ================= DB CHECK =================
const requireDB = (req, res, next) => {
  if (!checkDB()) {
    return res.status(503).json({
      success: false,
      message: "Database not connected"
    });
  }
  next();
};

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    redis: redis ? "enabled" : "disabled"
  });
});

app.get("/", (req, res) => {
  res.send("Nayamo API Running 🚀");
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

// Razorpay (optional)
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  app.use("/api/v1/payment", requireDB, paymentRoutes);
  logger.info("✅ Razorpay enabled");
} else {
  logger.warn("⚠️ Razorpay disabled (no keys)");
}

// Delhivery (optional)
if (process.env.DELHIVERY_API_KEY) {
  app.use("/api/v1/delhivery", requireDB, delhiveryRoutes);
  logger.info("✅ Delhivery enabled");
} else {
  logger.warn("⚠️ Delhivery disabled (no API key)");
}

// ================= ERROR =================
app.use(notFound);
app.use(errorHandler);

// ================= START SERVER =================
const startServer = async () => {
  try {
    // Required env (minimum)
    const required = ["MONGO_URI", "JWT_SECRET"];

    const missing = required.filter(v => !process.env[v]);

    if (missing.length > 0) {
      console.warn("⚠️ Missing ENV:", missing.join(", "));
    }

    // Connect DB
    const db = await connectDB();

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Mode: ${process.env.NODE_ENV || "development"}`);
      if (!db) {
        console.warn("⚠️ DB not connected");
      }
    });

  } catch (err) {
    console.error("❌ Server Crash:", err);
    process.exit(1);
  }
};

startServer();

// ================= SHUTDOWN =================
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await mongoose.connection.close();

  if (redis) {
    try {
      await redis.quit();
    } catch (e) {
      console.error("Redis close error");
    }
  }

  process.exit(0);
});
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

const connectDB = require("./config/db");
const logger = require("./config/logger");

// Import routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting Nayamo Backend v2.0...");

// ================= SECURITY =================
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());

// ================= LOGGING =================
app.use(morgan("combined", { stream: { write: msg => logger.info(msg.trim()) } }));

// ================= RATE LIMIT =================
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Nayamo API v2.0 - Ready 🚀",
    endpoints: ["/api/v1/products", "/api/v1/auth", "/api/v1/cart", "/api/v1/orders"]
  });
});

// ================= ROUTES =================
app.use("/api/v1/products", connectDB, productRoutes);
app.use("/api/v1/auth", connectDB, authRoutes);
app.use("/api/v1/cart", connectDB, cartRoutes);
app.use("/api/v1/wishlist", connectDB, wishlistRoutes);
app.use("/api/v1/orders", connectDB, orderRoutes);
app.use("/api/v1/reviews", connectDB, reviewRoutes);
app.use("/api/v1/contact", connectDB, contactRoutes);
app.use("/api/v1/admin", connectDB, adminRoutes);

// ================= ERROR =================
app.use(notFound);
app.use(errorHandler);

// ================= START =================
const startServer = async () => {
  try {
    await connectDB();
    logger.info("✅ MongoDB Connected");

    server.listen(PORT, () => {
      logger.info(`✅ Server on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Start failed:", err);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", () => {
  mongoose.connection.close();
  process.exit(0);
});


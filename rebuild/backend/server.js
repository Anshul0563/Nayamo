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

// Routes
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const contactRoutes = require("./routes/contactRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const delhiveryRoutes = require("./routes/delhiveryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

console.log("🚀 Starting Nayamo Backend v2.0 - COMPLETE...");

// ================= SECURITY =================
app.set("trust proxy", 1);
app.use(helmet());
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
app.use(morgan("dev"));

// ================= RATE LIMIT =================
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
}));

// ================= HEALTH =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    version: "2.0.0",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Nayamo API v2.0 - Full Backend Ready 🚀" });
});

// ================= ROUTES =================
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/delhivery", delhiveryRoutes);

// ================= ERROR =================
app.use(notFound);
app.use(errorHandler);

// ================= START =================
const startServer = async () => {
  try {
    const required = ["MONGO_URI", "JWT_SECRET"];
    const missing = required.filter(v => !process.env[v]);
    if (missing.length) {
      throw new Error(`Missing ENV: ${missing.join(", ")}`);
    }

    await connectDB();

    server.listen(PORT, () => {
      logger.info(`✅ Server ready on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Failed:", err);
    process.exit(1);
  }
};

startServer();


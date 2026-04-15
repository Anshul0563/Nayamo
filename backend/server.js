const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


require("dotenv").config();

const app = express();

//  FIRST: middleware
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

//  DB connect
connectDB();

//  routes
app.use("/api/shipping",shippingRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payment",paymentRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Nayamo API Running 💎");
});

// server start
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});
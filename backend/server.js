const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");


const app = express();

require("dotenv").config();
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/orders", orderRoutes);

// middleware
app.use(express.json());
app.use(cors());

// DB connect
connectDB();

// test route
app.get("/", (req, res) => {
  res.send("Nayamo API Running 💎");
});
//product API
app.use("/api/products", productRoutes);
// server start
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});
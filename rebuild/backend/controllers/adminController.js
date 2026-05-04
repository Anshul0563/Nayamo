const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.dashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalUsers, totalProducts, recentOrders] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: "user" }),
    Product.countDocuments({ isActive: true }),
    Order.find({}).sort({ createdAt: -1 }).limit(5),
  ]);

  const stats = {
    totalOrders,
    totalUsers,
    totalProducts,
    revenueToday: 0, // Calculate from orders
    ordersToday: 0, // Count today's orders
    recentOrders,
  };

  res.json({
    success: true,
    data: stats,
  });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .populate("items.product", "title")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users,
  });
});


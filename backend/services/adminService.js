const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// DASHBOARD STATS
exports.getDashboardStats = async () => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: ["confirmed", "packed", "shipped", "delivered"] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" }
      }
    }
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email");

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue,
    recentOrders
  };
};

// ALL USERS
exports.getAllUsers = async () => {
  return await User.find()
    .select("-password")
    .sort({ createdAt: -1 });
};

// ALL PRODUCTS
exports.getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};
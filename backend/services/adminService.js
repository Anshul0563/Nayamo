const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// DASHBOARD STATS
exports.getDashboardStats = async () => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();

  // Revenue (only confirmed orders)
  const revenueData = await Order.aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" }
      }
    }
  ]);

  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  //  Recent Orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user")
    .populate("items.product");

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue,
    recentOrders
  };
};
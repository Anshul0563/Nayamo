const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// DASHBOARD STATS
exports.getDashboardStats = async () => {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    revenueData,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments(),
    Product.countDocuments(),

    Order.aggregate([
      {
        $match: {
          status: {
            $in: [
              "confirmed",
              "packed",
              "ready_to_ship",
              "pickup_requested",
              "in_transit",
              "shipped",
              "delivered",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),
  ]);

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue: revenueData[0]?.totalRevenue || 0,
    recentOrders,
  };
};

// USERS
exports.getAllUsers = async () => {
  return await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
};

// PRODUCTS
exports.getAllProducts = async () => {
  return await Product.find()
    .sort({ createdAt: -1 })
    .lean();
};

// UPDATE PRODUCT
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();
};

// DELETE PRODUCT
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};
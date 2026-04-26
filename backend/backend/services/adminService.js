const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// DASHBOARD STATS - FULL DYNAMIC
exports.getDashboardStats = async () => {
  const deliveredStatuses = [
    "confirmed",
    "packed",
    "ready_to_ship",
    "pickup_requested",
    "in_transit",
    "shipped",
    "delivered",
  ];

  const now = new Date();
  const currentYear = now.getFullYear();

  const [
    totalOrders,
    totalUsers,
    totalProducts,
    revenueData,
    recentOrders,
    lowStockProducts,
    outOfStock,
    topProducts,
    monthlySales,
  ] = await Promise.all([
    // Total Orders
    Order.countDocuments(),

    // Total Users
    User.countDocuments(),

    // Total Products
    Product.countDocuments(),

    // Total Revenue
    Order.aggregate([
      {
        $match: {
          status: { $in: deliveredStatuses },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalPrice",
          },
        },
      },
    ]),

    // Recent Orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean(),

    // Low Stock Products
    Product.find({
      stock: { $gt: 0, $lte: 5 },
    })
      .limit(5)
      .lean(),

    // Out Of Stock Count
    Product.countDocuments({
      stock: 0,
    }),

    // Top Products
    Order.aggregate([
      {
        $unwind: "$orderItems",
      },
      {
        $group: {
          _id: "$orderItems.name",
          sales: {
            $sum:
              "$orderItems.qty",
          },
          revenue: {
            $sum: {
              $multiply: [
                "$orderItems.qty",
                "$orderItems.price",
              ],
            },
          },
        },
      },
      {
        $sort: {
          sales: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          sales: 1,
          revenue: 1,
        },
      },
    ]),

    // Monthly Sales (Current Year)
    Order.aggregate([
      {
        $match: {
          status: {
            $in: deliveredStatuses,
          },
          createdAt: {
            $gte: new Date(
              `${currentYear}-01-01`
            ),
            $lte: new Date(
              `${currentYear}-12-31`
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            $month:
              "$createdAt",
          },
          sales: {
            $sum:
              "$totalPrice",
          },
          orders: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]),
  ]);

  // Revenue
  const totalRevenue =
    revenueData[0]?.totalRevenue || 0;

  // Average Order Value
  const avgOrderValue =
    totalOrders > 0
      ? Math.round(
          totalRevenue /
            totalOrders
        )
      : 0;

  // Build 12 months data
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formattedMonthlySales =
    monthNames.map(
      (month, index) => {
        const found =
          monthlySales.find(
            (item) =>
              item._id ===
              index + 1
          );

        return {
          month,
          sales:
            found?.sales || 0,
          orders:
            found?.orders || 0,
        };
      }
    );

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue,
    avgOrderValue,
    outOfStock,
    lowStock:
      lowStockProducts.length,
    recentOrders,
    lowStockProducts,
    topProducts,
    monthlySales:
      formattedMonthlySales,
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
exports.updateProduct = async (
  id,
  data
) => {
  return await Product.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).lean();
};

// DELETE PRODUCT
exports.deleteProduct = async (
  id
) => {
  return await Product.findByIdAndDelete(
    id
  );
};
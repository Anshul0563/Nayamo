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

    // Total Revenue (only paid orders)
    Order.aggregate([
      {
        $match: {
          status: { $in: deliveredStatuses },
          paymentStatus: "paid",
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

    // Top Products (fixed field names)
    Order.aggregate([
      {
        $match: {
          status: { $in: deliveredStatuses },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          sales: {
            $sum: "$items.quantity",
          },
          revenue: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price"],
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
    ]),

    // Monthly Sales (Current Year)
    Order.aggregate([
      {
        $match: {
          status: {
            $in: deliveredStatuses,
          },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          sales: {
            $sum: "$totalPrice",
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
  const totalRevenue = revenueData[0]?.totalRevenue || 0;

  // Average Order Value
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Build 12 months data
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const formattedMonthlySales = monthNames.map((month, index) => {
    const found = monthlySales.find((item) => item._id === index + 1);

    return {
      month,
      sales: found?.sales || 0,
      orders: found?.orders || 0,
    };
  });

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue,
    avgOrderValue,
    outOfStock,
    lowStock: lowStockProducts.length,
    recentOrders,
    lowStockProducts,
    topProducts,
    monthlySales: formattedMonthlySales,
  };
};

// USERS with pagination
exports.getAllUsers = async ({ page = 1, limit = 20, search }) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
};

// PRODUCTS with pagination
exports.getAllProducts = async ({ page = 1, limit = 20, search, category }) => {
  const skip = (page - 1) * limit;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: limit,
  };
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

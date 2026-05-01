const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const escapeRegex = require("../utils/escapeRegex");

const revenueStatuses = ["delivered", "confirmed", "ready_to_ship", "pickup_requested", "in_transit", "out_for_delivery"];
const lowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD) || 5;

const percentChange = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const toDate = (date, fallback) => (date ? new Date(date) : fallback);

// LIVE Dashboard Stats with date range support
exports.getDashboardStats = async ({ dateFrom, dateTo }) => {
  const end = toDate(dateTo, new Date());
  const start = toDate(dateFrom, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(end.getFullYear(), end.getMonth(), 1);
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));

  const match = {
    createdAt: {
      $gte: start,
      $lte: end
    }
  };

  const paidRevenueMatch = { status: { $in: revenueStatuses }, paymentStatus: "paid" };

  const [
    totalOrders,
    totalSales,
    totalUsers,
    totalProducts,
    totalRevenueAgg,
    todayRevenueAgg,
    weeklyRevenueAgg,
    monthlyRevenueAgg,
    previousRevenueAgg,
    statusBreakdown,
    activeUsers,
    returningCustomers,
    lowStockProducts,
    outOfStockProducts,
    paidOrders,
  ] = await Promise.all([
    Order.countDocuments(match),
    Order.countDocuments({ ...match, paymentStatus: "paid" }),
    User.countDocuments(match),
    Product.countDocuments({ isActive: true }),
    Order.aggregate([
      { $match: { ...match, ...paidRevenueMatch } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: end }, ...paidRevenueMatch } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: weekStart, $lte: end }, ...paidRevenueMatch } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: monthStart, $lte: end }, ...paidRevenueMatch } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: previousStart, $lt: start }, ...paidRevenueMatch } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]),
    Order.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    User.countDocuments({ isActive: true }),
    Order.aggregate([
      { $group: { _id: "$user", orders: { $sum: 1 } } },
      { $match: { orders: { $gt: 1 } } },
      { $count: "count" }
    ]),
    Product.countDocuments({ isActive: true, stock: { $gt: 0, $lte: lowStockThreshold } }),
    Product.countDocuments({ isActive: true, stock: 0 }),
    Order.countDocuments({ paymentStatus: "paid" }),
  ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const previousRevenue = previousRevenueAgg[0]?.total || 0;
  const ordersByStatus = statusBreakdown.reduce((acc, item) => ({ ...acc, [item._id || "unknown"]: item.count }), {});
  const conversionRate = totalOrders > 0 ? Number(((paidOrders / totalOrders) * 100).toFixed(1)) : 0;

  return {
    totalOrders,
    totalSales,
    totalUsers,
    totalProducts,
    totalRevenue,
    todayRevenue: todayRevenueAgg[0]?.total || 0,
    weeklyRevenue: weeklyRevenueAgg[0]?.total || 0,
    monthlyRevenue: monthlyRevenueAgg[0]?.total || 0,
    avgOrderValue: paidOrders > 0 ? Math.round(totalRevenue / paidOrders) : 0,
    pendingOrders: ordersByStatus.pending || 0,
    cancelledOrders: ordersByStatus.cancelled || 0,
    deliveredOrders: ordersByStatus.delivered || 0,
    activeUsers,
    returningCustomers: returningCustomers[0]?.count || 0,
    conversionRate,
    lowStockProducts,
    outOfStockProducts,
    growthRate: percentChange(totalRevenue, previousRevenue),
    statusBreakdown,
    ordersByStatus
  };
};

// Revenue chart data (30 days)
exports.getRevenueChartData = async ({ days = 30 }) => {
  const endDate = new Date();
  const startDate = new Date(endDate - days * 24 * 60 * 60 * 1000);

  const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: revenueStatuses },
        paymentStatus: "paid",
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    { $limit: 30 }
  ]);

  return revenueData.map(item => ({
    date: `${item._id.month.toString().padStart(2, "0")}/${item._id.day.toString().padStart(2, "0")}`,
    revenue: item.revenue,
    orders: item.orders
  }));
};

// Recent orders
exports.getRecentOrders = async (limit = 5) => {
  return await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email phone')
    .populate({ path: 'items.product', select: 'title images' })
    .lean();
};

// Top products
exports.getTopProducts = async (limit = 5) => {
  return await Order.aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        sales: { $sum: "$items.quantity" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { sales: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
        pipeline: [{ $project: { title: 1, images: 1, price: 1 } }]
      }
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: { $ifNull: ["$product.title", "Deleted product"] },
        image: { $arrayElemAt: ["$product.images", 0] },
        sales: 1,
        revenue: 1,
        product: 1
      }
    }
  ]);
};

// Conversion funnel
exports.getConversionFunnel = async () => {
  const [users, carts, checkoutStarted, paidOrders] = await Promise.all([
    User.countDocuments(),
    require("../models/Cart").countDocuments({ "items.0": { $exists: true } }),
    Order.countDocuments(),
    Order.countDocuments({ paymentStatus: "paid" })
  ]);

  return [
    { stage: "Registered Users", value: users },
    { stage: "Active Carts", value: carts },
    { stage: "Checkout Orders", value: checkoutStarted },
    { stage: "Purchased", value: paidOrders }
  ];
};

// Users list with search/pagination
exports.getAllUsers = async ({ page = 1, limit = 20, search, role, status }) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } }
    ];
  }
  if (role) query.role = role === "customer" ? "user" : role;
  if (status) query.isActive = status === "active";

  const [users, totalItems, orderStats] = await Promise.all([
    User.find(query)
      .select("-password -refreshTokens")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          lifetimeValue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalPrice", 0]
            }
          },
          lastOrderAt: { $max: "$createdAt" }
        }
      }
    ])
  ]);

  const statsByUser = new Map(orderStats.map((item) => [String(item._id), item]));
  const enrichedUsers = users.map((user) => ({
    ...user,
    status: user.isActive ? "active" : "banned",
    role: user.role === "user" ? "customer" : user.role,
    orderCount: statsByUser.get(String(user._id))?.orderCount || 0,
    lifetimeValue: statsByUser.get(String(user._id))?.lifetimeValue || 0,
    lastActive: statsByUser.get(String(user._id))?.lastOrderAt || user.updatedAt || user.createdAt
  }));

  return {
    users: enrichedUsers,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit)
  };
};

// Products list with search/pagination
exports.getAllProducts = async ({ page = 1, limit = 20, search, category }) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { material: { $regex: safeSearch, $options: "i" } }
    ];
  }
  if (category) query.category = category;

  const [products, totalItems] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query)
  ]);

  return {
    products,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit)
  };
};

// Update product
exports.updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).lean();
};

// Delete product
exports.deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

exports.updateUser = async (id, data) => {
  const update = {};
  if (data.role) update.role = data.role === "customer" ? "user" : data.role;
  if (data.status) update.isActive = data.status === "active";
  if (typeof data.isActive === "boolean") update.isActive = data.isActive;
  if (data.name) update.name = data.name;

  return User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true
  }).select("-password -refreshTokens").lean();
};

exports.deleteUser = async (id) => {
  return User.findByIdAndUpdate(id, { isActive: false }, { new: true }).select("-password -refreshTokens").lean();
};

exports.getPayments = async ({ page = 1, limit = 20, status, search }) => {
  const skip = (page - 1) * limit;
  const query = {};
  if (status) query.paymentStatus = status;
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { phone: { $regex: safeSearch, $options: "i" } },
      { razorpayOrderId: { $regex: safeSearch, $options: "i" } },
      { razorpayPaymentId: { $regex: safeSearch, $options: "i" } }
    ];
  }

  const [orders, totalItems, totals] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email")
      .select("user totalPrice paymentMethod paymentStatus isPaid createdAt razorpayOrderId razorpayPaymentId")
      .lean(),
    Order.countDocuments(query),
    Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$paymentStatus",
          amount: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    payments: orders,
    totals,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit)
  };
};

exports.getAnalytics = async ({ days = 30 } = {}) => {
  const dateFrom = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
  const dateTo = new Date();
  const [stats, revenue, funnel, topProducts, heatmap] = await Promise.all([
    exports.getDashboardStats({ dateFrom, dateTo }),
    exports.getRevenueChartData({ days }),
    exports.getConversionFunnel(),
    exports.getTopProducts(10),
    Order.aggregate([
      { $match: { createdAt: { $gte: dateFrom, $lte: dateTo } } },
      {
        $group: {
          _id: { dayOfWeek: { $dayOfWeek: "$createdAt" }, hour: { $hour: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } }
    ])
  ]);

  return {
    ...stats,
    revenue,
    funnel,
    topProducts,
    heatmap
  };
};

// ── NEW: Product Creation ───────────────────────────────────────────
exports.createProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

// ── NEW: Order Stats ────────────────────────────────────────────────
exports.getOrderStats = async () => {
  const stats = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    ready_to_ship: 0,
    pickup_requested: 0,
    in_transit: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    rto: 0,
    refunded: 0,
  };
  stats.forEach((item) => {
    result[item._id || "unknown"] = item.count;
    result.total += item.count;
  });
  return result;
};

// ── NEW: User Stats ─────────────────────────────────────────────────
exports.getUserStats = async () => {
  const [total, active, banned, admins, customers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
  ]);
  return { total, active, banned, admins, customers };
};

// ── NEW: Returns ────────────────────────────────────────────────────
exports.getReturns = async ({ page = 1, limit = 20, status, search }) => {
  const skip = (page - 1) * limit;
  const query = { status: { $in: ["returned", "rto", "refunded"] } };
  if (status) query.status = status;
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { phone: { $regex: safeSearch, $options: "i" } },
      { _id: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [orders, totalItems] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email phone")
      .lean(),
    Order.countDocuments(query),
  ]);

  return {
    orders,
    currentPage: Number(page),
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    itemsPerPage: Number(limit),
  };
};

exports.updateReturnStatus = async (id, data) => {
  const update = { status: data.status };
  if (data.refundAmount !== undefined) update.refundAmount = data.refundAmount;
  if (data.refundReason) update.refundReason = data.refundReason;
  return await Order.findByIdAndUpdate(id, update, { new: true }).lean();
};

// ── NEW: Settings ───────────────────────────────────────────────────
const Settings = require("../models/Settings");
exports.getSettings = async () => {
  return await Settings.getSingleton();
};

exports.updateSettings = async (data) => {
  const settings = await Settings.findOne();
  if (!settings) {
    return await Settings.create(data);
  }
  Object.assign(settings, data);
  await settings.save();
  return settings;
};

// ── NEW: Change Password ────────────────────────────────────────────
const bcrypt = require("bcryptjs");
exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();
  return { message: "Password changed successfully" };
};

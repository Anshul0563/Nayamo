const orderService = require("../services/orderService");
const adminService = require("../services/adminService");
const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const Notification = require("../models/Notification");
const { emitInventoryNotification } = require("../services/notificationService");

const validStatuses = [
  "pending",
  "confirmed",
  "ready_to_ship",
  "pickup_requested",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "rto",
];

// GET ALL ORDERS
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const result = await orderService.getAllOrders({
    page: Number(page),
    limit: Number(limit),
    status,
    search,
  });

  res.json({
    success: true,
    data: result.orders,
    pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
    },
  });
});

// UPDATE ORDER STATUS
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid order ID format");
  }

  const { status } = req.body;

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await orderService.updateOrderStatus(req.params.id, status);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  logger.info(`Order ${req.params.id} status updated to ${status}`);

  res.json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

// DASHBOARD STATS - Real MongoDB aggregation
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { 
    days = 30, 
    dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    dateTo = new Date()
  } = req.query;

  const [
    stats,
    chartData,
    recentOrders,
    topProducts,
    funnelData
  ] = await Promise.all([
    adminService.getDashboardStats({ dateFrom, dateTo }),
    adminService.getRevenueChartData({ days }),
    adminService.getRecentOrders(5),
    adminService.getTopProducts(5),
    adminService.getConversionFunnel()
  ]);

  res.json({
    success: true,
    metrics: stats,
    chartData,
    recentOrders,
    topProducts,
    funnelData
  });
});

exports.getDashboard = exports.getDashboardStats;

// NOTIFICATIONS
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read = null, type } = req.query;
  
  const match = { adminId: req.user._id };
  if (read !== null) match.isRead = read === 'true';
  if (type) match.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, totalItems, unreadCount] = await Promise.all([
    Notification.find(match).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Notification.countDocuments(match),
    Notification.countDocuments({ adminId: req.user._id, isRead: false })
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / Number(limit)),
      totalItems,
      itemsPerPage: Number(limit)
    }
  });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === "all") {
    await Notification.updateMany({ adminId: req.user._id, isRead: false }, { isRead: true });
  } else {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid notification ID format");
    }
    await Notification.updateOne({ _id: id, adminId: req.user._id }, { isRead: true });
  }

  res.json({ success: true, message: "Notification marked as read" });
});

// USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;

  const result = await adminService.getAllUsers({
    page: Number(page),
    limit: Number(limit),
    search,
    role,
    status,
  });

  res.json({
    success: true,
    data: result.users,
    pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
    },
  });
});

exports.updateUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid user ID format");
  }

  const user = await adminService.updateUser(req.params.id, req.body);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    message: "User updated",
    data: {
      ...user,
      status: user.isActive ? "active" : "banned",
      role: user.role === "user" ? "customer" : user.role,
    },
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid user ID format");
  }

  const user = await adminService.deleteUser(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ success: true, message: "User deactivated" });
});

// PRODUCTS
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, category } = req.query;

  const result = await adminService.getAllProducts({
    page: Number(page),
    limit: Number(limit),
    search,
    category,
  });

  res.json({
    success: true,
    data: result.products,
    pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
    },
  });
});

// UPDATE PRODUCT
exports.updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID format");
  }

  const product = await adminService.updateProduct(req.params.id, req.body);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Invalidate cache
  await productService.invalidateProductCache();
  if (typeof req.body.stock !== "undefined") {
    const stock = Number(req.body.stock);
    if (stock === 0) {
      emitInventoryNotification(product, "out_of_stock").catch((err) => logger.error("Inventory notification failed:", err.message));
    } else if (stock <= 5) {
      emitInventoryNotification(product, "low_stock").catch((err) => logger.error("Inventory notification failed:", err.message));
    } else {
      emitInventoryNotification(product, "restocked").catch((err) => logger.error("Inventory notification failed:", err.message));
    }
  }

  logger.info(`Product updated: ${req.params.id}`);

  res.json({
    success: true,
    message: "Product updated",
    data: product,
  });
});

// DELETE PRODUCT
exports.deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID format");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Delete images from Cloudinary using stored publicIds
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      try {
        if (img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
          logger.info(`Deleted image from Cloudinary: ${img.publicId}`);
        }
      } catch (err) {
        logger.error("Failed to delete image from Cloudinary:", err.message);
      }
    }
  }

  await adminService.deleteProduct(req.params.id);

  // Invalidate cache
  await productService.invalidateProductCache();

  logger.info(`Product deleted: ${req.params.id}`);

  res.json({
    success: true,
    message: "Product deleted",
  });
});

// PRODUCT IMAGE UPLOAD
exports.uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image uploaded");
  }

  const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(fileStr, {
    folder: "nayamo-products",
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  res.status(200).json({
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
});

exports.getPayments = asyncHandler(async (req, res) => {
  const result = await adminService.getPayments(req.query);
  res.json({
    success: true,
    data: result.payments,
    totals: result.totals,
    pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
      itemsPerPage: result.itemsPerPage,
    },
  });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const data = await adminService.getAnalytics(req.query);
  res.json({ success: true, data, ...data });
});

exports.getRevenueData = asyncHandler(async (req, res) => {
  const data = await adminService.getRevenueChartData(req.query);
  res.json({ success: true, data });
});

exports.getConversionData = asyncHandler(async (req, res) => {
  const data = await adminService.getConversionFunnel();
  res.json({ success: true, data });
});

exports.getRecentActivity = asyncHandler(async (req, res) => {
  const [orders, notifications] = await Promise.all([
    adminService.getRecentOrders(Number(req.query.limit) || 10),
    Notification.find({ adminId: req.user._id }).sort({ createdAt: -1 }).limit(Number(req.query.limit) || 10).lean(),
  ]);

  res.json({
    success: true,
    data: [
      ...orders.map((order) => ({ type: "order", createdAt: order.createdAt, data: order })),
      ...notifications.map((notification) => ({ type: "notification", createdAt: notification.createdAt, data: notification })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

exports.getTopProducts = asyncHandler(async (req, res) => {
  const data = await adminService.getTopProducts(Number(req.query.limit) || 10);
  res.json({ success: true, data });
});

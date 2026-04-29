const orderService = require("../services/orderService");
const adminService = require("../services/adminService");
const productService = require("../services/productService");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const Notification = require("../models/Notification");
const mongoosePaginate = require('mongoose-paginate-v2'); // Add pagination support

Notification.paginate = mongoosePaginate.paginate;

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
    stats,
    chartData,
    recentOrders,
    topProducts,
    funnelData
  });
});

// NOTIFICATIONS
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, read = null, type } = req.query;
  
  const match = { adminId: req.user._id };
  if (read !== null) match.isRead = read === 'true';
  if (type) match.type = type;

  const notifications = await Notification.paginate(match, {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    populate: false
  });

  res.json({
    success: true,
    data: notifications.docs,
    pagination: notifications.pagination
  });
});

// USERS
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const result = await adminService.getAllUsers({
    page: Number(page),
    limit: Number(limit),
    search,
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
  });
});

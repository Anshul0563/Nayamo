const orderService = require("../services/orderService");
const adminService = require("../services/adminService");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

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

  res.json({
    success: true,
    message: "Order status updated",
    data: order,
  });
});

// DASHBOARD
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const data = await adminService.getDashboardStats();

  res.json({
    success: true,
    data,
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

  // Delete images from Cloudinary
  if (product && product.images && product.images.length > 0) {
    for (const url of product.images) {
      try {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`nayamo-products/${publicId}`);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err.message);
      }
    }
  }

  await adminService.deleteProduct(req.params.id);

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
  });
});

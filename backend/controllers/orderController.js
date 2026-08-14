const orderService = require("../services/orderService");
const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");
const invoiceService = require("../services/invoiceService");
const logger = require("../config/logger");

const Order = require("../models/Order");
const mongoose = require("mongoose");
const JSZip = require("jszip");

// PLACE ORDER
exports.placeOrder = asyncHandler(async (req, res) => {
  const { address, phone, paymentMethod, idempotencyKey } = req.body;

  if (!address || !phone) {
    res.status(400);
    throw new Error("Address and phone are required");
  }

  // Validate phone format
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400);
    throw new Error("Please provide a valid 10-digit phone number");
  }

  const order = await orderService.placeOrder(req.user._id, {
    address,
    phone,
    paymentMethod,
    idempotencyKey,
  });

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

// USER ORDERS
exports.getOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await orderService.getUserOrders(
    req.user._id,
    Number(page),
    Number(limit),
  );

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

// SINGLE ORDER
exports.getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid order ID format");
  }

  const order = await orderService.getSingleOrder(req.user._id, req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    data: order,
  });
});

// CANCEL ORDER
exports.cancelOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);

    throw new Error("Invalid order ID format");
  }

  const order = await orderService.cancelOrder(req.user._id, req.params.id);

  // AUTO REFUND
  if (
    order.isPaid &&
    order.paymentMethod === "online" &&
    order.refundStatus !== "processed"
  ) {
    try {
      await paymentService.processRefund({
        orderId: order._id,

        reason: "Order cancelled",
      });
    } catch (refundErr) {
      logger.error(`Refund failed for order ${order._id}: ${refundErr.message}`);
    }
  }

  res.json({
    success: true,
    message:
      order.paymentMethod === "online"
        ? "Order cancelled and refund initiated"
        : "Order cancelled successfully",

    data: order,
  });
});

// RETURN ORDER
exports.returnOrder = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid order ID format");
  }

  const order = await orderService.returnOrder(req.user._id, req.params.id);

  res.json({
    success: true,
    message: "Return requested successfully",
    data: order,
  });
});
//Invoice
exports.downloadInvoice = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid order ID format");
  }

  const query = { _id: req.params.id };
  if (req.user.role !== "admin") {
    query.user = req.user._id;
  }

  const order = await Order.findOne(query)
    .populate("user")
    .populate("items.product");

  if (!order) {
    res.status(404);

    throw new Error("Order not found");
  }

  invoiceService.generateInvoice(order, res);
});

exports.downloadBulkInvoices = asyncHandler(async (req, res) => {
  const rawOrderIds = Array.isArray(req.body?.orderIds) ? req.body.orderIds : [];
  const uniqueOrderIds = [...new Set(rawOrderIds.map(String))];

  if (!uniqueOrderIds.length) {
    res.status(400);
    throw new Error("At least one order ID is required");
  }

  const validIds = uniqueOrderIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const invalidResults = uniqueOrderIds
    .filter((id) => !mongoose.Types.ObjectId.isValid(id))
    .map((orderId) => ({ orderId, status: "unavailable", message: "Invalid order ID" }));

  const orders = await Order.find({ _id: { $in: validIds } })
    .populate("user")
    .populate("items.product");

  const orderMap = new Map(orders.map((order) => [String(order._id), order]));

  const zip = new JSZip();
  const results = [];

  for (const orderId of validIds) {
    const order = orderMap.get(orderId);

    if (!order) {
      results.push({ orderId, status: "unavailable", message: "Order not found" });
      continue;
    }

    try {
      const pdfBuffer = await invoiceService.generateInvoiceBuffer(order);
      zip.file(`invoice-${order._id}.pdf`, pdfBuffer);
      results.push({ orderId, status: "ready", message: "Invoice generated" });
    } catch (error) {
      results.push({ orderId, status: "unavailable", message: error.message || "Invoice generation failed" });
    }
  }

  const files = zip.files;
  if (!Object.keys(files).length) {
    res.status(400).json({
      success: false,
      message: "No invoice files were generated",
      data: { results: [...results, ...invalidResults] },
    });
    return;
  }

  const archiveBuffer = await zip.generateAsync({ type: "nodebuffer" });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=nayamo-invoices.zip");
  res.send(archiveBuffer);
});

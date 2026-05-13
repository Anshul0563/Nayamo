const orderService = require("../services/orderService");
const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");
const mongoose = require("mongoose");

// PLACE ORDER
exports.placeOrder = asyncHandler(async (req, res) => {
  console.log("[orderController] placeOrder body:", req.body);
  console.log("[orderController] placeOrder auth user:", req.user?._id);
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
      console.error("Refund failed:", refundErr.message);
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

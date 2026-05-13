const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const asyncHandler = require("../utils/asyncHandler");
const paymentService = require("../services/paymentService");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const { isConfigured } = require("../config/env");

// Initialize Razorpay if keys are available
let razorpay;
try {
  const Razorpay = require("razorpay");
  if (
    isConfigured(process.env.RAZORPAY_KEY_ID) &&
    isConfigured(process.env.RAZORPAY_KEY_SECRET)
  ) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    logger.info("Razorpay initialized");
    if (!razorpay) {
      logger.warn("⚠ Razorpay running in mock mode");
    }
  }
} catch (err) {
  logger.warn("Razorpay not initialized:", err.message);
}

// CREATE PAYMENT ORDER
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  console.log("[paymentController] createPaymentOrder body:", req.body);
  console.log("[paymentController] createPaymentOrder auth user:", req.user?._id);
  const { orderId: mongoOrderId } = req.body;

  if (!mongoOrderId) {
    res.status(400);
    throw new Error("orderId is required");
  }


  const order = await Order.findOne({ _id: mongoOrderId, user: req.user._id });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (!order.totalPrice || order.totalPrice <= 0) {
    res.status(400);
    throw new Error("Order totalPrice is invalid");
  }

  // Never trust frontend amount. Use backend order.totalPrice as the source of truth.
  const amount = order.totalPrice;

  // Idempotency: if razorpayOrderId already exists for this order, return it.
  if (order.razorpayOrderId && razorpay) {
    return res.json({
      success: true,
      order: {
        id: order.razorpayOrderId,
        amount: Math.round(amount * 100),
        currency: "INR",
      },
      idempotent: true,
    });
  }

  // If Razorpay is configured, create real order
  if (razorpay) {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        mongoOrderId: mongoOrderId || null,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID if mongoOrderId provided
    if (mongoOrderId && mongoose.Types.ObjectId.isValid(mongoOrderId)) {
      await Order.findByIdAndUpdate(mongoOrderId, {
        razorpayOrderId: razorpayOrder.id,
      });
    }

    return res.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  }

  // Fallback: mock order for development (NO REAL PAYMENT)
  logger.warn("Razorpay not configured - returning mock order");
  const fakeOrderId = order.razorpayOrderId || "order_" + Date.now();

  // Update order with the (mock) razorpayOrderId if not already set
  if (!order.razorpayOrderId) {
    await Order.findByIdAndUpdate(mongoOrderId, { razorpayOrderId: fakeOrderId });
  }

  res.json({
    success: true,
    order: {
      id: fakeOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
    },
    warning: "Razorpay not configured - this is a mock order",
    idempotent: !!order.razorpayOrderId,
  });
});

// VERIFY PAYMENT (Client-side callback - additional server-side webhook at /webhook/razorpay)
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature, mongoOrderId } =
    req.body;

  console.log("[paymentController] verifyPayment body:", req.body);
  console.log("[paymentController] verifyPayment auth user:", req.user?._id);

  if (!orderId || !razorpayPaymentId) {
    res.status(400);
    throw new Error("Order ID and payment ID are required");
  }

  // If Razorpay is configured, verify signature
  if (razorpay && isConfigured(process.env.RAZORPAY_KEY_SECRET)) {
    const body = orderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      res.status(400);
      throw new Error("Invalid payment signature");
    }
  } else {
    res.status(503);
    throw new Error("Payment verification service unavailable");
  }

  // Find and update order using mongoOrderId (Razorpay orderId != MongoDB _id)
  let order;
  if (mongoOrderId && mongoose.Types.ObjectId.isValid(mongoOrderId)) {
    order = await Order.findOne({ _id: mongoOrderId, user: req.user._id });
  } else {
    // Fallback: try to find by razorpayOrderId
    order = await Order.findOne({ razorpayOrderId: orderId, user: req.user._id });
  }

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Prevent duplicate payment processing
  if (order.isPaid) {
    return res.json({
      success: true,
      message: "Payment already verified",
      data: order,
    });
  }

  order.paymentStatus = "paid";
  order.isPaid = true;
  order.paidAt = new Date();
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;

  await Cart.findOneAndUpdate(
  { user: req.user._id },
  { items: [] }
);

  logger.info(`Payment verified for order: ${order._id}`);

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: order,
  });
});
exports.processRefund = asyncHandler(async (req, res) => {
  const { orderId, amount, reason } = req.body;

  if (!orderId || !amount) {
    res.status(400);
    throw new Error("orderId and amount are required");
  }

  const result = await paymentService.processRefund({
    orderId,
    amount,
    reason,
  });

  res.json({
    success: true,
    message: "Refund processed successfully",
    data: result,
  });
});

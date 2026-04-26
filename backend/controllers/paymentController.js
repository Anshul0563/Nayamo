const crypto = require("crypto");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");

// Initialize Razorpay if keys are available
let razorpay;
try {
  const Razorpay = require("razorpay");
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn("Razorpay not initialized:", err.message);
}

// CREATE PAYMENT ORDER
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId: mongoOrderId } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Valid amount is required");
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
  console.warn("Razorpay not configured - returning mock order");
  const fakeOrderId = "order_" + Date.now();

  res.json({
    success: true,
    order: {
      id: fakeOrderId,
      amount: amount * 100,
      currency: "INR",
    },
    warning: "Razorpay not configured - this is a mock order",
  });
});

// VERIFY PAYMENT
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature, mongoOrderId } = req.body;

  if (!orderId || !razorpayPaymentId) {
    res.status(400);
    throw new Error("Order ID and payment ID are required");
  }

  // If Razorpay is configured, verify signature
  if (razorpay && process.env.RAZORPAY_KEY_SECRET) {
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
    console.warn("Razorpay not configured - skipping signature verification");
  }

  // Find and update order using mongoOrderId (Razorpay orderId != MongoDB _id)
  let order;
  if (mongoOrderId && mongoose.Types.ObjectId.isValid(mongoOrderId)) {
    order = await Order.findById(mongoOrderId);
  } else {
    // Fallback: try to find by razorpayOrderId
    order = await Order.findOne({ razorpayOrderId: orderId });
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

  await order.save();

  res.json({
    success: true,
    message: "Payment verified successfully",
    data: order,
  });
});

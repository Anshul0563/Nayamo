const Razorpay = require("razorpay");
const Order = require("../models/Order");
const logger = require("../config/logger");
const Product = require("../models/Product");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.processRefund = async ({ orderId, amount, reason }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (!order.isPaid) {
    throw new Error("Cannot refund unpaid order");
  }

  if (!order.razorpayPaymentId) {
    throw new Error("Razorpay payment ID missing");
  }

  if (order.refundStatus === "processed") {
    throw new Error("Refund already processed");
  }

  const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
    amount: Math.round(amount * 100),
    notes: {
      reason: reason || "Customer refund",
    },
  });

  order.refundId = refund.id;
  order.refundAmount = amount;
  order.refundStatus = "processed";
  order.refundReason = reason;
  order.refundedAt = new Date();

  order.paymentStatus = "refunded";
  order.status = "returned";

  await order.save();
  for (const item of order.items) {
    const product = await Product.findById(item.product);

    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }
  logger.info(`Refund processed for order ${order._id}`);

  return {
    order,
    refund,
  };
};

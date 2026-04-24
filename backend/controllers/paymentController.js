
const crypto = require("crypto");
const Order = require("../models/Order");

// TEMP READY STRUCTURE
// Razorpay keys baad me add hongi
// Abhi payment system ready kar rahe hain

exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Temporary mock order id until Razorpay keys available
    const fakeOrderId =
      "order_" +
      Date.now();

    res.json({
      success: true,
      order: {
        id: fakeOrderId,
        amount: amount * 100,
        currency: "INR",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    // Later real signature verify hoga
    // Abhi direct mark paid

    const order =
      await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = "paid";
    order.isPaid = true;
    order.paidAt = new Date();
    order.razorpayPaymentId =
      razorpayPaymentId;
    order.razorpaySignature =
      razorpaySignature;

    await order.save();

    res.json({
      success: true,
      message:
        "Payment verified",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
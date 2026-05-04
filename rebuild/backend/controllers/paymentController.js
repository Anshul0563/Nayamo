const asyncHandler = require("../utils/asyncHandler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("../config/logger");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  const options = {
    amount: amount * 100, // paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  res.status(201).json({
    success: true,
    data: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    },
  });
});

// Verify payment
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  // Create payload
  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    // Update order paymentStatus to "paid"
    // Implementation depends on your order model
    // await Order.findByIdAndUpdate(orderId, { paymentStatus: "paid" });

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });
  }
});


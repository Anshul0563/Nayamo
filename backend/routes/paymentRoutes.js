
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Create Razorpay Order
router.post(
  "/create-order",
  protect,
  createPaymentOrder
);

// Verify Payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

module.exports = router;
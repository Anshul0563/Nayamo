const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const createOrderValidation = [
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 1 })
    .withMessage("Amount must be at least 1"),
  body("orderId")
    .optional()
    .isMongoId()
    .withMessage("Invalid order ID"),
];

const verifyValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("razorpayPaymentId").notEmpty().withMessage("Payment ID is required"),
  body("razorpaySignature").notEmpty().withMessage("Signature is required"),
];

router.post("/create-order", protect, createOrderValidation, validate, createPaymentOrder);
router.post("/verify", protect, verifyValidation, validate, verifyPayment);

module.exports = router;

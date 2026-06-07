const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createPaymentOrder,
  verifyPayment,
processRefund,
} = require("../controllers/paymentController");

const createOrderValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("orderId is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
];

const verifyValidation = [
  body("orderId").notEmpty().withMessage("Order ID is required"),
  body("mongoOrderId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Mongo order ID"),
  body("razorpayPaymentId").notEmpty().withMessage("Payment ID is required"),
  body("razorpaySignature").notEmpty().withMessage("Signature is required"),
];

const refundValidation = [
  body("orderId")
    .notEmpty()
    .withMessage("orderId is required")
    .isMongoId()
    .withMessage("Invalid order ID"),
  body("amount")
    .optional()
    .isFloat({ min: 1 })
    .withMessage("Refund amount must be greater than 0"),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

router.post("/create-order", protect, createOrderValidation, validate, createPaymentOrder);
router.post("/verify", protect, verifyValidation, validate, verifyPayment);
router.post("/refund", protect, admin, refundValidation, validate, processRefund);

module.exports = router;

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const orderValidation = [
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Address must be 10-500 characters"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone must be 10 digits"),
  body("paymentMethod")
    .optional()
    .isIn(["cod", "online"])
    .withMessage("Payment method must be cod or online"),
];

router.post("/", protect, orderValidation, validate, placeOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;

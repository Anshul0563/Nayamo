const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, placeOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
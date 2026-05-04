const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  returnOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderDetails);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/return", protect, returnOrder);

module.exports = router;


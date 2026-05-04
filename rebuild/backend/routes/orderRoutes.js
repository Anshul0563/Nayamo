const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", placeOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

module.exports = router;


const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/adminController");


const {
  getAllOrders,
  updateOrderStatus
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, updateOrderStatus);
router.get("/dashboard", protect, admin, getDashboardStats);

module.exports = router;
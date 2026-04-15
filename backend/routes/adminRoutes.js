const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllProducts
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.get("/dashboard", protect, admin, getDashboardStats);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);
router.get("/products", protect, admin, getAllProducts);

module.exports = router;
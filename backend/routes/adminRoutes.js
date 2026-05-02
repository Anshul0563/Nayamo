const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const {
  getDashboardStats,
  getDashboard,
  getNotifications,
  markNotificationRead,
  deleteNotification,
  deleteAllNotifications,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getPayments,
  getAnalytics,
  getRevenueData,
  getConversionData,
  getRecentActivity,
  getTopProducts,
  getOrderStats,
  getUserStats,
  getReturns,
  updateReturnStatus,
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");
const reviewRoutes = require("./reviewRoutes");

const statusValidation = [
  param("id").isMongoId().withMessage("Invalid order ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn([
      "pending",
      "confirmed",
      "ready_to_ship",
      "pickup_requested",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned",
      "rto",
    ])
    .withMessage("Invalid status value"),
];

const productUpdateValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be 2-200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .isIn(["party", "daily", "traditional", "western", "statement", "bridal"])
    .withMessage("Category must be party, daily, traditional, western, statement, or bridal"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

router.get("/dashboard", protect, admin, getDashboard);
router.get("/stats", protect, admin, getDashboardStats);
router.get("/analytics", protect, admin, getAnalytics);
router.get("/revenue", protect, admin, getRevenueData);
router.get("/conversion", protect, admin, getConversionData);
router.get("/recent-activity", protect, admin, getRecentActivity);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/payments", protect, admin, getPayments);
router.get("/notifications", protect, admin, getNotifications);
router.patch("/notifications/:id/read", protect, admin, markNotificationRead);
router.delete("/notifications/:id", protect, admin, deleteNotification);
router.delete("/notifications/all", protect, admin, deleteAllNotifications);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, statusValidation, validate, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/products", protect, admin, getAllProducts);
router.post("/products", protect, admin, productUpdateValidation, validate, createProduct);
router.post("/products/upload", protect, admin, upload.single("image"), uploadProductImage);
router.put("/products/:id", protect, admin, productUpdateValidation, validate, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

// Order Stats
router.get("/orders/stats", protect, admin, getOrderStats);

// User Stats
router.get("/users/stats", protect, admin, getUserStats);

// Returns
router.get("/returns", protect, admin, getReturns);
router.put("/returns/:id", protect, admin, updateReturnStatus);

// Settings
router.get("/settings", protect, admin, getSettings);
router.put("/settings", protect, admin, updateSettings);

// Change Password
router.post("/change-password", protect, admin, changePassword);

//Reviews - Admin management routes
router.use("/reviews", reviewRoutes);

module.exports = router;

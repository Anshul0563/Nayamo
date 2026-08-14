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
  getReturnStats,
  updateReturnStatus,
  getSettings,
  updateSettings,
  changePassword,
} = require("../controllers/adminController");

const { downloadBulkInvoices } = require("../controllers/orderController");

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

const settingsUpdateValidation = [
  body("codEnabled")
    .optional()
    .isBoolean()
    .withMessage("codEnabled must be a boolean"),
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
  body("jewelleryType")
    .optional()
    .trim()
    .toLowerCase()
    .isIn(["earrings", "necklaces", "rings", "bracelets", "bangles", "anklets", "sets", "other"])
    .withMessage("jewelleryType must be earrings, necklaces, rings, bracelets, bangles, anklets, sets, or other"),
];

const productCreateValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Title must be 2-200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["party", "daily", "traditional", "western", "statement", "bridal"])
    .withMessage("Category must be party, daily, traditional, western, statement, or bridal"),
  body("jewelleryType")
    .notEmpty()
    .withMessage("jewelleryType is required")
    .trim()
    .toLowerCase()
    .isIn(["earrings", "necklaces", "rings", "bracelets", "bangles", "anklets", "sets", "other"])
    .withMessage("jewelleryType must be earrings, necklaces, rings, bracelets, bangles, anklets, sets, or other"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array"),
  body("images.*.url")
    .optional()
    .isURL()
    .withMessage("Each image must have a valid URL"),
  body("images.*.publicId")
    .optional()
    .isString()
    .withMessage("Each image must have a publicId"),
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
router.post("/orders/invoices/bulk", protect, admin, downloadBulkInvoices);
router.put("/orders/:id", protect, admin, statusValidation, validate, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id", protect, admin, updateUser);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/products", protect, admin, getAllProducts);
router.post("/products", protect, admin, productCreateValidation, validate, createProduct);
router.post("/products/upload", protect, admin, upload.single("image"), uploadProductImage);
router.put("/products/:id", protect, admin, productUpdateValidation, validate, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

// Order Stats
router.get("/orders/stats", protect, admin, getOrderStats);

// User Stats
router.get("/users/stats", protect, admin, getUserStats);

// Returns
router.get("/returns", protect, admin, getReturns);
router.get("/returns/stats", protect, admin, getReturnStats);
router.put("/returns/:id", protect, admin, updateReturnStatus);

// Settings
router.get("/settings", protect, admin, getSettings);
router.put(
  "/settings",
  protect,
  admin,
  settingsUpdateValidation,
  validate,
  updateSettings,
);

// Change Password
router.post("/change-password", protect, admin, changePassword);

//Reviews - Admin management routes
router.use("/reviews", reviewRoutes);

module.exports = router;

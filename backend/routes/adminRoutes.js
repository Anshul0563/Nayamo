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
const { CATEGORIES, JEWELLERY_TYPES } = require("../constants/catalog");
const adminOnly = [protect, admin];

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
    .isIn(CATEGORIES)
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
    .isIn(JEWELLERY_TYPES)
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
    .isIn(CATEGORIES)
    .withMessage("Category must be party, daily, traditional, western, statement, or bridal"),
  body("jewelleryType")
    .notEmpty()
    .withMessage("jewelleryType is required")
    .trim()
    .toLowerCase()
    .isIn(JEWELLERY_TYPES)
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

router.get("/dashboard", ...adminOnly, getDashboard);
router.get("/stats", ...adminOnly, getDashboardStats);
router.get("/analytics", ...adminOnly, getAnalytics);
router.get("/revenue", ...adminOnly, getRevenueData);
router.get("/conversion", ...adminOnly, getConversionData);
router.get("/recent-activity", ...adminOnly, getRecentActivity);
router.get("/top-products", ...adminOnly, getTopProducts);
router.get("/payments", ...adminOnly, getPayments);
router.get("/notifications", ...adminOnly, getNotifications);
router.patch("/notifications/:id/read", ...adminOnly, markNotificationRead);
router.delete("/notifications/:id", ...adminOnly, deleteNotification);
router.delete("/notifications/all", ...adminOnly, deleteAllNotifications);

router.get("/orders", ...adminOnly, getAllOrders);
router.post("/orders/invoices/bulk", ...adminOnly, downloadBulkInvoices);
router.put("/orders/:id", ...adminOnly, statusValidation, validate, updateOrderStatus);

router.get("/users", ...adminOnly, getAllUsers);
router.put("/users/:id", ...adminOnly, updateUser);
router.delete("/users/:id", ...adminOnly, deleteUser);

router.get("/products", ...adminOnly, getAllProducts);
router.post("/products", ...adminOnly, productCreateValidation, validate, createProduct);
router.post(
  "/products/upload",
  ...adminOnly,
  upload.imageUpload.single("image"),
  upload.imageUpload.validateSignatures,
  uploadProductImage,
);
router.put("/products/:id", ...adminOnly, productUpdateValidation, validate, updateProduct);
router.delete("/products/:id", ...adminOnly, deleteProduct);

// Order Stats
router.get("/orders/stats", ...adminOnly, getOrderStats);

// User Stats
router.get("/users/stats", ...adminOnly, getUserStats);

// Returns
router.get("/returns", ...adminOnly, getReturns);
router.get("/returns/stats", ...adminOnly, getReturnStats);
router.put("/returns/:id", ...adminOnly, updateReturnStatus);

// Settings
router.get("/settings", ...adminOnly, getSettings);
router.put(
  "/settings",
  ...adminOnly,
  settingsUpdateValidation,
  validate,
  updateSettings,
);

// Change Password
router.post("/change-password", ...adminOnly, changePassword);

//Reviews - Admin management routes
router.use("/reviews", reviewRoutes);

module.exports = router;

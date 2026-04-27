const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");

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
    .isIn(["gold", "silver", "diamond"])
    .withMessage("Category must be gold, silver, or diamond"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

router.get("/dashboard", protect, admin, getDashboardStats);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, statusValidation, validate, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);

router.get("/products", protect, admin, getAllProducts);
router.post("/products/upload", protect, admin, upload.single("image"), uploadProductImage);
router.put("/products/:id", protect, admin, productUpdateValidation, validate, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

module.exports = router;

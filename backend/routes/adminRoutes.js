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
      "packed",
      "ready_to_ship",
      "pickup_requested",
      "in_transit",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
      "rto",
    ])
    .withMessage("Invalid status value"),
];

router.get("/dashboard", protect, admin, getDashboardStats);

router.get("/orders", protect, admin, getAllOrders);
router.put("/orders/:id", protect, admin, statusValidation, validate, updateOrderStatus);

router.get("/users", protect, admin, getAllUsers);

router.get("/products", protect, admin, getAllProducts);
router.post("/products/upload", protect, admin, upload.single("image"), uploadProductImage);
router.put("/products/:id", protect, admin, updateProduct);
router.delete("/products/:id", protect, admin, deleteProduct);

module.exports = router;

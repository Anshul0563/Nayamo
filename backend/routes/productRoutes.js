const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", protect, admin, upload.array("images", 5), createProduct);

module.exports = router;

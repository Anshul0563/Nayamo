const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

// admin add product (multiple images)
router.post("/", protect, admin, upload.array("images", 5), createProduct);

// public
router.get("/", getProducts);

module.exports = router;
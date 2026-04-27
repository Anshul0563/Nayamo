const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");

const productValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
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
    .isIn(["gold", "silver", "diamond"])
    .withMessage("Category must be gold, silver, or diamond"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
];

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post(
  "/",
  protect,
  admin,
  upload.array("images", 5),
  upload.validateSignatures,
  productValidation,
  validate,
  createProduct
);

module.exports = router;

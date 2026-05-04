const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { upload, validateSignatures } = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");

// Validation
const productValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Title 2-200 chars"),
  body("price")
    .notEmpty()
    .withMessage("Price required")
    .isFloat({ min: 0 })
    .withMessage("Price positive number"),
  body("category")
    .notEmpty()
    .withMessage("Category required")
    .isIn(["party", "daily", "traditional", "western", "statement", "bridal"])
    .withMessage("Invalid category"),
];

// Routes
router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  admin,
  upload.array("images", 5),
  validateSignatures,
  productValidation,
  validate,
  createProduct
);

module.exports = router;


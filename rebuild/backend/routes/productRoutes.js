const express = require("express");
const router = express.Router();
const multer = require("multer");
const { body } = require("express-validator");

const {
  createProduct,
  getProducts,
  getProductById,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const upload = require("../middleware/uploadMiddleware");

const uploadImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const productValidation = [
  body("title").trim().notEmpty().isLength({ min: 2, max: 200 }),
  body("price").isFloat({ min: 0 }),
  body("category").isIn(["party", "daily", "traditional", "western", "statement", "bridal"]),
];

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  protect,
  admin,
  uploadImages.array("images", 5),
  productValidation,
  validate,
  createProduct
);

module.exports = router;


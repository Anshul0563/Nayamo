const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  addToCart,
  updateQuantity,
  removeFromCart,
  getCart,
  deleteCartItem,
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const cartValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

const quantityValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

router.post("/add", protect, cartValidation, validate, addToCart);
router.put("/update", protect, quantityValidation, validate, updateQuantity);
router.post("/remove", protect, cartValidation, validate, removeFromCart);
router.get("/", protect, getCart);
router.delete("/:productId", protect, deleteCartItem);

module.exports = router;

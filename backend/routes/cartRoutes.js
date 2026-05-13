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
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId"),

  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("quantity must be at least 1"),
];

const quantityValidation = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId"),
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1 })
    .withMessage("quantity must be at least 1"),
];


router.post("/add", protect, cartValidation, validate, addToCart);
router.put("/update", protect, quantityValidation, validate, updateQuantity);
router.post("/remove", protect, cartValidation, validate, removeFromCart);
router.get("/", protect, getCart);
router.delete("/:productId", protect, deleteCartItem);

module.exports = router;

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

// Validation
const cartValidation = [
  body("productId").notEmpty().isMongoId().withMessage("Valid product ID required"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity min 1"),
];

// Routes (all protected)
router.use(protect);

router.get("/", getCart);
router.post("/add", cartValidation, validate, addToCart);
router.put("/update", cartValidation, validate, updateQuantity);
router.delete("/remove", cartValidation, validate, removeFromCart);

module.exports = router;


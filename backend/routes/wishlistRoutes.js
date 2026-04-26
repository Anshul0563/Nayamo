const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const wishlistValidation = [
  body("productId")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID"),
];

router.post("/add", protect, wishlistValidation, validate, addToWishlist);
router.get("/", protect, getWishlist);
router.post("/remove", protect, wishlistValidation, validate, removeFromWishlist);

module.exports = router;

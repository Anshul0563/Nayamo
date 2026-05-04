const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const wishlistValidation = [
  body("productId").notEmpty().isMongoId().withMessage("Valid product ID required"),
];

router.use(protect);

router.get("/", getWishlist);
router.post("/add", wishlistValidation, validate, addToWishlist);
router.delete("/remove", wishlistValidation, validate, removeFromWishlist);

module.exports = router;


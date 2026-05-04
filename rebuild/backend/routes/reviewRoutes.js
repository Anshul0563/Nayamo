const express = require("express");
const { body } = require("express-validator");
const router = express.Router({ mergeParams: true });

const {
  submitReview,
  getProductReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating 1-5"),
  body("comment")
    .notEmpty()
    .withMessage("Comment required")
    .isLength({ max: 1000 })
    .withMessage("Comment max 1000 chars"),
];

router.use(protect);

router.get("/", getProductReviews);
router.post(
  "/product/:productId",
  reviewValidation,
  validate,
  submitReview
);

module.exports = router;


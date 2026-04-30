const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const {
  getAllReviews,
  getReview,
  approveReview,
  rejectReview,
  deleteReview,
  bulkApprove,
  getProductReviews,
  getReviewStats
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const validate = require("../middleware/validateMiddleware");

// Validation
const idValidation = [
  param("id").isMongoId().withMessage("Invalid review ID")
];

const rejectValidation = [
  body("reason").optional().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters")
];

const bulkValidation = [
  body("ids").isArray({ min: 1 }).withMessage("Review IDs array is required")
];

// Public routes - Get approved reviews for a product
router.get("/product/:productId", getProductReviews);

// Admin routes - All protected
router.get("/", protect, admin, getAllReviews);
router.get("/stats", protect, admin, getReviewStats);
router.get("/:id", protect, admin, idValidation, validate, getReview);
router.patch("/:id/approve", protect, admin, idValidation, validate, approveReview);
router.patch("/:id/reject", protect, admin, idValidation, rejectValidation, validate, rejectReview);
router.delete("/:id", protect, admin, idValidation, validate, deleteReview);
router.post("/bulk-approve", protect, admin, bulkValidation, validate, bulkApprove);

module.exports = router;

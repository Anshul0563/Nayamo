const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const {
  submitReview,
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
const upload = require("../middleware/uploadMiddleware");

const reviewImageUpload = (req, res, next) => {
  upload.array("images", 3)(req, res, (error) => {
    if (!error) return next();

    let message = error.message || "Unable to upload review images";
    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Each review image must be 5 MB or smaller";
    } else if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
      message = "A review can include up to 3 images";
    }

    return res.status(400).json({ success: false, message });
  });
};

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

// Protected route - Submit review (requires login)
router.post(
  "/product/:productId",
  protect,
  reviewImageUpload,
  upload.validateSignatures,
  submitReview,
);

// Admin routes - All protected
router.get("/", protect, admin, getAllReviews);
router.get("/stats", protect, admin, getReviewStats);
router.get("/:id", protect, admin, idValidation, validate, getReview);
router.patch("/:id/approve", protect, admin, idValidation, validate, approveReview);
router.patch("/:id/reject", protect, admin, idValidation, rejectValidation, validate, rejectReview);
router.delete("/:id", protect, admin, idValidation, validate, deleteReview);
router.post("/bulk-approve", protect, admin, bulkValidation, validate, bulkApprove);

module.exports = router;

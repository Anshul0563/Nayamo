const asyncHandler = require("../utils/asyncHandler");
const reviewService = require("../services/reviewService");

exports.submitReview = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  const productId = req.params.productId;

  const review = await reviewService.createReview(
    req.user._id,
    productId,
    { rating, comment, images }
  );

  res.status(201).json({
    success: true,
    message: "Review submitted",
    data: review,
  });
});

exports.getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getProductReviews(req.params.productId, req.query);
  res.json({
    success: true,
    data: reviews,
  });
});


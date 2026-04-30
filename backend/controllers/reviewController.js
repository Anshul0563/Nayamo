const Review = require("../models/Review");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const logger = require("../config/logger");
const { emitReviewNotification } = require("../services/notificationService");

// SUBMIT REVIEW (User)
exports.submitReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  
  // Validate required fields
  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating is required and must be between 1 and 5");
  }
  
  // Validate product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }
  
  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id
  });
  
  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }
  
  // Create review
  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating: Number(rating),
    comment: comment?.trim() || "",
    isApproved: false, // Requires admin approval
    status: "pending"
  });
  
// Populate for response
  await review.populate("user", "name");
  await review.populate("product", "title");
  
  logger.info(`New review submitted for product ${productId} by user ${req.user._id}`);
  
  // Send notification to admin
  emitReviewNotification(review, 'new_review').catch(err => 
    logger.error('Review notification failed:', err.message)
  );
  
  res.status(201).json({
    success: true,
    message: "Review submitted successfully. It will be visible after approval.",
    data: review
  });
});

// GET ALL REVIEWS (Admin)
exports.getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search, rating, product } = req.query;
  
  const query = {};
  if (status) {
    if (status === "pending") query.isApproved = false;
    else if (status === "approved") query.isApproved = true;
    else if (status === "rejected") query.status = "rejected";
  }
  if (rating) query.rating = Number(rating);
  if (product) query.product = product;

  const skip = (page - 1) * limit;
  
  const reviews = await Review.find(query)
    .populate("user", "name email")
    .populate("product", "title images price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
  
  const totalItems = await Review.countDocuments(query);
  
  const stats = await Review.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  // Add search filter after count
  let filteredReviews = reviews;
  if (search) {
    const safeSearch = new RegExp(search, "i");
    filteredReviews = reviews.filter(r => 
      r.title?.search(safeSearch) !== -1 ||
      r.comment?.search(safeSearch) !== -1 ||
      r.user?.name?.search(safeSearch) !== -1 ||
      r.product?.title?.search(safeSearch) !== -1
    );
  }

  res.json({
    success: true,
    data: filteredReviews,
    stats: {
      pending: stats.find(s => s._id === "pending")?.count || 0,
      approved: stats.find(s => s._id === "approved")?.count || 0,
      rejected: stats.find(s => s._id === "rejected")?.count || 0,
      avgRating: stats[0]?.avgRating?.toFixed(1) || 0
    },
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: Number(limit)
    }
  });
});

// GET SINGLE REVIEW
exports.getReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("product", "title images price description")
    .lean();

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  res.json({
    success: true,
    data: review
  });
});

// APPROVE REVIEW
exports.approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      isApproved: true, 
      status: "approved",
      approvedAt: new Date()
    },
    { new: true }
  ).populate("user", "name email").populate("product", "title");

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  logger.info(`Review ${req.params.id} approved by admin`);

  // Update product ratings
  const productId = review.product?._id || review.product;
  if (productId) {
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": Math.round((stats[0]?.avgRating || 0) * 10) / 10,
      "ratings.count": stats[0]?.count || 0
    });
  }

  // Send notification
  emitReviewNotification(review, 'review_approved').catch(err => 
    logger.error('Review notification failed:', err.message)
  );

  res.json({
    success: true,
    message: "Review approved successfully",
    data: review
  });
});

// REJECT REVIEW
exports.rejectReview = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      status: "rejected", 
      isApproved: false,
      rejectedAt: new Date(),
      adminNotes: reason || ""
    },
    { new: true }
  ).populate("user", "name email").populate("product", "title");

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  logger.info(`Review ${req.params.id} rejected by admin`);

  res.json({
    success: true,
    message: "Review rejected",
    data: review
  });
});

// DELETE REVIEW
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  logger.info(`Review ${req.params.id} deleted by admin`);

  res.json({
    success: true,
    message: "Review deleted"
  });
});

// BULK APPROVE
exports.bulkApprove = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids)) {
    res.status(400);
    throw new Error("Please provide review IDs");
  }

  const result = await Review.updateMany(
    { _id: { $in: ids } },
    { 
      isApproved: true, 
      status: "approved",
      approvedAt: new Date()
    }
  );

  logger.info(`${result.modifiedCount} reviews approved by admin`);

  res.json({
    success: true,
    message: `${result.modifiedCount} reviews approved`,
    data: { modifiedCount: result.modifiedCount }
  });
});

// GET REVIEWS BY PRODUCT
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
  
  const totalItems = await Review.countDocuments({ product: productId, isApproved: true });

  // Get stats for this product
  const statsResult = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    avgRating: statsResult[0]?.avgRating?.toFixed(1) || 0,
    total: statsResult[0]?.count || 0
  };

  res.json({
    success: true,
    data: reviews,
    stats,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: Number(limit)
    }
  });
});

// GET REVIEW STATS
exports.getReviewStats = asyncHandler(async (req, res) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);

  const productStats = await Review.aggregate([
    { $match: { isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        productId: "$_id",
        title: "$product.title",
        avgRating: 1,
        count: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      pending: stats.find(s => s._id === "pending")?.count || 0,
      approved: stats.find(s => s._id === "approved")?.count || 0,
      rejected: stats.find(s => s._id === "rejected")?.count || 0,
      avgRating: (stats.find(s => s._id === "approved")?.avgRating || 0).toFixed(1),
      topProducts: productStats
    }
  });
});

const Review = require("../models/Review");
const Product = require("../models/Product");

class ReviewService {
  async createReview(userId, productId, reviewData) {
    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      throw new Error("Review already submitted");
    }

    const review = new Review({
      user: userId,
      product: productId,
      ...reviewData,
    });

    await review.save();
    await Review.calcAverageRatings(productId);
    
    return review.populate("user", "name");
  }

  async getProductReviews(productId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    return {
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }

  async updateReview(userId, productId, updateData) {
    const review = await Review.findOne({ user: userId, product: productId });
    if (!review) throw new Error("Review not found");

    Object.assign(review, updateData);
    await review.save();

    await Review.calcAverageRatings(productId);
    return review.populate("user", "name");
  }

  async deleteReview(userId, productId) {
    const review = await Review.findOneAndDelete({ user: userId, product: productId });
    if (!review) throw new Error("Review not found");

    await Review.calcAverageRatings(productId);
    return review;
  }
}

module.exports = new ReviewService();


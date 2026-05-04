const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: [{
      url: String,
      publicId: String,
    }],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Aggregates ratings
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.model("Product").findByIdAndUpdate(productId, {
      "ratings.average": Math.round(stats[0].avgRating * 10) / 10,
      "ratings.count": stats[0].numReviews,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post("remove", function () {
  this.constructor.calcAverageRatings(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);


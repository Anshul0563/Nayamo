const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  adminNotes: {
    type: String,
    default: ""
  },
  rejectedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ status: 1, isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for status
reviewSchema.virtual("status").get(function() {
  if (this.isApproved) return "approved";
  if (this.status === "rejected") return "rejected";
  return "pending";
});

// Calculate average rating on product save
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId, isApproved: true }
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    const Product = require("./Product");
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": stats[0].avgRating,
      "ratings.count": stats[0].numReviews
    });
  }
};

// Post save middleware
reviewSchema.post("save", async function() {
  await this.constructor.calcAverageRating(this.product);
});

// Post remove middleware  
reviewSchema.post("remove", async function() {
  await this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);

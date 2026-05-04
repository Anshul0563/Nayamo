const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],
  },
  { timestamps: true }
);

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ products: 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);


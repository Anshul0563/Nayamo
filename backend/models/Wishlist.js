const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

// Indexes for performance
wishlistSchema.index({ products: 1 });

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Ensure no duplicate products in wishlist
wishlistSchema.pre("save", function (next) {
  this.products = [...new Set(this.products.map((id) => id.toString()))];
  next();
});

module.exports = mongoose.model("Wishlist", wishlistSchema);

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    images: [
      {
        url: { type: String, trim: true },
        publicId: { type: String, trim: true },
      },
    ],

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["party", "daily", "traditional", "western", "statement", "bridal"],
        message: "Category must be party, daily, traditional, western, statement, or bridal",
      },
    },

    jewelleryType: {
      type: String,
      default: "earrings",
      enum: {
        values: ["earrings", "necklaces", "rings", "bracelets", "bangles", "sets", "other"],
        message: "Invalid jewellery type",
      },
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
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

    images: [{
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    }],

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
      enum: {
        values: ["earrings", "necklaces", "rings", "bracelets", "bangles", "sets", "other"],
        message: "Invalid jewellery type",
      },
      default: "earrings",
    },

    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },

    material: {
      type: String,
      trim: true,
      maxlength: [100, "Material cannot exceed 100 characters"],
    },

    color: {
      type: String,
      trim: true,
      maxlength: [100, "Color cannot exceed 100 characters"],
    },

    finish: {
      type: String,
      trim: true,
      maxlength: [100, "Finish cannot exceed 100 characters"],
    },

    occasion: {
      type: String,
      trim: true,
      maxlength: [100, "Occasion cannot exceed 100 characters"],
    },

    style: {
      type: String,
      trim: true,
      maxlength: [100, "Style cannot exceed 100 characters"],
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
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);


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
        values: ["gold", "silver", "diamond"],
        message: "Category must be gold, silver, or diamond",
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
  },
  { timestamps: true }
);

// Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 }); // Compound index for filtered price queries
productSchema.index({ title: "text", description: "text" }); // Text search index
productSchema.index({ createdAt: -1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);

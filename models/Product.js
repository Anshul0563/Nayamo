const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: String,

  price: {
    type: Number,
    required: true
  },

  images: [String], 
  
  category: {
    type: String,
    required: true,
    enum: ["gold", "silver", "diamond"]
  },

  stock: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],

  totalPrice: {
    type: Number,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["cod", "online"],
    default: "cod"
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
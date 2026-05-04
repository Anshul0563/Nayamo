const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name required"],
        trim: true,
      },
      address: {
        type: String,
        required: [true, "Address required"],
        trim: true,
      },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        required: [true, "Pincode required"],
      },
      phone: {
        type: String,
        required: [true, "Phone required"],
      },
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method required"],
      enum: ["cod", "razorpay", "card"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount required"],
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    trackingId: String,
    returnReason: String,
    // Cleanup fields
    statusUpdatedAt: Date,
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "shippingAddress.pincode": 1 });

module.exports = mongoose.model("Order", orderSchema);


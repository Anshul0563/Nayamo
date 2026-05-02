const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        price: {
          type: Number,
          required: [true, "Price at time of order is required"],
          min: [0, "Price cannot be negative"],
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },

    address: {
      type: String,
      required: [true, "Delivery address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },

    paymentMethod: {
      type: String,
      enum: {
        values: ["cod", "online"],
        message: "Payment method must be 'cod' or 'online'",
      },
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "Invalid payment status",
      },
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

paidAt: Date,

    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "ready_to_ship",
          "pickup_requested",
          "in_transit",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "returned",
          "return_requested",
          "rto",
        ],
        message: "Invalid order status",
      },
      default: "pending",
    },

    readyToShip: {
      type: Boolean,
      default: false,
    },

    delhivery: {
      waybill: String,
      labelUrl: String,
      courier: {
        type: String,
        default: "Delhivery",
      },
      pickupRequested: {
        type: Boolean,
        default: false,
      },
      trackingUrl: String,
      createdAt: Date,
    },

    deliveredAt: Date,
    cancelledAt: Date,
    returnedAt: Date,

    // Razorpay payment details
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Idempotency key to prevent duplicate orders
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "delhivery.waybill": 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

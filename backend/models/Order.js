// FILE: models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "ready_to_ship",
        "pickup_requested",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "rto",
      ],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
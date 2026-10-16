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

    subtotal: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    gstRate: {
      type: Number,
      default: 12,
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

    // Shiprocket shipment data for orders created after the shipping migration.
    // The legacy Delhivery object above is intentionally retained for history.
    shiprocket: {
      orderId: String,
      shipmentId: String,
      awb: String,
      courier: String,
      trackingUrl: String,
      labelUrl: String,
      status: String,
      pickupRequested: { type: Boolean, default: false },
      creationStatus: { type: String, enum: ["creating", "created", "failed", "reconciliation_required"] },
      creationAttemptId: String,
      creationAttemptedAt: Date,
      lastCreationError: String,
      creationLockAt: Date,
      createdAt: Date,
      updatedAt: Date,
      lastWebhookAt: Date,
      lastWebhook: mongoose.Schema.Types.Mixed,
      events: { type: [mongoose.Schema.Types.Mixed], default: undefined },
    },

    returnShipment: {
      provider: String,
      orderId: String,
      shipmentId: String,
      awb: String,
      waybill: String,
      courier: String,
      labelUrl: String,
      trackingUrl: String,
      status: String,
      lastWebhookAt: Date,
      lastWebhook: mongoose.Schema.Types.Mixed,
      events: { type: [mongoose.Schema.Types.Mixed], default: undefined },
      pickupRequested: {
        type: Boolean,
        default: false,
      },
      createdAt: Date,
    },

    deliveredAt: Date,
    cancelledAt: Date,
    returnedAt: Date,

    // Order cleanup/archive fields
    statusUpdatedAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
    },

    // Razorpay payment details
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    refundId: String,

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundStatus: {
      type: String,
      enum: {
        values: ["none", "pending", "processed", "failed"],
        message: "Invalid refund status",
      },
      default: "none",
    },

    refundReason: String,

    refundedAt: Date,

    // Idempotency key to prevent duplicate orders
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

// Indexes for performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ "delhivery.waybill": 1 });
orderSchema.index({ "shiprocket.awb": 1 });
orderSchema.index({ "shiprocket.orderId": 1 });
orderSchema.index({ createdAt: -1 });
// Index for order cleanup cron job
orderSchema.index({ status: 1, statusUpdatedAt: 1, isArchived: 1 });

module.exports = mongoose.model("Order", orderSchema);

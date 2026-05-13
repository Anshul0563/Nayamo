const Razorpay = require("razorpay");

const Order = require("../models/Order");
const Product = require("../models/Product");

const razorpay = new Razorpay({
  key_id:
    process.env.RAZORPAY_KEY_ID,

  key_secret:
    process.env.RAZORPAY_KEY_SECRET,
});

// =========================
// PROCESS REFUND
// =========================
exports.processRefund =
  async ({
    orderId,
    reason =
      "Order cancelled",
  }) => {
    const order =
      await Order.findById(orderId);

    if (!order) {
      throw new Error(
        "Order not found"
      );
    }

    // Already refunded
    if (
      order.refundStatus ===
      "processed"
    ) {
      throw new Error(
        "Refund already processed"
      );
    }

    // Only paid orders
    if (!order.isPaid) {
      throw new Error(
        "Cannot refund unpaid order"
      );
    }

    if (
      !order.razorpayPaymentId
    ) {
      throw new Error(
        "Missing Razorpay payment ID"
      );
    }

    // Mark pending
    order.refundStatus =
      "pending";

    await order.save();

    // Razorpay refund
    const refund =
      await razorpay.payments.refund(
        order
          .razorpayPaymentId,
        {
          amount:
            Math.round(
              order.totalPrice *
                100
            ),

          notes: {
            reason,
          },
        }
      );

    // Update order
    order.refundId =
      refund.id;

    order.refundAmount =
      order.totalPrice;

    order.refundStatus =
      "processed";

    order.refundReason =
      reason;

    order.refundedAt =
      new Date();

    order.paymentStatus =
      "refunded";

    order.status =
      "cancelled";

    // Restore stock
    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        );

      if (product) {
        product.stock +=
          item.quantity;

        await product.save();
      }
    }

    await order.save();

    return {
      success: true,
      refund,
      order,
    };
  };
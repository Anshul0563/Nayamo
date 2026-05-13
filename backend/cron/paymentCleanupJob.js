const cron = require("node-cron");

const Order = require("../models/Order");
const Product = require("../models/Product");

const startPaymentCleanupJob =
  () => {
    // Every 10 minutes
    cron.schedule(
      "*/10 * * * *",
      async () => {
        try {
          console.log(
            "[CRON] Running payment cleanup..."
          );

          // Orders older than 30 mins
          const expiryTime =
            new Date(
              Date.now() -
                30 *
                  60 *
                  1000
            );

          const failedOrders =
            await Order.find({
              paymentMethod:
                "online",

              paymentStatus:
                "pending",

              isPaid: false,

              status: "pending",

              createdAt: {
                $lt: expiryTime,
              },
            });

          for (const order of failedOrders) {
            console.log(
              "[CRON] Cleaning order:",
              order._id
            );

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

            // Mark failed
            order.status =
              "cancelled";

            order.paymentStatus =
              "failed";

            await order.save();
          }

          console.log(
            `[CRON] Cleaned ${failedOrders.length} failed orders`
          );
        } catch (err) {
          console.error(
            "[CRON ERROR]",
            err
          );
        }
      }
    );
  };

module.exports =
  startPaymentCleanupJob;
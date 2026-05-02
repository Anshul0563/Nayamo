const Order = require("../models/Order");
const logger = require("../config/logger");

// Final statuses that trigger 30-day countdown
const FINAL_STATUSES = ["delivered", "cancelled", "returned", "rto"];

// Days after which orders are archived
const ARCHIVE_AFTER_DAYS = 30;

/**
 * Cleanup old orders - Run daily
 * Archives orders that have been in final state for 30+ days
 */
const cleanupOldOrders = async () => {
  try {
    const logger = require("../config/logger");
    logger.info("Starting order cleanup job...");

    // Calculate the date 30 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_AFTER_DAYS);

    // Find orders that meet the archive criteria:
    // - Status is a final state (delivered, cancelled, returned, rto)
    // - statusUpdatedAt is older than 30 days
    // - Not already archived
    const result = await Order.updateMany(
      {
        status: { $in: FINAL_STATUSES },
        statusUpdatedAt: { $lte: cutoffDate },
        isArchived: false,
      },
      {
        $set: { isArchived: true },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Order cleanup: Archived ${result.modifiedCount} orders`);
    } else {
      logger.info("Order cleanup: No orders to archive");
    }

    return {
      success: true,
      archivedCount: result.modifiedCount,
    };
  } catch (error) {
    logger.error("Order cleanup job failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Manual trigger for cleanup (useful for testing)
 */
const runCleanupNow = async () => {
  return cleanupOldOrders();
};

// Export for use in server.js
module.exports = {
  cleanupOldOrders,
  runCleanupNow,
  FINAL_STATUSES,
  ARCHIVE_AFTER_DAYS,
};

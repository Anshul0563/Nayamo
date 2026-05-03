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
  const logger = require("../config/logger");
  logger.info("Order cleanup DISABLED per requirements - All orders kept visible forever");
  return {
    success: true,
    archivedCount: 0,
    message: "Disabled to keep complete order history visible"
  };
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

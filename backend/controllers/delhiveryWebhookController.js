const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');
const Order = require('../models/Order');

// Map Delhivery event/status to internal order status
function mapDelhiveryToOrderStatus(delhiveryEvent) {
  // delhiveryEvent may include fields like status, event, remarks
  const s = (delhiveryEvent?.status || delhiveryEvent?.event || '').toLowerCase();

  if (/pickup|collected|picked up/.test(s)) return 'in_transit';
  if (/in[-_ ]?transit|transit/.test(s)) return 'in_transit';
  if (/delivered|successfully delivered/.test(s)) return 'delivered';
  if (/rto|returned to origin|undelivered|returned/.test(s)) return 'rto';
  if (/cancelled|canceled/.test(s)) return 'cancelled';

  // default: return null to indicate no mapping
  return null;
}

// Webhook endpoint to receive Delhivery status updates
exports.handleDelhiveryWebhook = asyncHandler(async (req, res) => {
  // Delhivery may send different payload shapes; accept JSON
  const payload = req.body || {};

  logger.info('Received Delhivery webhook', { payload: payload });

  // Try to extract waybill / awb
  const waybill = payload?.waybill || payload?.awb || payload?.consignment || payload?.order_id;
  const event = payload?.event || payload?.status || payload?.tracking_status || payload?.type || null;

  if (!waybill) {
    res.status(400).json({ success: false, message: 'Missing waybill in Delhivery webhook' });
    return;
  }

  // Find the order with matching delhivery.waybill or returnShipment.waybill
  const order = await Order.findOne({ $or: [{ 'delhivery.waybill': String(waybill) }, { 'returnShipment.waybill': String(waybill) }] });

  if (!order) {
    // Not found - still respond 200 to acknowledge
    logger.warn('Delhivery webhook: order not found for waybill', { waybill });
    return res.json({ success: true, message: 'No matching order' });
  }

  const mapped = mapDelhiveryToOrderStatus({ status: event });

  if (!mapped) {
    logger.info('Delhivery webhook: no mapped status for event', { event });
    return res.json({ success: true, message: 'No action for this event' });
  }

  // Update order status only if it changes
  if (order.status !== mapped) {
    order.status = mapped;
    order.statusUpdatedAt = new Date();

    // Optionally record the last delhivery payload for audit
    order.delhivery = order.delhivery || {};
    order.delhivery.lastWebhook = payload;

    await order.save();

    // Emit socket event to notify admin and client
    try {
      if (global && global.io) {
        global.io.emit('order:status_updated', {
          orderId: order._id,
          status: order.status,
          updatedAt: order.statusUpdatedAt,
        });
      }
    } catch (err) {
      logger.error('Failed to emit socket event for delhivery webhook', err);
    }

    // Optionally send notification
    try {
      const { emitOrderNotification } = require('../services/notificationService');
      emitOrderNotification(order, order.status);
    } catch (err) {
      // ignore notification errors
    }
  }

  res.json({ success: true, message: 'Processed' });
});

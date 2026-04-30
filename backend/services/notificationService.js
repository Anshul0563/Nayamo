const Notification = require('../models/Notification');
const logger = require('../config/logger');
const User = require('../models/User');

const getAdminIds = async (adminId) => {
  if (adminId) return [adminId];
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
  return admins.map((adminUser) => adminUser._id);
};

// Centralized notification emitter
const emitNotification = async (adminId, title, message, type, severity = 'info', data = {}) => {
  try {
    const adminIds = await getAdminIds(adminId);
    if (adminIds.length === 0) return [];

    const notifications = await Notification.insertMany(
      adminIds.map((id) => ({
        title,
        message,
        type,
        severity,
        data,
        adminId: id
      }))
    );

    // Emit to all admins via socket
    if (global.emitToAdmins) {
      global.emitToAdmins('notification:new', {
        _id: notifications[0]._id,
        id: notifications[0]._id,
        title,
        message,
        type,
        severity,
        isRead: false,
        createdAt: notifications[0].createdAt,
        data
      });
    }

    logger.info(`Notification sent to ${adminIds.length} admin(s): ${title}`);
    return notifications;
  } catch (error) {
    logger.error('Notification emission failed:', error);
  }
};

// Order-related notifications
const emitOrderNotification = async (order, eventType) => {
  let title, message, type = 'order';
  const orderLabel = order._id?.toString().slice(-8) || order.orderId || 'new';

  switch (eventType) {
    case 'new':
      title = 'New Order Received';
      message = `Order #${orderLabel} - ₹${Number(order.totalPrice || 0).toLocaleString('en-IN')}`;
      break;
    case 'confirmed':
      title = 'Order Confirmed';
      message = `Order #${orderLabel} has been confirmed`;
      break;
    case 'shipped':
    case 'in_transit':
      title = 'Order Shipped';
      message = `Order #${orderLabel} is in transit`;
      break;
    case 'cancelled':
      title = 'Order Cancelled';
      message = `Order #${orderLabel} was cancelled`;
      break;
    case 'delivered':
      title = 'Order Delivered';
      message = `Order #${orderLabel} successfully delivered`;
      break;
    case 'returned':
      title = 'Order Returned';
      message = `Order #${orderLabel} has been marked returned`;
      break;
    case 'payment_success':
      title = 'Payment Success';
      message = `Payment received for Order #${orderLabel}`;
      type = 'payment';
      break;
    case 'payment_failed':
      title = 'Payment Failed';
      message = `Payment failed for Order #${orderLabel}`;
      type = 'payment';
      break;
    default:
      return;
  }

  const severity = ['cancelled', 'returned', 'payment_failed'].includes(eventType) ? 'warning' : 'success';
  await emitNotification(null, title, message, type, severity, { orderId: order._id, path: `/orders?order=${order._id}` });
};

// Inventory notifications
const emitInventoryNotification = async (product, eventType) => {
  let title, message, type = 'inventory';

  switch (eventType) {
    case 'low_stock':
      title = 'Low Stock Alert';
      message = `${product.title} stock: ${product.stock} units remaining`;
      break;
    case 'out_of_stock':
      title = 'Out of Stock';
      message = `${product.title} is now out of stock`;
      break;
    case 'restocked':
      title = 'Product Restocked';
      message = `${product.title} stock updated to ${product.stock}`;
      break;
    default:
      return;
  }

  await emitNotification(null, title, message, type, eventType === 'restocked' ? 'success' : 'warning', {
    productId: product._id,
    path: '/inventory'
  });
};

// User notifications
const emitUserNotification = async (user, eventType) => {
  let title, message, type = 'user';

  switch (eventType) {
    case 'new_registration':
      title = 'New User Registered';
      message = `Welcome ${user.name} (${user.email})`;
      break;
    default:
      return;
  }

  await emitNotification(null, title, message, type, 'info', { userId: user._id, path: '/users' });
};

// Review notifications
const emitReviewNotification = async (review, eventType, adminId = null) => {
  let title, message, type = 'review', severity = 'info';

  switch (eventType) {
    case 'new_review':
      title = 'New Review Submitted';
      message = `${review.rating}★ review for "${review.product?.title || 'a product'}" by ${review.user?.name || 'Anonymous'}`;
      break;
    case 'review_approved':
      title = 'Review Approved';
      message = `Review for "${review.product?.title || 'product'}" approved`;
      break;
    case 'review_rejected':
      title = 'Review Rejected';
      message = `Review for "${review.product?.title || 'product'}" rejected`;
      break;
    default:
      return;
  }

  if (eventType === 'new_review') severity = 'success';
  await emitNotification(adminId, title, message, type, severity, {
    reviewId: review._id,
    productId: review.product?._id || review.product,
    path: '/reviews'
  });
};

module.exports = {
  emitNotification,
  emitOrderNotification,
  emitInventoryNotification,
  emitUserNotification,
  emitReviewNotification
};

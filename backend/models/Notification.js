const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['order', 'inventory', 'user', 'payment', 'security'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for fast queries
notificationSchema.index({ adminId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);


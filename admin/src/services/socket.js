import { io } from 'socket.io-client';
import { adminAPI } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const SOCKET_URL = API_URL.replace(/\/api\/v1\/?$/, '');

class SocketService {
  constructor() {
    this.socket = null;
    this.notifications = [];
    this.unreadCount = 0;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(`${SOCKET_URL}/admin`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      autoConnect: true
    });

// Admin namespace connection
    this.socket.on('connect', () => {
      console.log('Socket.IO connected - Admin namespace');
      
      // Emit socket connect event for UI state tracking
      window.dispatchEvent(new CustomEvent('socket:connect'));
      
      // Note: Initial notifications are sent directly from server on connection
      // No need to call fetchNotifications() - prevents duplicate 429 errors
    });

    // Real-time notifications
    this.socket.on('notification:new', (notification) => {
      this.notifications.unshift(notification);
      this.unreadCount++;
      
      // Emit to global toast system
      window.dispatchEvent(new CustomEvent('realtime-notification', { 
        detail: notification 
      }));
      
      console.log('New notification:', notification.title);
    });

    this.socket.on('notifications', (notifications) => {
      this.notifications = notifications || [];
      this.unreadCount = this.notifications.filter((item) => !item.isRead).length;
      window.dispatchEvent(new CustomEvent('notifications:sync', {
        detail: { notifications: this.notifications, unreadCount: this.unreadCount }
      }));
    });

    // Notification read ack
    this.socket.on('notification:read:ack', (id) => {
      const notif = this.notifications.find(n => (n.id || n._id) === id);
      if (notif) notif.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });

    // Live dashboard refresh triggers
    this.socket.on('order:new', (order) => {
      // Emit order data for RealTimeFeed component
      window.dispatchEvent(new CustomEvent('order:new', { 
        detail: order || {} 
      }));
      // Legacy event for backward compatibility
      window.dispatchEvent(new CustomEvent('refresh-dashboard'));
    });

    this.socket.on('order:status_updated', (order) => {
      // Emit order data for RealTimeFeed component
      window.dispatchEvent(new CustomEvent('order:status_updated', { 
        detail: order || {} 
      }));
      // Legacy event for backward compatibility
      window.dispatchEvent(new CustomEvent('refresh-orders'));
    });

    this.socket.on('inventory:low_stock', () => {
      window.dispatchEvent(new CustomEvent('refresh-inventory'));
    });

    // Disconnect handling
    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      window.dispatchEvent(new CustomEvent('socket:disconnect'));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async fetchNotifications() {
    try {
      const { data } = await adminAPI.getNotifications({ read: false, limit: 10 });
      this.notifications = data.data || [];
      this.unreadCount = data.data?.length || 0;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }

  markAsRead(notificationId) {
    this.socket?.emit('notification:read', notificationId);
    return adminAPI.markNotificationRead(notificationId);
  }

  getUnreadCount() {
    return this.unreadCount;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;

import { io } from 'socket.io-client';
import { adminAPI } from './api';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.notifications = [];
    this.unreadCount = 0;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      autoConnect: true
    });

    // Admin namespace connection
    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected - Admin namespace');
      this.socket.emit('join', { namespace: '/admin' });
      
      // Request initial notifications
      this.fetchNotifications();
    });

    // Real-time notifications
    this.socket.on('notification:new', (notification) => {
      this.notifications.unshift(notification);
      this.unreadCount++;
      
      // Emit to global toast system
      window.dispatchEvent(new CustomEvent('realtime-notification', { 
        detail: notification 
      }));
      
      console.log('🔔 New notification:', notification.title);
    });

    // Notification read ack
    this.socket.on('notification:read:ack', (id) => {
      const notif = this.notifications.find(n => n.id === id);
      if (notif) notif.isRead = true;
      this.unreadCount--;
    });

    // Live dashboard refresh triggers
    this.socket.on('order:new', () => {
      window.dispatchEvent(new CustomEvent('refresh-dashboard'));
    });

    this.socket.on('order:status_updated', () => {
      window.dispatchEvent(new CustomEvent('refresh-orders'));
    });

    this.socket.on('inventory:low_stock', () => {
      window.dispatchEvent(new CustomEvent('refresh-inventory'));
    });

    // Disconnect handling
    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
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
  }

  getUnreadCount() {
    return this.unreadCount;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;


import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Bell, Package, DollarSign, Users, Clock, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

const NotificationTicker = ({ recentOrders = [], stats = {} }) => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const generateNotifications = (recentOrders, stats) => {
    const notifications = [];

    // Recent orders as notifications
    recentOrders.slice(0, 3).forEach((order) => {
      notifications.push({
        id: order._id || order.id,
        type: 'order',
        message: `New order #${String(order._id || order.id).slice(-8)} - ₹${Number(order.totalPrice || order.amount || 0).toLocaleString('en-IN')}`,
        icon: Package,
        time: new Date(order.createdAt || order.updatedAt)
      });
    });

    // Recent user / payment events from stats if available
    if (stats.newUsersToday) {
      notifications.push({
        id: 'new-user',
        type: 'user',
        message: `${stats.newUsersToday || 5} new customers registered`,
        icon: UserPlus,
        time: new Date()
      });
    }

    if (stats.todayRevenue) {
      notifications.push({
        id: 'revenue',
        type: 'payment',
        message: `Today revenue ₹${Number(stats.todayRevenue).toLocaleString('en-IN')}`,
        icon: DollarSign,
        time: new Date()
      });
    }

    // Low stock if any
    if (stats.lowStockProducts > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'low_stock',
        message: `Low stock: ${stats.lowStockProducts} items`,
        icon: Bell,
        time: new Date()
      });
    }

    return notifications.slice(0, 5);
  };

  const notifications = generateNotifications(recentOrders, stats);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % Math.max(notifications.length, 1));
    }, 5000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="bg-white/90 dark:bg-neutral-900/90 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-md w-full max-w-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-500 rounded-lg flex items-center justify-center shadow-lg">
          <Bell className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Live Updates
          </p>
          <div className="flex gap-2 overflow-hidden">
            {notifications.map((notification, index) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-center gap-2 p-2 rounded-lg bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/30 dark:border-neutral-700/50 min-w-0 flex-shrink-0 transition-all whitespace-nowrap ${
                    index === scrollIndex 
                      ? 'shadow-md ring-2 ring-gold-400/50 scale-105 bg-white dark:bg-neutral-700' 
                      : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <Icon size={14} className="text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[140px]">
                      {notification.message}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatDistanceToNow(notification.time, { addSuffix: true, locale: enIN })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-xs font-mono bg-gold-500/10 text-gold-600 px-2 py-1 rounded-full border border-gold-500/20 font-semibold">
          LIVE
        </div>
      </div>
    </div>
  );
};

NotificationTicker.propTypes = {
  recentOrders: PropTypes.array,
  stats: PropTypes.object
};

export default NotificationTicker;

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
        time: new Date(order.createdAt || order.updatedAt),
        color: 'emerald'
      });
    });

    // Recent user / payment events from stats if available
    if (stats.newUsersToday) {
      notifications.push({
        id: 'new-user',
        type: 'user',
        message: `${stats.newUsersToday || 5} new customers registered`,
        icon: UserPlus,
        time: new Date(),
        color: 'cyan'
      });
    }

    if (stats.todayRevenue) {
      notifications.push({
        id: 'revenue',
        type: 'payment',
        message: `Today revenue ₹${Number(stats.todayRevenue).toLocaleString('en-IN')}`,
        icon: DollarSign,
        time: new Date(),
        color: 'gold'
      });
    }

    // Low stock if any
    if (stats.lowStockProducts > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'low_stock',
        message: `Low stock: ${stats.lowStockProducts} items`,
        icon: Bell,
        time: new Date(),
        color: 'orange'
      });
    }

    return notifications.slice(0, 5);
  };

  const notifications = generateNotifications(recentOrders, stats);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % Math.max(notifications.length, 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <div className="glass-card px-6 py-4 rounded-2xl border border-gold-500/20 shadow-gold-sm relative overflow-hidden">
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-gold-lg">
          <Bell className="w-5 h-5 text-black font-bold drop-shadow-sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-luxury-dim text-sm uppercase tracking-wider font-medium mb-1">
            Live Updates
          </p>
          <div className="flex items-center gap-3 animate-slide-in">
            {notifications.map((notification, index) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 min-w-0 transition-all ${
                    index === scrollIndex 
                      ? 'scale-105 shadow-gold-md border-gold-400/50 bg-white/10' 
                      : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-${notification.color}-500/10 border border-${notification.color}-500/20`}>
                    <Icon className={`w-4 h-4 text-${notification.color}-400`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-luxury-text truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-luxury-dim">
                      {formatDistanceToNow(notification.time, { addSuffix: true, locale: enIN })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-xs text-gold-400 font-mono bg-gold-500/10 px-2 py-1 rounded-full border border-gold-500/20">
          LIVE
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

NotificationTicker.propTypes = {
  recentOrders: PropTypes.array,
  stats: PropTypes.object
};

export default NotificationTicker;

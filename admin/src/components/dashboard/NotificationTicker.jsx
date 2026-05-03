import React, { useState, useEffect } from 'react';
import { Bell, Package, DollarSign, Users, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

const NotificationTicker = () => {
  const [notifications, setNotifications] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);

  // Mock real-time notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'order',
        message: 'New order #ORD-1245 from Priya Sharma - ₹2,450',
        icon: Package,
        time: new Date(),
        color: 'emerald'
      },
      {
        id: 2,
        type: 'payment',
        message: 'Payment received for order #ORD-1244 - ₹1,890',
        icon: DollarSign,
        time: new Date(Date.now() - 5 * 60 * 1000),
        color: 'gold'
      },
      {
        id: 3,
        type: 'user',
        message: 'New customer registered: Rohan Patel',
        icon: Users,
        time: new Date(Date.now() - 15 * 60 * 1000),
        color: 'cyan'
      },
      {
        id: 4,
        type: 'order',
        message: 'Order #ORD-1243 shipped via Delhivery',
        icon: Package,
        time: new Date(Date.now() - 30 * 60 * 1000),
        color: 'blue'
      },
      {
        id: 5,
        type: 'low_stock',
        message: 'Low stock alert: Premium Cotton Saree (12 units)',
        icon: Bell,
        time: new Date(Date.now() - 45 * 60 * 1000),
        color: 'orange'
      }
    ];

    setNotifications(mockNotifications);

    // Auto-scroll every 4 seconds
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % mockNotifications.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card px-6 py-4 rounded-2xl border border-gold-500/20 shadow-gold-sm relative overflow-hidden">
      {/* Gradient background animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 via-transparent to-emerald-500/5 animate-shift" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-gold-lg">
          <Bell className="w-5 h-5 text-black font-bold drop-shadow-sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-luxury-dim text-sm uppercase tracking-wider font-medium mb-1">
            Live Updates
          </p>
          <div className="flex items-center gap-3 animate-slide-in">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 min-w-0 transition-all ${
                  index === scrollIndex 
                    ? 'scale-105 shadow-gold-md border-gold-400/50 bg-white/10' 
                    : 'opacity-60 hover:opacity-90'
                }`}
              >
                <div className={`p-2 rounded-lg bg-${notification.color}-500/10 border border-${notification.color}-500/20`}>
                  <notification.icon className={`w-4 h-4 text-${notification.color}-400`} />
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
            ))}
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
        @keyframes shift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(100%); }
        }
        .animate-shift {
          animation: shift 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotificationTicker;

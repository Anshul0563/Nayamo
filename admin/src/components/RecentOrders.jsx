import React from 'react';
import { Clock, ShoppingCart, User, Package, DollarSign, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

// Mock data - replace with real API data
const RECENT_ORDERS = [
  {
    id: '#NAY456',
    customer: 'Priya Sharma',
    type: 'Order Confirmed',
    amount: '₹12,500',
    status: 'confirmed',
    time: '2024-04-28T10:30:00Z',
    avatar: 'PS'
  },
  {
    id: '#NAY455', 
    customer: 'Rahul Mehta',
    type: 'Payment Received',
    amount: '₹8,250',
    status: 'payment',
    time: '2024-04-28T09:45:00Z',
    avatar: 'RM'
  },
  {
    id: '#NAY454',
    customer: 'Anita Desai', 
    type: 'Ready to Ship',
    amount: '₹22,000',
    status: 'ready_to_ship',
    time: '2024-04-28T08:20:00Z',
    avatar: 'AD'
  },
  {
    id: '#NAY453',
    customer: 'Vikram Singh',
    type: 'New Order',
    amount: '₹6,800',
    status: 'pending',
    time: '2024-04-28T07:15:00Z',
    avatar: 'VS'
  },
  {
    id: '#NAY452',
    customer: 'Sneha Patel',
    type: 'Delivered',
    amount: '₹15,999',
    status: 'delivered',
    time: '2024-04-28T06:30:00Z',
    avatar: 'SP'
  }
];

const getStatusConfig = (status) => {
  const configs = {
    pending: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: ShoppingCart },
    confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp },
    payment: { color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/20', icon: DollarSign },
    'ready_to_ship': { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Package },
    delivered: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Package }
  };
  return configs[status] || configs.pending;
};

export default function RecentOrders({ orders = RECENT_ORDERS, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 rounded shimmer" />
                <div className="h-3 w-64 max-w-full bg-white/5 rounded shimmer" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-luxury-text">Recent Activity</h3>
          <p className="text-sm text-luxury-dim mt-1">Latest orders and updates</p>
        </div>
        <div className="text-xs text-luxury-dim flex items-center gap-1">
          <Clock size={14} />
          Live
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
        {orders.map((order, index) => {
          const config = getStatusConfig(order.status);
          const Icon = config.icon;
          const timeAgo = formatDistanceToNow(new Date(order.time), { addSuffix: true, locale: enIN });

          return (
            <div 
              key={order.id}
              className="group p-4 rounded-xl hover:bg-white/[0.02] transition-all duration-300 border border-transparent hover:border-luxury-borderHover hover:shadow-gold-sm -mx-1"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold-400 font-semibold text-sm uppercase tracking-wider">
                    {order.avatar}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-luxury-text group-hover:text-gold-400 transition-colors">
                        {order.type}
                      </p>
                      <p className="text-sm text-luxury-dim truncate">{order.customer}</p>
                    </div>
                    <span className="text-xs font-medium text-gold-400 ml-2 flex-shrink-0">
                      {order.amount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border}`}>
                      <Icon size={12} />
                      {order.id}
                    </div>
                    
                    {/* Time */}
                    <div className="text-xs text-luxury-dim ml-auto flex items-center gap-1">
                      <Clock size={12} />
                      {timeAgo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


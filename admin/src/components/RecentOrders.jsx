import React from 'react';
import { Clock, ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

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

const initials = (name = "Customer") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function RecentOrders({ orders = [], loading = false }) {
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
        {orders.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-luxury-dim">
            No recent activity yet
          </div>
        ) : orders.map((order, index) => {
          const config = getStatusConfig(order.status);
          const Icon = config.icon;
          const customer = order.user?.name || order.customer || "Customer";
          const timeAgo = formatDistanceToNow(new Date(order.createdAt || order.time), { addSuffix: true, locale: enIN });

          return (
            <div 
              key={order._id || order.id || index}
              className="group p-4 rounded-xl hover:bg-white/[0.02] transition-all duration-300 border border-transparent hover:border-luxury-borderHover hover:shadow-gold-sm -mx-1"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold-400 font-semibold text-sm uppercase tracking-wider">
                    {initials(customer)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-luxury-text group-hover:text-gold-400 transition-colors">
                        {order.type || String(order.status || "order").replaceAll("_", " ")}
                      </p>
                      <p className="text-sm text-luxury-dim truncate">{customer}</p>
                    </div>
                    <span className="text-xs font-medium text-gold-400 ml-2 flex-shrink-0">
                      ₹{Number(order.totalPrice || order.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg} ${config.border}`}>
                      <Icon size={12} />
                      #{String(order._id || order.id).slice(-8)}
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

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Clock, ShoppingCart, User, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Pending' },
  processing: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Processing' },
  shipped: { icon: ShoppingCart, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', label: 'Cancelled' },
};

export default function RealTimeFeed({ orders = [], compact = false }) {
  const [liveOrders, setLiveOrders] = useState(orders);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates when no orders prop provided
  useEffect(() => {
    if (orders.length > 0) {
      setLiveOrders(orders);
      setLastUpdate(new Date());
      return;
    }

    // Demo data for showcase
    const demoOrders = [
      { _id: '1', orderId: 'NYM-2024-001', customer: { name: 'Priya Sharma' }, total: 12500, status: 'pending', createdAt: new Date() },
      { _id: '2', orderId: 'NYM-2024-002', customer: { name: 'Ananya Patel' }, total: 8900, status: 'processing', createdAt: new Date(Date.now() - 300000) },
      { _id: '3', orderId: 'NYM-2024-003', customer: { name: 'Meera Singh' }, total: 24500, status: 'shipped', createdAt: new Date(Date.now() - 600000) },
      { _id: '4', orderId: 'NYM-2024-004', customer: { name: 'Kavya Nair' }, total: 5600, status: 'delivered', createdAt: new Date(Date.now() - 900000) },
      { _id: '5', orderId: 'NYM-2024-005', customer: { name: 'Riya Verma' }, total: 18200, status: 'pending', createdAt: new Date(Date.now() - 1200000) },
    ];
    setLiveOrders(demoOrders);
  }, [orders]);

  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return <Icon size={16} className={config.color} />;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const timeSinceUpdate = () => {
    const diff = new Date() - lastUpdate;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'just now';
    return `${Math.floor(seconds / 60)}m ago`;
  };

  if (compact) {
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {liveOrders.slice(0, 5).map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const Icon = status.icon;
          
          return (
            <div 
              key={order._id} 
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all"
            >
              <div className={`p-2 rounded-lg ${status.bg} ${status.border} border`}>
                <Icon size={14} className={status.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-luxury-text truncate">{order.orderId}</p>
                <p className="text-xs text-luxury-dim">{order.customer?.name}</p>
              </div>
              <p className="text-sm font-bold text-gold-400">₹{order.total?.toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-emerald-400" />
            </div>
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-luxury-text">Live Orders</h3>
            <p className="text-sm text-luxury-dim">
              {isConnected ? 'Connected' : 'Disconnected'} • Updated {timeSinceUpdate()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>
          <span className="text-xs text-luxury-dim">{liveOrders.length} orders</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {liveOrders.length === 0 ? (
          <div className="text-center py-8 text-luxury-dim">
            <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          liveOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const Icon = status.icon;
            
            return (
              <div 
                key={order._id} 
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold-500/20 transition-all cursor-pointer"
              >
                {/* Status Icon */}
                <div className={`p-3 rounded-xl ${status.bg} ${status.border} border transition-all group-hover:scale-110`}>
                  <Icon size={20} className={status.color} />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-luxury-text">{order.orderId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-luxury-dim">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{order.customer?.name || 'Guest'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-xl font-bold text-gold-400">₹{order.total?.toLocaleString()}</p>
                  <p className="text-xs text-luxury-dim">{order.items?.length || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}</p>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <svg className="w-4 h-4 text-luxury-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-luxury-border/50">
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-yellow-400">
            {liveOrders.filter(o => o.status === 'pending').length}
          </p>
          <p className="text-[10px] text-luxury-dim">Pending</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-blue-400">
            {liveOrders.filter(o => o.status === 'processing').length}
          </p>
          <p className="text-[10px] text-luxury-dim">Processing</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-violet-400">
            {liveOrders.filter(o => o.status === 'shipped').length}
          </p>
          <p className="text-[10px] text-luxury-dim">Shipped</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-emerald-400">
            {liveOrders.filter(o => o.status === 'delivered').length}
          </p>
          <p className="text-[10px] text-luxury-dim">Delivered</p>
        </div>
      </div>
    </div>
  );
}

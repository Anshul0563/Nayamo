import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Clock, ShoppingCart, User, CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { socketService } from '../../services/socket';

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Pending' },
  processing: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Processing' },
  shipped: { icon: ShoppingCart, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', label: 'Cancelled' },
};

export default function RealTimeFeed({ 
  orders = [], 
  compact = false, 
  loading: externalLoading = false,
  autoFetch = true,
  refreshInterval = 10000,
  apiParams = { limit: 20, sort: '-createdAt' },
  onOrderClick,
  showStats = true,
}) {
  const [liveOrders, setLiveOrders] = useState(orders);
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [socketConnected, setSocketConnected] = useState(false);
  
  const intervalRef = useRef(null);
  const isExternalData = orders.length > 0;

  // Fetch orders from API
  const fetchOrders = useCallback(async (silent = false) => {
    if (isExternalData) return; // Don't fetch if parent provides data
    
    if (!silent) setInternalLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getOrders(apiParams);
      const fetchedOrders = response.data?.data || response.data || [];
      setLiveOrders(fetchedOrders);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (err) {
      console.error('RealTimeFeed: Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
      setIsConnected(false);
    } finally {
      if (!silent) setInternalLoading(false);
    }
  }, [isExternalData, apiParams]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (!isExternalData && autoFetch) {
      fetchOrders();
      
      // Set up auto-refresh interval
      intervalRef.current = setInterval(() => {
        fetchOrders(true); // silent refresh
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isExternalData, autoFetch, refreshInterval, fetchOrders]);

  // Sync with external orders prop
  useEffect(() => {
    if (isExternalData) {
      setLiveOrders(orders);
      setLastUpdate(new Date());
      setIsConnected(true);
    }
  }, [orders, isExternalData]);

  // Socket.io integration for real-time updates
  useEffect(() => {
    const handleNewOrder = (event) => {
      const newOrder = event.detail;
      setLiveOrders(prev => {
        // Prevent duplicates
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev].slice(0, apiParams.limit || 20);
      });
      setLastUpdate(new Date());
    };

    const handleStatusUpdate = (event) => {
      const updatedOrder = event.detail;
      setLiveOrders(prev => 
        prev.map(o => o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o)
      );
      setLastUpdate(new Date());
    };

    const handleSocketConnect = () => setSocketConnected(true);
    const handleSocketDisconnect = () => setSocketConnected(false);

    // Listen for custom events from socket service
    window.addEventListener('order:new', handleNewOrder);
    window.addEventListener('order:status_updated', handleStatusUpdate);
    window.addEventListener('socket:connect', handleSocketConnect);
    window.addEventListener('socket:disconnect', handleSocketDisconnect);

    // Check initial socket state
    if (socketService.socket?.connected) {
      setSocketConnected(true);
    }

    return () => {
      window.removeEventListener('order:new', handleNewOrder);
      window.removeEventListener('order:status_updated', handleStatusUpdate);
      window.removeEventListener('socket:connect', handleSocketConnect);
      window.removeEventListener('socket:disconnect', handleSocketDisconnect);
    };
  }, [apiParams.limit]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const isLoading = externalLoading || internalLoading;

  // Compact mode render
  if (compact) {
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {liveOrders.slice(0, 5).map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const Icon = status.icon;
          
          return (
            <div 
              key={order._id} 
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
              onClick={() => onOrderClick?.(order)}
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
        {liveOrders.length === 0 && !isLoading && (
          <div className="text-center py-4 text-luxury-dim text-xs">
            No orders yet
          </div>
        )}
      </div>
    );
  }

  // Full mode render
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
              {isLoading ? 'Loading...' : isConnected ? 'Connected' : 'Disconnected'} • Updated {timeSinceUpdate()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Socket status indicator */}
          <div className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-luxury-dim flex items-center gap-1.5" title={socketConnected ? 'Real-time updates active' : 'Real-time updates inactive'}>
            {socketConnected ? (
              <Wifi size={12} className="text-emerald-400" />
            ) : (
              <WifiOff size={12} className="text-luxury-dim" />
            )}
          </div>

          {/* Live/Loading badge */}
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-1.5">
            {isLoading ? (
              <RefreshCw size={12} className="animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span>{isLoading ? 'Loading' : 'Live'}</span>
          </div>

          {/* Refresh button (only for internal fetching) */}
          {!isExternalData && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-luxury-dim hover:text-luxury-text transition-all disabled:opacity-50"
              title="Refresh now"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}

          <span className="text-xs text-luxury-dim">{liveOrders.length} orders</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-xs hover:bg-rose-500/30 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {isLoading && liveOrders.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-20 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : liveOrders.length === 0 ? (
          <div className="text-center py-8 text-luxury-dim">
            <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
            <p>No orders yet</p>
            {!isExternalData && autoFetch && (
              <button 
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 rounded-lg bg-white/5 text-sm hover:bg-white/10 transition-all"
              >
                Refresh
              </button>
            )}
          </div>
        ) : (
          liveOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const Icon = status.icon;
            
            return (
              <div 
                key={order._id} 
                className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-gold-500/20 transition-all cursor-pointer"
                onClick={() => onOrderClick?.(order)}
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
      {showStats && (
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
      )}
    </div>
  );
}

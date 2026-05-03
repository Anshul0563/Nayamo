import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import { QuickActions, AIInsights, NotificationTicker } from '../components/dashboard/index.js';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { adminAPI } from '../services/api';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Activity,
  BarChart3,
  Crown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const statsResponse = await adminAPI.getStats(dateRange);
      const data = statsResponse.data || {};

      setStats(data);
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setChartData(data.chartData || []);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <DashboardSkeleton />;

  const validOrders = Math.max(0, (stats.totalOrders || 0) - (stats.cancelledOrders || 0) - (stats.returnedOrders || 0) - (stats.rtoOrders || 0));

  // 6 KEY PREMIUM METRICS
  const keyMetrics = [
    {
      title: 'Today Revenue',
      value: stats.todayRevenue || 0,
      icon: DollarSign,
      color: 'gold',
      prefix: '₹',
      trend: stats.growthRate || 0,
      trendLabel: 'vs yesterday'
    },
    {
      title: 'Total Orders',
      value: validOrders,
      icon: ShoppingCart,
      color: 'emerald'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: Users,
      color: 'cyan'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders || 0,
      icon: Activity,
      color: 'orange'
    },
    {
      title: 'Monthly Revenue',
      value: stats.monthlyRevenue || 0,
      icon: BarChart3,
      color: 'violet',
      prefix: '₹'
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockProducts || 0,
      icon: Package,
      color: 'rose'
    }
  ];

  return (
    <div className="page-container space-y-8">
      {/* CLEAN HEADER */}
      <motion.div 
        className="glass-card p-6 rounded-3xl flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold-lg">
            <Crown className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white to-gold-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-lg text-luxury-dim">Live business overview</p>
          </div>
        </div>
<NotificationTicker stats={stats} recentOrders={recentOrders} />
      </motion.div>

      {/* 6 KEY METRICS - 2x3 GRID */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {keyMetrics.map((metric, index) => (
          <StatCard 
            key={metric.title} 
            {...metric} 
            delay={200 * index}
          />
        ))}
      </motion.div>

      {/* DOMINANT SALES CHART */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <SalesChart 
          data={chartData} 
          dateRange={dateRange}
          onDateChange={setDateRange}
        />
      </motion.div>

      {/* AI INSIGHTS + QUICK ACTIONS */}
      <motion.div 
        className="grid lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
<AIInsights stats={stats} />
        <QuickActions />
      </motion.div>

      {/* RECENT ACTIVITY */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <RecentOrders orders={recentOrders} />
      </motion.div>

      {error && (
        <motion.div 
          className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-rose-400 text-sm">{error}</span>
        </motion.div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import TopProducts from '../components/TopProducts';
import { QuickActions, AIInsights, NotificationTicker } from '../components/dashboard/index.js';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { adminAPI } from '../services/api';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Activity,
  BarChart3 
} from 'lucide-react';
import { Crown } from 'lucide-react';
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

      const statsResponse = await adminAPI.getStats();
      const data = statsResponse.data || {};

      const metrics = data.metrics || data.stats || data || {};

      setStats(metrics);
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setChartData(data.chartData || []);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 30000);
    window.addEventListener("refresh-dashboard", fetchDashboardData);
    window.addEventListener("admin:refresh", fetchDashboardData);

    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-dashboard", fetchDashboardData);
      window.removeEventListener("admin:refresh", fetchDashboardData);
    };
  }, [fetchDashboardData]);

  if (loading) return <DashboardSkeleton />;

  // 🔥 FIX: remove cancelled / returned / rto from total orders
  const validOrders =
    (stats.totalOrders || 0)
    - (stats.cancelledOrders || 0)
    - (stats.returnedOrders || 0)
    - (stats.rtoOrders || 0);

  const statCards = [
    {
      title: "Today Revenue",
      value: stats.todayRevenue || 0,
      icon: DollarSign,
      color: "gold",
      prefix: "₹",
      trend: stats.growthRate || 0,
      trendLabel: "vs previous period"
    },
    {
      title: "Total Orders",
      value: validOrders < 0 ? 0 : validOrders, // 🔥 FIXED VALUE
      icon: ShoppingCart,
      color: "emerald"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: Activity,
      color: "orange"
    },
    {
      title: "Cancelled Orders",
      value: stats.cancelledOrders || 0,
      icon: Activity,
      color: "rose",
      suffix: "orders"
    },
    {
      title: "Client Cancellations",
      value: stats.todayCancellations || 0,
      icon: Users,
      color: "amber",
      suffix: "today"
    },
    {
      title: "Active Users",
      value: stats.activeUsers || 0,
      icon: Users,
      color: "cyan"
    },
    {
      title: "Monthly Revenue",
      value: stats.monthlyRevenue || 0,
      icon: BarChart3,
      color: "gold",
      prefix: "₹"
    },
    {
      title: "Average Order Value",
      value: stats.avgOrderValue || 0,
      icon: DollarSign,
      color: "violet",
      prefix: "₹"
    },
    {
      title: "Delivered Orders",
      value: stats.deliveredOrders || 0,
      icon: Package,
      color: "emerald"
    },
    {
      title: "Low Stock Products",
      value: stats.lowStockProducts || 0,
      icon: Package,
      color: "rose"
    },
  ];

  return (
    <div className="page-container space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* HERO + QUICK ACTIONS */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="glass-card p-8 md:p-10 rounded-3xl mb-8 border-gold-animated shadow-gold-md">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold-lg">
                  <Crown className="w-8 h-8 text-black font-bold" />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-white via-luxury-text to-gold-400 bg-clip-text text-transparent">
                    Welcome to Nayamo Admin
                  </h1>
                  <p className="text-lg text-luxury-dim mt-2">
                    Live command center for revenue, orders, customers, and inventory.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-luxury-border/50">
                <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="text-3xl font-bold text-gold-gradient mb-1">
                    ₹{Number(stats.monthlyRevenue || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-luxury-dim">Monthly Revenue</div>
                </div>

                <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">
                    {Number(validOrders < 0 ? 0 : validOrders).toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-luxury-dim">Total Orders</div>
                </div>

                <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {Number(stats.conversionRate || 0)}%
                  </div>
                  <div className="text-sm text-luxury-dim">Growth Rate</div>
                </div>
              </div>
            </div>
          </div>
          <QuickActions />
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={100 * index} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <TopProducts products={topProducts} />
      </div>

      {/* ORDERS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />
      </div>

      {error && (
        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <span className="text-rose-400 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
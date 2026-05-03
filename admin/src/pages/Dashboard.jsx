import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/ui/StatCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import { QuickActions, AIInsights, NotificationTicker } from '../components/dashboard/index.js';
import { DashboardSkeleton } from '../components/ui/Skeleton.jsx';
import { adminAPI } from '../services/api';
import { Users, ShoppingCart, Package, DollarSign, Activity, BarChart3, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [dateRange, setDateRange] = useState('30d');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await adminAPI.getStats(dateRange);
      const data = res.data || {};

      setStats(data);
      setRecentOrders(data.recentOrders || []);
      setChartData(data.chartData || []);

    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
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

  // 🔥 Clean logic
  const validOrders = Math.max(
    0,
    (stats.totalOrders || 0) -
    (stats.cancelledOrders || 0) -
    (stats.returnedOrders || 0) -
    (stats.rtoOrders || 0)
  );

  const metrics = [
    {
      title: 'Revenue',
      value: stats.todayRevenue || 0,
      icon: DollarSign,
      prefix: '₹',
      trend: stats.growthRate || 0
    },
    {
      title: 'Orders',
      value: validOrders,
      icon: ShoppingCart
    },
    {
      title: 'Users',
      value: stats.activeUsers || 0,
      icon: Users
    },
    {
      title: 'Pending',
      value: stats.pendingOrders || 0,
      icon: Activity
    },
    {
      title: 'Monthly',
      value: stats.monthlyRevenue || 0,
      icon: BarChart3,
      prefix: '₹'
    },
    {
      title: 'Stock Alerts',
      value: stats.lowStockProducts || 0,
      icon: Package
    }
  ];

  return (
    <div className="page-container space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#D4A853] flex items-center justify-center">
            <Crown size={18} className="text-black" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-white">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Overview of your business
            </p>
          </div>
        </div>

        <NotificationTicker stats={stats} recentOrders={recentOrders} />
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {metrics.map((item, i) => (
          <StatCard key={i} {...item} />
        ))}
      </div>

      {/* CHART */}
      <div className="rounded-2xl overflow-hidden border border-white/5">
        <SalesChart
          data={chartData}
          dateRange={dateRange}
          onDateChange={setDateRange}
        />
      </div>

      {/* INSIGHTS + ACTIONS */}
      <div className="grid lg:grid-cols-2 gap-5">
        <AIInsights stats={stats} />
        <QuickActions />
      </div>

      {/* ORDERS */}
      <RecentOrders orders={recentOrders} />

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
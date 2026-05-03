import React, { useEffect, useState, useCallback } from 'react';
import StatCard from '../components/ui/StatCard';
import SalesChart from '../components/SalesChart';
import RecentOrders from '../components/RecentOrders';
import TopProducts from '../components/TopProducts';
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    todayCancellations: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    avgOrderValue: 0,
    deliveredOrders: 0,
    lowStockProducts: 0,
    conversionRate: 0,
    growthRate: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await adminAPI.getStats();
      const data = res.data || {};

      // 🔥 FIX: handle all possible API structures
      const metrics = data.metrics || data.stats || data.data || {};

      setStats(prev => ({
        ...prev,
        ...metrics
      }));

      setRecentOrders(data.recentOrders || data.orders || []);
      setTopProducts(data.topProducts || []);
      setChartData(data.chartData || data.salesData || []);

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

  const statCards = [
    { title: "Today Revenue", value: stats.todayRevenue, icon: DollarSign, color: "gold", prefix: "₹", trend: stats.growthRate },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, color: "emerald" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Activity, color: "orange" },
    { title: "Cancelled Orders", value: stats.cancelledOrders, icon: Activity, color: "rose" },
    { title: "Client Cancellations", value: stats.todayCancellations, icon: Users, color: "amber" },
    { title: "Active Users", value: stats.activeUsers, icon: Users, color: "cyan" },
    { title: "Monthly Revenue", value: stats.monthlyRevenue, icon: BarChart3, color: "gold", prefix: "₹" },
    { title: "Average Order Value", value: stats.avgOrderValue, icon: DollarSign, color: "violet", prefix: "₹" },
    { title: "Delivered Orders", value: stats.deliveredOrders, icon: Package, color: "emerald" },
    { title: "Low Stock Products", value: stats.lowStockProducts, icon: Package, color: "rose" },
  ];

  return (
    <div className="page-container">

      {/* HERO */}
      <div className="glass-card p-8 md:p-10 rounded-3xl mb-8 border-gold-animated shadow-gold-md">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gold-gradient rounded-2xl flex items-center justify-center shadow-gold-lg">
              <Crown className="w-8 h-8 text-black" />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
                Nayamo Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-2">
                Real-time overview of your business
              </p>
            </div>
          </div>

          {/* STATS PREVIEW */}
          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                ₹{stats.monthlyRevenue.toLocaleString("en-IN")}
              </div>
              <div className="text-sm text-gray-400">Monthly Revenue</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {stats.totalOrders}
              </div>
              <div className="text-sm text-gray-400">Orders</div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {stats.conversionRate}%
              </div>
              <div className="text-sm text-gray-400">Growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* CHART + TOP PRODUCTS */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <TopProducts products={topProducts} />
      </div>

      {/* RECENT ORDERS */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => (window.location.href = "/orders")}>Orders</button>
            <button onClick={() => (window.location.href = "/inventory")}>Inventory</button>
            <button onClick={() => (window.location.href = "/users")}>Users</button>
            <button onClick={() => (window.location.href = "/analytics")}>Analytics</button>
          </div>
        </div>
      </div>

      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
}
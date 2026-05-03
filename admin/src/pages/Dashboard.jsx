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
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Parallel data fetching
      const statsResponse = await adminAPI.getStats();
      const data = statsResponse.data;

      setStats(data.metrics || data.stats || {});
      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);
      setChartData(data.chartData || []);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Using cached data.');
      // Don't set error state for UX - use mock data gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    window.addEventListener("refresh-dashboard", fetchDashboardData);
    window.addEventListener("admin:refresh", fetchDashboardData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("refresh-dashboard", fetchDashboardData);
      window.removeEventListener("admin:refresh", fetchDashboardData);
    };
  }, [fetchDashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    { title: "Today Revenue", value: stats.todayRevenue || 0, icon: DollarSign, color: "gold", prefix: "₹", trend: stats.growthRate || 0, trendLabel: "vs previous period" },
    { title: "Total Orders", value: stats.totalOrders || 0, icon: ShoppingCart, color: "emerald" },
    { title: "Pending Orders", value: stats.pendingOrders || 0, icon: Activity, color: "orange" },
    { title: "Cancelled Orders", value: stats.cancelledOrders || 0, icon: Activity, color: "rose", suffix: "orders" },
    { title: "Client Cancellations", value: stats.todayCancellations || 0, icon: Users, color: "amber", suffix: "today" },
    { title: "Active Users", value: stats.activeUsers || 0, icon: Users, color: "cyan" },
    { title: "Monthly Revenue", value: stats.monthlyRevenue || 0, icon: BarChart3, color: "gold", prefix: "₹" },
    { title: "Average Order Value", value: stats.avgOrderValue || 0, icon: DollarSign, color: "violet", prefix: "₹" },
    { title: "Delivered Orders", value: stats.deliveredOrders || 0, icon: Package, color: "emerald" },
    { title: "Low Stock Products", value: stats.lowStockProducts || 0, icon: Package, color: "rose" },
  ];

  return (
    <div className="page-container">
      {/* Hero Welcome */}
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
              <p className="text-lg text-luxury-dim mt-2">Live command center for revenue, orders, customers, and inventory.</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-luxury-border/50">
            <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
              <div className="text-3xl font-bold text-gold-gradient mb-1">₹{Number(stats.monthlyRevenue || 0).toLocaleString("en-IN")}</div>
              <div className="text-sm text-luxury-dim">Monthly Revenue</div>
            </div>
            <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{Number(stats.totalOrders || 0).toLocaleString("en-IN")}</div>
              <div className="text-sm text-luxury-dim">Total Orders</div>
            </div>
            <div className="text-center p-4 rounded-2xl hover:bg-white/[0.02] transition-colors">
              <div className="text-3xl font-bold text-cyan-400 mb-1">{Number(stats.conversionRate || 0)}%</div>
              <div className="text-sm text-luxury-dim">Growth Rate</div>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendLabel={stat.trendLabel}
            prefix={stat.prefix}
            suffix={stat.suffix}
            delay={100 * index}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <SalesChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <TopProducts products={topProducts} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentOrders orders={recentOrders} />
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { window.location.href = "/orders"; }} className="luxury-btn luxury-btn-primary group h-20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-gold-lg transform hover:-translate-y-1 transition-all duration-300">
              <ShoppingCart size={24} />
              <span className="font-semibold text-sm">View Orders</span>
            </button>
            <button onClick={() => { window.location.href = "/inventory"; }} className="luxury-btn luxury-btn-secondary group h-20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-gold-sm transform hover:-translate-y-1 transition-all duration-300">
              <Package size={24} />
              <span className="font-semibold text-sm">Inventory</span>
            </button>
            <button onClick={() => { window.location.href = "/users"; }} className="luxury-btn luxury-btn-primary group h-20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-gold-lg transform hover:-translate-y-1 transition-all duration-300">
              <Users size={24} />
              <span className="font-semibold text-sm">Customers</span>
            </button>
            <button onClick={() => { window.location.href = "/analytics"; }} className="luxury-btn luxury-btn-secondary group h-20 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-gold-sm transform hover:-translate-y-1 transition-all duration-300">
              <BarChart3 size={24} />
              <span className="font-semibold text-sm">Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="flex items-center gap-3 text-rose-400">
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import StatCard from "../components/ui/StatCard";
import SalesChart from "../components/SalesChart";
import RecentOrders from "../components/RecentOrders";
import {
  QuickActions,
  AIInsights,
  NotificationTicker,
} from "../components/dashboard";
import { DashboardSkeleton } from "../components/ui/Skeleton.jsx";
import { adminAPI } from "../services/api";
import {
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Activity,
  BarChart3,
  Crown,
  Truck,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [codEnabled, setCodEnabled] = useState(null);
  const [codUpdating, setCodUpdating] = useState(false);
  const [codError, setCodError] = useState("");

  // 🔥 MAIN FETCH
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getStats();
      const data = res?.data || {};

      setStats(data);
      setRecentOrders(data.recentOrders || []);
      setChartData(data.chartData || []);
    } catch (err) {

      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 CHART RANGE FETCH (SEPARATE)
  const handleRangeChange = useCallback(async (range) => {
    try {
      setChartLoading(true);

      const res = await adminAPI.getStats(range);
      const data = res?.data || {};

      setChartData(data.chartData || []);
    } catch (err) {

    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchCodSettings = useCallback(async () => {
    try {
      setCodError("");
      const response = await adminAPI.getSettings();
      const settings = response.data?.data || response.data;

      // Settings created before COD support should remain enabled by default.
      setCodEnabled(settings?.codEnabled !== false);
    } catch (err) {
      setCodError("Unable to load COD availability");
    }
  }, []);

  const handleCodToggle = async () => {
    if (codEnabled === null || codUpdating) return;

    const previousValue = codEnabled;
    const nextValue = !previousValue;

    setCodEnabled(nextValue);
    setCodUpdating(true);
    setCodError("");

    try {
      const response = await adminAPI.updateSettings({ codEnabled: nextValue });
      const savedSettings = response.data?.data || response.data;

      setCodEnabled(
        typeof savedSettings?.codEnabled === "boolean"
          ? savedSettings.codEnabled
          : nextValue,
      );
    } catch (err) {
      setCodEnabled(previousValue);
      setCodError(
        err.response?.data?.message || "Failed to update COD availability",
      );
    } finally {
      setCodUpdating(false);
    }
  };

  // 🔥 AUTO REFRESH
  useEffect(() => {
    fetchDashboardData();
    fetchCodSettings();

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchCodSettings();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCodSettings, fetchDashboardData]);

  if (loading) return <DashboardSkeleton />;

  // 🔥 VALID ORDERS FIX
  const validOrders = Math.max(
    0,
    (stats.totalOrders || 0) -
      (stats.cancelledOrders || 0) -
      (stats.returnedOrders || 0) -
      (stats.rtoOrders || 0)
  );

  const metrics = [
    {
      title: "Revenue",
      value: stats.todayRevenue || 0,
      icon: DollarSign,
      prefix: "₹",
      trend: stats.growthRate || 0,
    },
    {
      title: "Orders",
      value: validOrders,
      icon: ShoppingCart,
    },
    {
      title: "Users",
      value: stats.activeUsers || 0,
      icon: Users,
    },
    {
      title: "Pending",
      value: stats.pendingOrders || 0,
      icon: Activity,
    },
    {
      title: "Monthly",
      value: stats.monthlyRevenue || 0,
      icon: BarChart3,
      prefix: "₹",
    },
    {
      title: "Stock Alerts",
      value: stats.lowStockProducts || 0,
      icon: Package,
    },
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

      {/* ERROR */}
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
          {error}
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {metrics.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {/* COD availability */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4A853]/10 text-[#D4A853]">
              <Truck size={21} />
            </div>
            <div>
              <h2 className="font-semibold text-white">Cash on Delivery</h2>
              <p className="mt-1 text-sm text-gray-400">
                {codEnabled === null
                  ? "Checking COD availability..."
                  : codEnabled
                    ? "Customers can select COD at checkout."
                    : "COD is not available at your region"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCodToggle}
            disabled={codEnabled === null || codUpdating}
            aria-label="Toggle cash on delivery availability"
            aria-pressed={codEnabled === true}
            className={`relative h-7 w-14 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              codEnabled ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                codEnabled ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {codError && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {codError}
          </p>
        )}
      </section>

      {/* CHART */}
      <SalesChart
        data={chartData || []}
        loading={chartLoading}
        onRangeChange={handleRangeChange}
      />

      {/* INSIGHTS + ACTIONS */}
      <div className="grid lg:grid-cols-2 gap-5">
        <AIInsights stats={stats} />
        <QuickActions />
      </div>

      {/* ORDERS */}
      <RecentOrders orders={recentOrders} />

    </div>
  );
}

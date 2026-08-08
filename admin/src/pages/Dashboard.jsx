import {
  Activity,
  BarChart3,
  Crown,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";
import {
  AIInsights,
  NotificationTicker,
  QuickActions,
} from "../components/dashboard";
import { DashboardSkeleton } from "../components/ui/Skeleton.jsx";
import StatCard from "../components/ui/StatCard";
import { adminAPI } from "../services/api";

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
      (stats.rtoOrders || 0),
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
            <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your business</p>
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
            className={`relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full border p-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60 ${
              codEnabled
                ? "border-emerald-500/40 bg-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_0_14px_rgba(16,185,129,0.35)]"
                : "border-white/10 bg-zinc-700/80"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
                codEnabled ? "translate-x-6" : "translate-x-0"
              }`}
            >
              {codUpdating && (
                <svg
                  className="h-3 w-3 animate-spin text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
            </span>
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

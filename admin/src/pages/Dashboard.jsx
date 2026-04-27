import { useEffect, useMemo, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  Users,
  ShoppingBag,
  Package,
  IndianRupee,
  RefreshCcw,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const [dashRes, orderRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getOrders({ limit: 100 }),
      ]);

      setStats(dashRes.data.data || {});
            setOrders(orderRes.data.data || []);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load dashboard";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRecent = useMemo(() => {
    const list = stats.recentOrders || [];
    if (!debouncedSearch.trim()) return list;

    const term = debouncedSearch.toLowerCase();
    return list.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(term) ||
        item._id?.toLowerCase().includes(term)
    );
  }, [stats, debouncedSearch]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between">
        <p className="text-zinc-400 text-sm">{title}</p>
        <div className="p-2 rounded-2xl bg-white/10">
          <Icon size={18} className={color} />
        </div>
      </div>
      <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${color}`}>{value}</h2>
    </div>
  );

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div className="space-y-6 text-white">
      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Welcome Back 👋</h1>
          <p className="text-zinc-400 mt-1">
            Manage your store professionally from one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search recent orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full sm:w-72"
          />

          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="text-cyan-400" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-violet-400" />
        <StatCard title="Products" value={stats.totalProducts} icon={Package} color="text-emerald-400" />
        <StatCard title="Revenue" value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} icon={IndianRupee} color="text-yellow-400" />
      </div>

      {/* Middle */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">Recent Orders</h2>
            <span className="text-sm text-zinc-400">{filteredRecent.length} orders</span>
          </div>

          <div className="space-y-3">
            {filteredRecent.length === 0 ? (
              <div className="text-zinc-400 text-center py-10">No orders found</div>
            ) : (
              filteredRecent.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{order.user?.name || "Customer"}</p>
                    <p className="text-sm text-zinc-400">#{order._id?.slice(-6)}</p>
                  </div>
                  <div className="text-sm text-zinc-400">{order.items?.length || 0} items</div>
                  <div className="font-bold text-emerald-400">₹{order.totalPrice}</div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-sm capitalize w-fit">{order.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Quick Insights</h2>

          <div className="space-y-3">
            <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock3 size={18} className="text-orange-400" />
                <span>Pending</span>
              </div>
              <strong>{pendingCount}</strong>
            </div>

            <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-400" />
                <span>Delivered</span>
              </div>
              <strong>{deliveredCount}</strong>
            </div>

            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-red-400" />
                <span>Cancelled</span>
              </div>
              <strong>{cancelledCount}</strong>
            </div>
          </div>

          <div className="mt-5 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5">
            <p className="text-sm opacity-80">Total Revenue</p>
            <h3 className="text-3xl font-bold mt-2">₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
            <p className="text-sm mt-2 opacity-80">Across all completed orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}


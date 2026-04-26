import { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import {
  RefreshCcw,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
} from "lucide-react";

export default function Returns() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getOrders({ status: "returned", limit: 100 });
      setOrders(res.data.data?.orders || res.data.orders || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await adminAPI.updateOrderStatus(id, status);
      await loadReturns();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      o._id?.toLowerCase().includes(term) ||
      o.user?.name?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Returns & Refunds</h1>
          <p className="text-zinc-400 mt-1">Manage returned orders and process refunds.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search returns..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full sm:w-72"
            />
          </div>
          <button
            onClick={loadReturns}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Total Returns</p>
            <RotateCcw size={18} className="text-yellow-400" />
          </div>
          <h2 className="text-3xl font-bold mt-4">{orders.length}</h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Pending Action</p>
            <Clock3 size={18} className="text-orange-400" />
          </div>
          <h2 className="text-3xl font-bold mt-4">
            {orders.filter((o) => o.status === "returned").length}
          </h2>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">Refunded</p>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mt-4">
            {orders.filter((o) => o.status === "refunded").length}
          </h2>
        </div>
      </div>

      {/* Returns List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No returned orders found
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold">#{order._id?.slice(-6)}</h3>
                  <p className="text-zinc-300 mt-1">{order.user?.name || "Customer"}</p>
                  <p className="text-zinc-500 text-sm mt-2">{order.address}</p>
                  <p className="text-sm text-zinc-400 mt-2">
                    {order.items?.length || 0} items • ₹{order.totalPrice}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap xl:justify-end">
                  {order.status === "returned" && (
                    <>
                      <button
                        onClick={() => updateStatus(order._id, "refunded")}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle2 size={15} />
                        Mark Refunded
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, "cancelled")}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 rounded-xl bg-red-600 text-sm hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === "refunded" && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                      Refunded
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


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
  ChevronLeft,
  ChevronRight,
  DollarSign,
  X,
  TrendingUp,
} from "lucide-react";
import ExportButton from "../components/ExportButton";

const TABS = [
  ["all", "All Returns"],
  ["returned", "Returned"],
  ["refunded", "Refunded"],
  ["rto", "RTO"],
];

const statusColors = {
  returned: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  refunded: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  rto: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function Returns() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [partialRefundId, setPartialRefundId] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");

  const loadReturns = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getReturns({
        page: currentPage,
        limit: 20,
        status: tab !== "all" ? tab : undefined,
        search: search || undefined,
      });

      const result = res.data;
      setOrders(result.data || result.orders || []);
      setPage(result.pagination?.currentPage || 1);
      setTotalPages(result.pagination?.totalPages || 1);

      // Load stats
      try {
        const statsRes = await adminAPI.getReturnStats();
        setStats(statsRes.data?.stats || {});
      } catch {
        // fallback
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load returns");
    } finally {
      setLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    loadReturns(1);
  }, [loadReturns]);

  const updateStatus = async (id, status, amount = null) => {
    try {
      setActionLoading(id);
      const data = { status };
      if (amount !== null) data.refundAmount = amount;
      await adminAPI.updateReturnStatus(id, data);
      await loadReturns(page);
      setPartialRefundId(null);
      setRefundAmount("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePartialRefund = (id, maxAmount) => {
    setPartialRefundId(id);
    setRefundAmount(maxAmount.toString());
  };

  const submitPartialRefund = (id) => {
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid refund amount");
      return;
    }
    updateStatus(id, "refunded", amount);
  };

  const getStatusCount = (key) => {
    if (key === "all") {
      return (stats.returned || 0) + (stats.refunded || 0) + (stats.rto || 0);
    }
    return stats[key] || 0;
  };

  const exportData = orders.map((order) => ({
    id: order._id,
    customer: order.user?.name || "Guest",
    status: order.status,
    amount: order.totalPrice,
    items: (order.items || []).map((i) => `${i.quantity}x ${i.product?.title || i.name}`).join(", "),
    date: new Date(order.createdAt).toLocaleDateString("en-IN"),
  }));

  if (loading && orders.length === 0) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white w-full max-w-full overflow-x-hidden">
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
        <div className="min-w-0">
          <h1 className="text-2xl md:text-4xl font-bold">Returns & Refunds</h1>
          <p className="text-zinc-400 mt-1">Manage returned orders and process refunds.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0">
          <div className="relative w-full min-w-0">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search returns..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full min-w-0 sm:w-64"
            />
          </div>

          <ExportButton filename="returns" data={exportData} />

          <button
            onClick={() => loadReturns(page)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <RotateCcw size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{getStatusCount("returned")}</p>
              <p className="text-sm text-zinc-400">Returned</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{getStatusCount("refunded")}</p>
              <p className="text-sm text-zinc-400">Refunded</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold">{getStatusCount("rto")}</p>
              <p className="text-sm text-zinc-400">RTO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 max-w-full scrollbar-hide">
        {TABS.map(([key, labelText]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 rounded-2xl whitespace-nowrap transition shrink-0 ${
              tab === key
                ? "bg-white text-black font-semibold"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            {labelText} ({getStatusCount(key)})
          </button>
        ))}
      </div>

      {/* Returns List */}
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            <RotateCcw size={40} className="mx-auto mb-3 text-zinc-600" />
            No returns found
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">#{order._id?.slice(-6)}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                        statusColors[order.status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                      }`}
                    >
                      {order.status?.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-zinc-300">{order.user?.name || "Customer"}</p>
                  <p className="text-zinc-500 text-sm mt-1">{order.address || order.shippingAddress}</p>
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
                        Full Refund
                      </button>
                      <button
                        onClick={() => handlePartialRefund(order._id, order.totalPrice)}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <DollarSign size={15} />
                        Partial Refund
                      </button>
                      <button
                        onClick={() => updateStatus(order._id, "rto")}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-sm hover:bg-rose-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        <RotateCcw size={15} />
                        Mark RTO
                      </button>
                    </>
                  )}
                  {order.status === "rto" && (
                    <button
                      onClick={() => updateStatus(order._id, "refunded")}
                      disabled={actionLoading === order._id}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-sm hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <CheckCircle2 size={15} />
                      Process Refund
                    </button>
                  )}
                  {order.status === "refunded" && (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm border border-emerald-500/20">
                      Refunded
                    </span>
                  )}
                </div>
              </div>

              {/* Partial Refund Input */}
              {partialRefundId === order._id && (
                <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <DollarSign size={16} className="text-blue-400 shrink-0" />
                  <div className="flex-1">
                    <label className="text-sm text-blue-300 block mb-1">Partial Refund Amount (Max: ₹{order.totalPrice})</label>
                    <input
                      type="number"
                      min={1}
                      max={order.totalPrice}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-black/30 border border-white/10 outline-none w-full sm:w-48"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitPartialRefund(order._id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setPartialRefundId(null);
                        setRefundAmount("");
                      }}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadReturns(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadReturns(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

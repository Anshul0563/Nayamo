import { useEffect, useMemo, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  IndianRupee,
  Wallet,
  Clock3,
  AlertCircle,
  CheckCircle2,
  Search,
  RefreshCcw,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const loadPayments = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getPayments({
        page: currentPage,
        limit: 20,
        search: debouncedSearch || undefined,
      });

      const result = res.data;
      setOrders(Array.isArray(result.data) ? result.data : (result.data?.orders || result.orders || []));
      setTotalPages(result.pagination?.totalPages || 1);
      setPage(result.pagination?.currentPage || 1);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadPayments(1);
  }, [loadPayments]);

const transactions = useMemo(() => {
    return orders.map((order) => {
      const isPaid = order.isPaid || order.paymentStatus === "paid";
      let status = "pending";
      
      // Check if order is cancelled first - show as cancelled regardless of payment
      if (order.status === "cancelled" || order.status === "rto") {
        status = "cancelled";
      } else if (isPaid) {
        status = "paid";
      } else if (order.paymentStatus === "failed") {
        status = "failed";
      }

      return {
        id: order._id,
        customer: order.user?.name || "Customer",
        method: order.paymentMethod === "cod" ? "COD" : "Online",
        amount: Number(order.totalPrice || 0),
        status,
        orderStatus: order.status, // Keep track of order status
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : "-",
      };
    });
  }, [orders]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return transactions;
    const term = debouncedSearch.toLowerCase();
    return transactions.filter(
      (item) =>
        item.id.toLowerCase().includes(term) ||
        item.customer.toLowerCase().includes(term)
    );
  }, [transactions, debouncedSearch]);

const stats = useMemo(() => {
    // Exclude cancelled orders from calculations
    const activeTransactions = transactions.filter((item) => item.status !== "cancelled");
    const total = activeTransactions.reduce((sum, item) => sum + item.amount, 0);
    const received = activeTransactions
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + item.amount, 0);
    const pending = activeTransactions
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0);
    const failed = activeTransactions
      .filter((item) => item.status === "failed")
      .reduce((sum, item) => sum + item.amount, 0);

    return { total, received, pending, failed };
  }, [transactions]);

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon size={18} className={color} />
      </div>
      <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${color}`}>{value}</h2>
    </div>
  );

const Status = ({ status }) => {
    if (status === "paid") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 inline-flex items-center gap-1">
          <CheckCircle2 size={14} />
          Paid
        </span>
      );
    }
    if (status === "cancelled") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20 inline-flex items-center gap-1">
          <AlertCircle size={14} />
          Cancelled
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 inline-flex items-center gap-1">
          <Clock3 size={14} />
          Pending
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
        <AlertCircle size={14} />
        Failed
      </span>
    );
  };

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
          <button onClick={() => loadPayments(1)} className="ml-auto underline">Retry</button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Payments</h1>
          <p className="text-zinc-400 mt-1">Real-time payment analytics & transactions.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payment..."
              className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />
          </div>
          <button
            onClick={() => loadPayments(1)}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card title="Gross Revenue" value={`₹${stats.total.toLocaleString()}`} icon={IndianRupee} color="text-emerald-400" />
        <Card title="Received" value={`₹${stats.received.toLocaleString()}`} icon={Wallet} color="text-cyan-400" />
        <Card title="Pending" value={`₹${stats.pending.toLocaleString()}`} icon={Clock3} color="text-yellow-400" />
        <Card title="Failed" value={`₹${stats.failed.toLocaleString()}`} icon={AlertCircle} color="text-red-400" />
      </div>

      {/* Transactions */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Recent Transactions</h2>
          <span className="text-sm text-zinc-400">{filtered.length} records</span>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-zinc-400 py-10">No payments found</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.customer}</p>
                  <p className="text-sm text-zinc-400 break-all">
                    #{item.id.slice(-8)} • {item.date}
                  </p>
                </div>
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <CreditCard size={15} />
                  {item.method}
                </div>
                <div className="font-bold text-emerald-400">₹{item.amount}</div>
                <Status status={item.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadPayments(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadPayments(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

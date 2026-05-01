import { useEffect, useMemo, useState, useCallback } from "react";
import DataTable from "../components/DataTable.jsx";
import OrderDetailModal from "../components/orders/OrderDetailModal.jsx";
import ExportButton from "../components/ExportButton.jsx";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  RefreshCcw,
  Search,
  FileText,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare,
  XSquare,
  Trash2,
} from "lucide-react";

const TABS = [
  ["pending", "Pending"],
  ["confirmed", "Confirmed"],
  ["ready_to_ship", "Ready To Ship"],
  ["pickup_requested", "Pickup Requested"],
  ["in_transit", "In Transit"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["returned", "Returned"],
  ["rto", "RTO"],
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [detailOrder, setDetailOrder] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getOrders({
        page: currentPage,
        limit: 20,
        status: tab !== "all" ? tab : undefined,
        search: debouncedSearch || undefined,
      });

      const result = res.data;
      setOrders(result.data || result.orders || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setPage(result.pagination?.currentPage || 1);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch]);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminAPI.getOrderStats();
      setStats(res.data?.stats || {});
    } catch {
      // silently fail - tab counts will show 0
    }
  }, []);

  useEffect(() => {
    loadOrders(1);
    loadStats();
  }, [loadOrders, loadStats]);

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await adminAPI.updateOrderStatus(id, status);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const invoice = (id) => {
    window.open(`/api/v1/orders/${id}/invoice`, "_blank");
  };

  const getStatusCount = (key) => {
    if (!stats) return 0;
    return stats[key] || 0;
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === orders.length) {
      setSelected([]);
    } else {
      setSelected(orders.map((o) => o._id));
    }
  };

  const bulkStatusUpdate = async (status) => {
    if (!selected.length) return;
    try {
      setActionLoading("bulk");
      await Promise.all(selected.map((id) => adminAPI.updateOrderStatus(id, status)));
      setSelected([]);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Bulk update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkCancel = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Cancel ${selected.length} selected orders?`)) return;
    await bulkStatusUpdate("cancelled");
  };

  const exportData = useMemo(() => {
    return orders.map((order) => ({
      id: order._id,
      customer: order.user?.name || "Guest",
      email: order.user?.email || "",
      status: order.status,
      amount: order.totalPrice,
      paymentStatus: order.paymentStatus,
      items: (order.items || []).map((i) => `${i.quantity}x ${i.product?.title || i.name}`).join(", "),
      address: order.address || order.shippingAddress || "",
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),
    }));
  }, [orders]);

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
          <h1 className="text-2xl md:text-4xl font-bold">Orders Management</h1>
          <p className="text-zinc-400 mt-1">Manage all orders professionally.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0">
          <div className="relative w-full min-w-0">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full min-w-0 sm:w-72"
            />
          </div>

          <ExportButton filename="orders" data={exportData} />

          <button
            onClick={() => {
              loadOrders(page);
              loadStats();
            }}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 max-w-full scrollbar-hide">
        {TABS.map(([key, labelText]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setSelected([]);
            }}
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

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <select
            value=""
            onChange={(e) => e.target.value && bulkStatusUpdate(e.target.value)}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none"
          >
            <option value="">Bulk Update Status</option>
            {TABS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button
            onClick={bulkCancel}
            disabled={actionLoading === "bulk"}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <XSquare size={14} />
            Bulk Cancel
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-zinc-400 hover:text-white ml-auto underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Orders */}
      <DataTable
        columns={[
          { key: '_id', label: 'Order ID', render: (id) => `#${id.slice(-6)}` },
          { key: 'user.name', label: 'Customer' },
          { key: 'totalPrice', label: 'Amount', render: (price) => `₹${price}` },
          { key: 'status', label: 'Status', render: (status) => (
            <span className={`px-3 py-1 rounded-full text-xs capitalize bg-white/10`}>
              {status.replaceAll('_', ' ')}
            </span>
          )},
          { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setDetailOrder(row)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1"
              >
                <Eye size={14} />
                View
              </button>
              <select
                value={row.status}
                disabled={actionLoading === row._id}
                onChange={(event) => updateStatus(row._id, event.target.value)}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs outline-none"
              >
                {TABS.map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={() => invoice(row._id)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1"
              >
                <FileText size={14} />
                Invoice
              </button>
            </div>
          ) }
        ]}
        data={orders}
        loadMore={() => loadOrders(page + 1)}
        hasMore={page < totalPages}
        loading={loading}
        total={orders.length}
        enableSelection={true}
        selected={selected}
        onSelect={toggleSelect}
        exportData={() => {/* handled by ExportButton above */}}
        className="min-h-[400px]"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadOrders(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadOrders(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center gap-1"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}

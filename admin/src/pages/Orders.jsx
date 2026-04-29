import { useEffect, useMemo, useState, useCallback } from "react";
import DataTable from "../components/DataTable.jsx";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  RefreshCcw,
  Search,
  FileText,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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

  useEffect(() => {
    loadOrders(1);
  }, [loadOrders]);

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await adminAPI.updateOrderStatus(id, status);
      await loadOrders(page);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const invoice = (id) => {
    window.open(`/api/v1/orders/${id}/invoice`, "_blank");
  };

  // Remove filtered - DataTable handles it

  const counts = useMemo(() => {
    const map = {};
    TABS.forEach(([key]) => {
      map[key] = orders.filter((o) => o.status === key).length;
    });
    return map;
  }, [orders]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
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

          <button
            onClick={() => loadOrders(page)}
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
            {labelText} ({counts[key] || 0})
          </button>
        ))}
      </div>

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
          { key: 'actions', label: 'Actions' }
        ]}
        data={orders}
        loadMore={() => loadOrders(page + 1)}
        hasMore={page < totalPages}
        loading={loading}
        total={orders.length}
        enableSelection={true}
        selected={selected}
        onSelect={toggleSelect}
        exportData={() => {/* CSV export */}}
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
    </div>
  );
}


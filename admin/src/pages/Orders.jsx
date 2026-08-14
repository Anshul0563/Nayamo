import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  XSquare,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import ExportButton from "../components/ExportButton.jsx";
import OrderDetailModal from "../components/orders/OrderDetailModal.jsx";
import { useDebounce } from "../hooks/useApi";
import { adminAPI } from "../services/api";

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
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [detailOrder, setDetailOrder] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const loadOrders = useCallback(
    async (currentPage = 1) => {
      try {
        setLoading(true);
        setError("");

        const res = await adminAPI.getOrders({
          page: currentPage,
          limit: 20,
          status: tab !== "all" ? tab : undefined,
          search: debouncedSearch || undefined,
          includeArchived: showArchived,
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
    },
    [tab, debouncedSearch, showArchived],
  );

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

  // Socket event listener for real-time order updates
  useEffect(() => {
    const handleStatusUpdate = (event) => {
      const { orderId } = event.detail;
      if (!orderId) return;
      // Reload orders and stats to reflect the change
      loadOrders(page);
      loadStats();
    };

    window.addEventListener("order:status_updated", handleStatusUpdate);

    return () => {
      window.removeEventListener("order:status_updated", handleStatusUpdate);
    };
  }, [loadOrders, loadStats, page]);

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await adminAPI.updateOrderStatus(id, { status });
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const invoice = async (id) => {
    try {
      setActionLoading(`invoice-${id}`);
      const res = await adminAPI.downloadInvoice(id);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to download invoice");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCount = (key) => {
    if (!stats) return 0;
    return stats[key] || 0;
  };

  const toggleSelect = (id) => {
    if (id === "__SELECT_ALL__") {
      const currentIds = orders.map((order) => order._id);
      const allSelected =
        currentIds.length > 0 &&
        currentIds.every((orderId) => selected.includes(orderId));

      if (allSelected) {
        setSelected((prev) =>
          prev.filter((orderId) => !currentIds.includes(orderId)),
        );
        return;
      }

      setSelected((prev) => {
        const merged = new Set(prev);
        currentIds.forEach((orderId) => merged.add(orderId));
        return [...merged];
      });
      return;
    }

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const bulkStatusUpdate = async (status) => {
    if (!selected.length) return;
    if (!TABS.map(([key]) => key).includes(status)) {
      setError("Invalid status selected");
      return;
    }
    try {
      setActionLoading("bulk");
      await Promise.all(
        selected.map((id) => adminAPI.updateOrderStatus(id, { status })),
      );
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

  // =========================
  // BULK CREATE SHIPMENT
  // =========================
  const bulkCreateShipment = async () => {
    if (!selected.length) return;

    try {
      setActionLoading("bulk-shipment");

      await Promise.all(selected.map((id) => adminAPI.createShipment(id)));

      setSelected([]);

      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(
        error.response?.data?.message || "Bulk shipment creation failed",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const requestPickup = async (id) => {
    try {
      setActionLoading(`pickup-${id}`);
      await adminAPI.requestPickup(id);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to request pickup");
    } finally {
      setActionLoading(null);
    }
  };

  const downloadLabel = async (id) => {
    try {
      setActionLoading(`label-${id}`);
      const res = await adminAPI.getShipmentLabel(id);
      const labelUrl = res.data?.data?.labelUrl;

      if (!labelUrl) {
        setError("Label is not available for this shipment");
        return;
      }

      window.open(labelUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to open shipment label",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const exportData = useMemo(() => {
    return orders.map((order) => ({
      id: order._id,
      customer: order.user?.name || "Guest",
      email: order.user?.email || "",
      status: order.status,
      amount: order.totalPrice,
      paymentStatus: order.paymentStatus,
      items: (order.items || [])
        .map((i) => `${i.quantity}x ${i.product?.title || i.name}`)
        .join(", "),
      address: order.address || order.shippingAddress || "",
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),
    }));
  }, [orders]);

  if (loading && orders.length === 0) {
    return (
      <div className="h-[70vh] grid place-items-center text-white">
        <Loader2 size={40} className="animate-spin text-[#D4A853]" />
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
          <button onClick={() => setError("")} className="ml-auto underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-4xl font-bold">Orders Management</h1>
          <p className="text-zinc-400 mt-1">
            Manage all orders professionally.
          </p>
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

          <label className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/30 border border-white/10 text-sm cursor-pointer hover:bg-black/40 transition-all">
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-indigo-600 bg-black/50 border-white/20 focus:ring-indigo-500 focus:ring-2"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show Archived
          </label>

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
          <span className="text-sm font-medium">
            {selected.length} selected
          </span>

          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-sm text-zinc-300 hover:text-white underline"
          >
            Clear
          </button>

          <select
            value=""
            onChange={(e) => e.target.value && bulkStatusUpdate(e.target.value)}
            className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-sm outline-none"
          >
            <option value="">Bulk Update Status</option>

            {TABS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* =========================
        BULK CREATE SHIPMENT
    ========================= */}
          {tab === "ready_to_ship" && (
            <button
              onClick={bulkCreateShipment}
              disabled={actionLoading === "bulk-shipment"}
              className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-black text-sm font-semibold disabled:opacity-50"
            >
              {actionLoading === "bulk-shipment"
                ? "Creating..."
                : "Create Shipments"}
            </button>
          )}

          <button
            onClick={bulkCancel}
            disabled={actionLoading === "bulk"}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <XSquare size={14} />
            Bulk Cancel
          </button>
        </div>
      )}

      {/* Orders */}
      <DataTable
        columns={[
          { key: "_id", label: "Order ID", render: (id) => `#${id.slice(-6)}` },
          { key: "user.name", label: "Customer" },
          {
            key: "totalPrice",
            label: "Amount",
            render: (price) => `₹${price}`,
          },
          {
            key: "status",
            label: "Status",
            render: (status) => (
              <span
                className={`px-3 py-1 rounded-full text-xs capitalize bg-white/10`}
              >
                {status.replaceAll("_", " ")}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
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
                  onChange={(event) =>
                    updateStatus(row._id, event.target.value)
                  }
                  className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs outline-none"
                >
                  {TABS.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                {row.delhivery?.waybill && !row.delhivery?.pickupRequested && (
                  <button
                    onClick={() => requestPickup(row._id)}
                    disabled={actionLoading === `pickup-${row._id}`}
                    className="px-3 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {actionLoading === `pickup-${row._id}`
                      ? "Requesting..."
                      : "Request Pickup"}
                  </button>
                )}
                {row.delhivery?.waybill && row.delhivery?.labelUrl && (
                  <button
                    onClick={() => downloadLabel(row._id)}
                    disabled={actionLoading === `label-${row._id}`}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-medium text-white disabled:opacity-50 flex items-center gap-1"
                  >
                    <FileDown size={14} />
                    {actionLoading === `label-${row._id}`
                      ? "Opening..."
                      : "Label"}
                  </button>
                )}
                <button
                  onClick={() => invoice(row._id)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center gap-1"
                >
                  <FileText size={14} />
                  Invoice
                </button>
              </div>
            ),
          },
        ]}
        data={orders}
        loadMore={() => loadOrders(page + 1)}
        hasMore={page < totalPages}
        loading={loading}
        total={orders.length}
        enableSelection={true}
        selected={selected}
        onSelect={toggleSelect}
        exportData={() => {
          /* handled by ExportButton above */
        }}
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

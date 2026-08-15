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
  Truck,
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
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
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

  const hasShipmentCreated = (order) => Boolean(order?.delhivery?.waybill);

  const toggleOrderSelection = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id)
        ? prev.filter((orderId) => orderId !== id)
        : [...prev, id],
    );
  };

  const isRowSelectable = (order) => {
    if (!order) return false;
    const nonSelectable = [
      "pickup_requested",
      "in_transit",
      "delivered",
      "returned",
      "rto",
      "cancelled",
    ];

    return !nonSelectable.includes(order.status);
  };

  const toggleSelectAllVisibleOrders = (visibleOrderIds = []) => {
    if (!visibleOrderIds.length) return;

    setSelectedOrderIds((prev) => {
      const selectedSet = new Set(prev);

      const allSelected = visibleOrderIds.every((id) => selectedSet.has(id));

      if (allSelected) {
        // Deselect all visible orders
        visibleOrderIds.forEach((id) => {
          selectedSet.delete(id);
        });
      } else {
        // Select all visible orders
        visibleOrderIds.forEach((id) => {
          selectedSet.add(id);
        });
      }

      return Array.from(selectedSet);
    });
  };

  const bulkStatusUpdate = async (status) => {
    if (!selectedOrderIds.length) return;
    if (!TABS.map(([key]) => key).includes(status)) {
      setError("Invalid status selected");
      return;
    }
    try {
      setActionLoading("bulk");
      await Promise.all(
        selectedOrderIds.map((id) =>
          adminAPI.updateOrderStatus(id, { status }),
        ),
      );
      setSelectedOrderIds([]);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Bulk update failed");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkCancel = async () => {
    if (!selectedOrderIds.length) return;
    if (!window.confirm(`Cancel ${selectedOrderIds.length} selected orders?`))
      return;
    await bulkStatusUpdate("cancelled");
  };

  const createShipmentForOrder = async (id) => {
    try {
      setActionLoading(`shipment-${id}`);
      await adminAPI.createShipment(id);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create shipment");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkCreateShipping = async () => {
    if (!selectedOrderIds.length) return;

    try {
      setActionLoading("bulk-shipping");
      const res = await adminAPI.createBulkShipping(selectedOrderIds);

      const summary = res.data?.data?.summary || {};
      const results = res.data?.data?.results || [];
      const createdCount = summary.created || 0;
      const skippedCount = summary.skipped || 0;
      const failedCount = summary.failed || 0;

      if (createdCount || skippedCount || failedCount) {
        setError("");
        window.alert(
          [
            `Created: ${createdCount}`,
            `Skipped: ${skippedCount}`,
            `Failed: ${failedCount}`,
            results
              .filter((result) => result.status !== "created")
              .map((result) => `${result.orderId}: ${result.message}`)
              .join("\n") || "All selected eligible orders were processed.",
          ].join("\n"),
        );
      }

      setSelectedOrderIds([]);
      await Promise.all([loadOrders(page), loadStats()]);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk shipment creation failed";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const bulkDownloadInvoices = async () => {
    if (!selectedOrderIds.length) return;

    try {
      setActionLoading("bulk-invoices");
      const res = await adminAPI.downloadBulkInvoices(selectedOrderIds);
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/zip" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "nayamo-invoices.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk invoice download failed";
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const bulkDownloadLabels = async () => {
    const eligibleOrderIds = selectedOrderIds.filter((id) =>
      orders.some((order) => order._id === id && hasShipmentCreated(order)),
    );

    if (!eligibleOrderIds.length) {
      setError(
        "Create shipment for at least one selected order before downloading labels",
      );
      return;
    }

    try {
      setActionLoading("bulk-labels");
      const results = await Promise.allSettled(
        eligibleOrderIds.map((id) => adminAPI.getShipmentLabel(id)),
      );

      const labelUrls = results
        .filter(
          (result) =>
            result.status === "fulfilled" && result.value?.data?.data?.labelUrl,
        )
        .map((result) => result.value.data.data.labelUrl);

      if (!labelUrls.length) {
        setError("No shipment labels are available for the selected orders");
        return;
      }

      labelUrls.forEach((labelUrl) => {
        const link = document.createElement("a");
        link.href = labelUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Bulk label download failed";
      setError(message);
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
      const row = orders.find((order) => order._id === id);
      if (!row || !hasShipmentCreated(row)) {
        setError("Create the shipment first before downloading the label");
        return;
      }

      setActionLoading(`label-${id}`);
      const res = await adminAPI.getShipmentLabel(id);
      const labelUrl = row.delhivery?.labelUrl || res.data?.data?.labelUrl;

      if (!labelUrl) {
        setError("Label is not available for this shipment");
        return;
      }

      const link = document.createElement("a");
      link.href = labelUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to open shipment label",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const selectedShippedOrderCount = selectedOrderIds.filter((id) =>
    orders.some((order) => order._id === id && hasShipmentCreated(order)),
  ).length;

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

          {/* Show Archived and Export removed per request */}

          <button
            onClick={() => {
              loadOrders(page);
              loadStats();
            }}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-sm flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCcw size={14} />
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
              setSelectedOrderIds([]);
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
      {selectedOrderIds.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">
            {selectedOrderIds.length} selected
          </span>

          <button
            type="button"
            onClick={() => setSelectedOrderIds([])}
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

          {tab === "pending" && (
            <>
              <button
                type="button"
                onClick={() => bulkStatusUpdate("confirmed")}
                disabled={actionLoading === "bulk"}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold disabled:opacity-50"
              >
                Accept Selected
              </button>

              <button
                type="button"
                onClick={() => bulkStatusUpdate("cancelled")}
                disabled={actionLoading === "bulk"}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                Reject Selected
              </button>
            </>
          )}

          {tab === "confirmed" && (
            <button
              type="button"
              onClick={() => bulkStatusUpdate("ready_to_ship")}
              disabled={actionLoading === "bulk"}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              Ready To Ship Selected
            </button>
          )}

          {tab === "ready_to_ship" && (
            <>
              <button
                type="button"
                onClick={bulkCreateShipping}
                disabled={actionLoading === "bulk-shipping"}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Truck size={14} />
                Create Shipment
              </button>

              <button
                type="button"
                onClick={bulkDownloadInvoices}
                disabled={actionLoading === "bulk-invoices"}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <FileText size={14} />
                Download Invoice
              </button>

              <button
                type="button"
                onClick={bulkDownloadLabels}
                disabled={
                  actionLoading === "bulk-labels" ||
                  selectedShippedOrderCount === 0
                }
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <FileDown size={14} />
                Download Label
              </button>
            </>
          )}

          {tab !== "cancelled" && (
            <button
              onClick={bulkCancel}
              disabled={actionLoading === "bulk"}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <XSquare size={14} />
              Bulk Cancel
            </button>
          )}
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
            render: (_, row) => {
              const hiddenStatuses = [
                "pickup_requested",
                "in_transit",
                "delivered",
                "returned",
                "rto",
              ];

              if (tab === "cancelled") return null;

              if (hiddenStatuses.includes(row.status)) {
                return null;
              }

              return (
                <div className="flex flex-wrap items-center gap-2 min-w-0 max-w-[170px]">
                  {tab === "pending" ? (
                    <>
                      <button
                        onClick={() => updateStatus(row._id, "confirmed")}
                        className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-medium text-black"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateStatus(row._id, "cancelled")}
                        className="px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-medium text-white"
                      >
                        Reject
                      </button>
                    </>
                  ) : tab === "confirmed" ? (
                    <button
                      onClick={() => updateStatus(row._id, "ready_to_ship")}
                      className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-medium text-white"
                    >
                      Ready To Ship
                    </button>
                  ) : tab === "ready_to_ship" ? (
                    <div className="flex flex-wrap items-center gap-2 max-w-[170px]">
                      {!hasShipmentCreated(row) ? (
                        <button
                          onClick={() => createShipmentForOrder(row._id)}
                          disabled={actionLoading === `shipment-${row._id}`}
                          className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-xs font-medium text-white disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                          <Truck size={14} />
                          {actionLoading === `shipment-${row._id}`
                            ? "Creating..."
                            : "Create Shipment"}
                        </button>
                      ) : (
                        <button
                          onClick={() => downloadLabel(row._id)}
                          disabled={actionLoading === `label-${row._id}`}
                          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-medium text-black disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
                        >
                          <FileDown size={14} />
                          {actionLoading === `label-${row._id}`
                            ? "Opening..."
                            : "Download Label"}
                        </button>
                      )}

                      <button
                        onClick={() => setDetailOrder(row)}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center gap-1 whitespace-nowrap min-w-[72px]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setDetailOrder(row)}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs flex items-center justify-center gap-1 whitespace-nowrap min-w-[72px]"
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
                    </>
                  )}
                </div>
              );
            },
          },
        ]}
        data={orders}
        loadMore={() => loadOrders(page + 1)}
        hasMore={page < totalPages}
        loading={loading}
        total={orders.length}
        enableSelection={true}
        selected={selectedOrderIds}
        onSelectAll={toggleSelectAllVisibleOrders}
        onSelectRow={toggleOrderSelection}
        isRowSelectable={isRowSelectable}
        showHeaderCheckbox={
          ![
            "pickup_requested",
            "in_transit",
            "delivered",
            "returned",
            "rto",
            "cancelled",
          ].includes(tab)
        }
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

import { useEffect, useMemo, useState, useCallback } from "react";
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

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        o._id?.toLowerCase().includes(term) ||
        o.user?.name?.toLowerCase().includes(term)
      );
    });
  }, [orders, debouncedSearch]);

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
          <div className="relative w-full min-w-0">
            <Search
              size={16}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full min-w-0 sm:w-72"
            />
          </div>

          <button
            onClick={loadOrders}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2 shrink-0"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 max-w-full scrollbar-hide">
        {tabs.map(([key, labelText]) => (
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
      <div className="grid gap-4 w-full">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            No orders found
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order._id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 w-full overflow-hidden"
            >
              <div className="flex flex-col xl:flex-row gap-5 xl:items-center xl:justify-between min-w-0">
                {/* Left */}
                <div className="flex gap-4 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={selected.includes(order._id)}
                    onChange={() => toggleSelect(order._id)}
                    className="w-5 h-5 mt-1 shrink-0"
                  />

                  <div className="min-w-0">
                    <h3 className="text-xl font-semibold break-all">
                      #{order._id.slice(-6)}
                    </h3>

                    <p className="text-zinc-300 mt-1 truncate">
                      {order.user?.name || "Customer"}
                    </p>

                    <p className="text-zinc-500 text-sm mt-2 break-words">
                      {order.address}
                    </p>

                    {order.delhivery?.waybill && (
                      <p className="text-green-400 text-sm mt-2 break-all">
                        WB: {order.delhivery.waybill}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="xl:text-right min-w-0 xl:max-w-[50%]">
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{order.totalPrice}
                  </p>

                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/10 text-sm capitalize break-words">
                    {order.status.replaceAll("_", " ")}
                  </span>

                  <div className="flex flex-wrap gap-2 mt-4 xl:justify-end max-w-full">
                    <button
                      onClick={() => invoice(order._id)}
                      className="px-3 py-2 rounded-xl bg-purple-600 text-sm flex items-center gap-2"
                    >
                      <FileText size={15} />
                      Invoice
                    </button>

                    {order.delhivery?.waybill && (
                      <button
                        onClick={() => label(order.delhivery.waybill)}
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-sm"
                      >
                        Label
                      </button>
                    )}

                    {order.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            updateStatus(order._id, "confirmed")
                          }
                          className="px-3 py-2 rounded-xl bg-emerald-600 text-sm"
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(order._id, "cancelled")
                          }
                          className="px-3 py-2 rounded-xl bg-red-600 text-sm flex items-center gap-2"
                        >
                          <XCircle size={15} />
                          Cancel
                        </button>
                      </>
                    )}

                    {order.status === "confirmed" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "ready_to_ship")
                        }
                        className="px-3 py-2 rounded-xl bg-cyan-600 text-sm"
                      >
                        Move Ready
                      </button>
                    )}

                    {order.status === "ready_to_ship" && (
                      <button
                        onClick={() => readyToShip(order._id)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-sm flex items-center gap-2"
                      >
                        <Truck size={15} />
                        Pickup Request
                      </button>
                    )}

                    {order.status === "pickup_requested" && (
                      <button className="px-3 py-2 rounded-xl bg-orange-600 text-sm flex items-center gap-2">
                        <PackageCheck size={15} />
                        Await Pickup
                      </button>
                    )}

                    {order.status === "returned" && (
                      <button className="px-3 py-2 rounded-xl bg-yellow-600 text-sm flex items-center gap-2">
                        <RotateCcw size={15} />
                        Refund / Exchange
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
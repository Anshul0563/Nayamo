import { useEffect, useMemo, useState, useCallback } from "react";
import { adminAPI } from "../services/api";
import { useDebounce } from "../hooks/useApi";
import {
  Search,
  RefreshCcw,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckSquare,
  XSquare,
} from "lucide-react";
import ExportButton from "../components/ExportButton";

const TABS = [
  ["all", "All Reviews"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  const [selected, setSelected] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  const loadReviews = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: 20,
        status: tab !== "all" ? tab : undefined,
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

      const res = await adminAPI.getReviews(params);

      const result = res.data;
      setReviews(result.data || result.reviews || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setPage(result.pagination?.currentPage || 1);
      
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch, dateFrom, dateTo]);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  const approveReview = async (id) => {
    try {
      setActionLoading(id);
      await adminAPI.approveReview(id);
      await loadReviews(page);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to approve review");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectReview = async (id) => {
    try {
      setActionLoading(id);
      await adminAPI.rejectReview(id);
      await loadReviews(page);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to reject review");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setActionLoading(id);
      await adminAPI.deleteReview(id);
      await loadReviews(page);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCount = (key) => {
    if (key === "all") {
      return (stats.pending || 0) + (stats.approved || 0) + (stats.rejected || 0);
    }
    return stats[key] || 0;
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selected.length === reviews.length) {
      setSelected([]);
    } else {
      setSelected(reviews.map((r) => r._id));
    }
  };

  const bulkApprove = async () => {
    if (!selected.length) return;
    try {
      setActionLoading("bulk");
      await Promise.all(selected.map((id) => adminAPI.approveReview(id)));
      setSelected([]);
      await loadReviews(page);
    } catch (error) {
      setError(error.response?.data?.message || "Bulk approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const bulkReject = async () => {
    if (!selected.length) return;
    try {
      setActionLoading("bulk");
      await Promise.all(selected.map((id) => adminAPI.rejectReview(id)));
      setSelected([]);
      await loadReviews(page);
    } catch (error) {
      setError(error.response?.data?.message || "Bulk reject failed");
    } finally {
      setActionLoading(null);
    }
  };

  const exportData = useMemo(() => {
    return reviews.map((r) => ({
      id: r._id,
      product: r.product?.title || "N/A",
      customer: r.user?.name || "Anonymous",
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      date: new Date(r.createdAt).toLocaleDateString("en-IN"),
    }));
  }, [reviews]);

  if (loading && reviews.length === 0) {
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
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError("")} className="ml-auto underline">Dismiss</button>
        </div>
      )}

      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-4xl font-bold">Reviews</h1>
          <p className="text-zinc-400 mt-1">Manage customer reviews.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0">
          <div className="relative w-full min-w-0">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full min-w-0 sm:w-64"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-4 text-zinc-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-9 pr-3 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none text-sm text-zinc-300"
              placeholder="From"
            />
          </div>

          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-4 text-zinc-500" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-9 pr-3 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none text-sm text-zinc-300"
              placeholder="To"
            />
          </div>

          <ExportButton filename="reviews" data={exportData} />

          <button
            onClick={() => loadReviews(1)}
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
          <button
            onClick={bulkApprove}
            disabled={actionLoading === "bulk"}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <CheckSquare size={14} />
            Bulk Approve
          </button>
          <button
            onClick={bulkReject}
            disabled={actionLoading === "bulk"}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <XSquare size={14} />
            Bulk Reject
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-zinc-400 hover:text-white ml-auto underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            <MessageSquare size={40} className="mx-auto mb-3 text-zinc-600" />
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className={`rounded-3xl border bg-white/5 p-5 transition ${
                selected.includes(review._id)
                  ? "border-indigo-500/50 bg-indigo-500/5"
                  : "border-white/10 hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex gap-4">
                <input
                  type="checkbox"
                  checked={selected.includes(review._id)}
                  onChange={() => toggleSelect(review._id)}
                  className="mt-1 w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={review.product?.images?.[0]?.url || review.product?.images?.[0] || ""}
                        alt={review.product?.title}
                        className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                      />
                      <div>
                        <h3 className="font-semibold text-white truncate">
                          {review.product?.title || "Product"}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {review.user?.name || "Anonymous"} • {" "}
                          {new Date(review.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"}
                        />
                      ))}
                      <span className="ml-1 text-sm font-medium text-white">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm mb-4 line-clamp-3">
                    {review.comment}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveReview(review._id)}
                          disabled={actionLoading === review._id}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                          {actionLoading === review._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => rejectReview(review._id)}
                          disabled={actionLoading === review._id}
                          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 flex items-center gap-2 text-sm disabled:opacity-50"
                        >
                          {actionLoading === review._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteReview(review._id)}
                      disabled={actionLoading === review._id}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <X size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => loadReviews(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-zinc-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => loadReviews(page + 1)}
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

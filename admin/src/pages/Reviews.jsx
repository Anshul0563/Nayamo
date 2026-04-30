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
  MessageSquare
} from "lucide-react";

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

  const debouncedSearch = useDebounce(search, 300);

  const loadReviews = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await adminAPI.getReviews({
        page: currentPage,
        limit: 20,
        status: tab !== "all" ? tab : undefined,
        search: debouncedSearch || undefined,
      });

      const result = res.data;
      setReviews(result.data || result.reviews || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setPage(result.pagination?.currentPage || 1);
      
      // Stats from response if available
      if (result.stats) {
        setStats(result.stats);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [tab, debouncedSearch]);

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
    if (!window.confirm("Are you sure you want to delete this review?"))
      return;

    try {
      setActionLoading(id);
      await adminAPI.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCount = (status) => {
    if (!stats) return 0;
    if (status === "all") return stats.total || 0;
    if (status === "pending") return stats.pending || 0;
    if (status === "approved") return stats.approved || 0;
    if (status === "rejected") return stats.rejected || 0;
    return 0;
  };

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
          <h1 className="text-2xl md:text-4xl font-bold">Reviews Management</h1>
          <p className="text-zinc-400 mt-1">Moderate customer reviews and ratings.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto min-w-0">
          <div className="relative w-full min-w-0">
            <Search size={16} className="absolute left-4 top-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..."
              className="pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none w-full min-w-0 sm:w-72"
            />
          </div>

          <button
            onClick={() => loadReviews(page)}
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

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-zinc-400">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
            <p>No reviews found</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-3xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                {/* Review Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      review.isApproved === true
                        ? "bg-emerald-500/20 text-emerald-400"
                        : review.status === "rejected"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {review.isApproved === true ? "Approved" : review.status === "rejected" ? "Rejected" : "Pending"}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 mb-2">
                    {review.comment || "No comment"}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>By {review.user?.name || "Anonymous"}</span>
                    <span>Product: {review.product?.title || "Unknown"}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {review.isApproved !== true && review.status !== "rejected" && (
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

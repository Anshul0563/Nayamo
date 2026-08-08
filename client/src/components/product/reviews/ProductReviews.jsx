import { motion } from "framer-motion";
import { MessageSquare, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { reviewAPI } from "../../../services/api";
import { getApiErrorMessage } from "../../../utils/errorMessage";

import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import ReviewMedia from "./ReviewMedia";
import ReviewSort from "./ReviewSort";
import ReviewSummary from "./ReviewSummary";

const REVIEWS_PER_PAGE = 9;

const SORT_COMPARATORS = {
  highest: (a, b) => (b.rating || 0) - (a.rating || 0),
  lowest: (a, b) => (a.rating || 0) - (b.rating || 0),
  recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
};

const EMPTY_COUNTS = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

/**
 * Customer Reviews section — premium, responsive, fully data-driven.
 * Uses the existing review API + stats endpoint. No mock data.
 */
export default function ProductReviews({ productId }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sortOrder, setSortOrder] = useState("highest");

  const [stats, setStats] = useState({
    avgRating: 0,
    total: 0,
    counts: EMPTY_COUNTS,
  });

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [reviewsRes, statsRes] = await Promise.all([
        reviewAPI.getProductReviews(productId, {
          page: 1,
          limit: REVIEWS_PER_PAGE,
        }),
        reviewAPI.getProductReviewStats(productId),
      ]);

      setReviews(reviewsRes.data?.data || []);
      setTotalItems(reviewsRes.data?.pagination?.totalItems || 0);
      setPage(1);

      const statsData = statsRes.data?.data;
      if (statsData) {
        setStats({
          avgRating: Number(statsData.avgRating || 0),
          total: Number(statsData.total || 0),
          counts: {
            5: Number(statsData.counts?.[5] || 0),
            4: Number(statsData.counts?.[4] || 0),
            3: Number(statsData.counts?.[3] || 0),
            2: Number(statsData.counts?.[2] || 0),
            1: Number(statsData.counts?.[1] || 0),
          },
        });
      } else {
        setStats((cur) => ({
          ...cur,
          total: reviewsRes.data?.pagination?.totalItems || 0,
        }));
      }
    } catch (err) {
      setReviews([]);
      setError(
        getApiErrorMessage(err, "Unable to load reviews. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const loadMore = async () => {
    if (loadingMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await reviewAPI.getProductReviews(productId, {
        page: nextPage,
        limit: REVIEWS_PER_PAGE,
      });
      const more = res.data?.data || [];
      setReviews((cur) => [...cur, ...more]);
      setPage(nextPage);
      setTotalItems(res.data?.pagination?.totalItems || totalItems);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load more reviews."));
    } finally {
      setLoadingMore(false);
    }
  };

  const sortedReviews = useMemo(() => {
    const comparator = SORT_COMPARATORS[sortOrder] || SORT_COMPARATORS.highest;
    return [...reviews].sort(comparator);
  }, [reviews, sortOrder]);

  const hasMore = reviews.length < totalItems;

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: `/product/${productId}` } },
      });
      return;
    }
    setSubmitError("");
    setShowForm((v) => !v);
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setSubmitError("");
      await reviewAPI.submitReview(productId, payload);
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-[#131316]" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 bg-[#131316] rounded" />
              <div className="h-2.5 w-1/3 bg-[#131316] rounded" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-3/4 bg-[#131316] rounded" />
            <div className="h-3 w-full bg-[#131316] rounded" />
            <div className="h-3 w-5/6 bg-[#131316] rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <motion.section
      className="mb-14 border-t border-white/[0.08] pt-10 sm:mb-20 sm:pt-14"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Heading */}
      <div className="mb-8 text-center sm:mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#D4A853]/30 bg-[#D4A853]/10 px-4 py-2 text-sm font-semibold text-[#F0D78C]">
          <MessageSquare className="h-4 w-4" />
          Customer Reviews
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Hear from our <span className="nayamo-text-gold">customers</span>
        </h2>
        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-[#D4A853]/60 to-transparent" />
      </div>

      {/* Summary */}
      {!loading && !error && (
        <ReviewSummary
          avgRating={stats.avgRating}
          total={stats.total}
          counts={stats.counts}
          isAuthenticated={isAuthenticated}
          onWriteReview={handleWriteReview}
        />
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="mt-6">
          <ReviewForm
            onClose={() => setShowForm(false)}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={submitError}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="mt-10">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div
            role="alert"
            className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/[0.04] px-6 py-12 text-center"
          >
            <p className="font-semibold text-white">Couldn't load reviews</p>
            <p className="mt-2 text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={fetchAll}
              className="mt-5 rounded-2xl border border-red-500/30 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10"
            >
              Try again
            </button>
          </div>
        ) : stats.total === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.03] px-6 py-14 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-[#D4A853]/25 bg-[#D4A853]/10">
              <Star className="h-7 w-7 text-[#D4A853]" />
            </div>
            <h3 className="text-xl font-bold text-white">No reviews yet</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Be the first to share your experience with this piece.
            </p>
            <button
              type="button"
              onClick={handleWriteReview}
              className="nayamo-btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              <Star className="h-4 w-4" />
              Write the first review
            </button>
          </div>
        ) : (
          <>
            {/* Customer Media */}
            <ReviewMedia reviews={reviews} />

            {/* Sort Bar */}
            <div className="mt-8 flex items-center justify-between gap-4 border-y border-white/[0.06] py-4">
              <p className="text-sm text-zinc-400">
                Showing{" "}
                <span className="font-semibold text-white">
                  {reviews.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">{totalItems}</span>{" "}
                reviews
              </p>
              <ReviewSort value={sortOrder} onChange={setSortOrder} />
            </div>

            {/* Grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sortedReviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="nayamo-btn-secondary inline-flex min-w-44 items-center justify-center px-6 py-3 text-sm disabled:cursor-wait disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load more reviews"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.section>
  );
}

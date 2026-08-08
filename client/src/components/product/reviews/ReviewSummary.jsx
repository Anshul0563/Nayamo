import { PenLine, Star } from "lucide-react";
import RatingBreakdown from "./RatingBreakdown";
import StarRating from "./StarRating";

/**
 * 3-column summary block:
 *   [Overall Rating] [Rating Distribution] [Write a Review]
 * Adapts to 2-column / stacked on tablet & mobile.
 */
export default function ReviewSummary({
  avgRating = 0,
  total = 0,
  counts = {},
  isAuthenticated,
  onWriteReview,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-[1fr_1.4fr_0.9fr] lg:items-stretch">
      {/* OVERALL RATING */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 text-center backdrop-blur-xl">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Overall Rating
        </p>
        <div className="mt-3 text-6xl font-bold leading-none text-white">
          {total > 0 ? Number(avgRating || 0).toFixed(1) : "—"}
        </div>
        <div className="mt-3">
          <StarRating rating={avgRating} size={22} />
        </div>
        <p className="mt-3 text-sm text-zinc-400">
          {total > 0 ? (
            <>
              Based on <span className="font-semibold text-white">{total}</span>{" "}
              review{total === 1 ? "" : "s"}
            </>
          ) : (
            "No reviews yet"
          )}
        </p>
      </div>

      {/* RATING DISTRIBUTION */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Rating Breakdown
        </p>
        <RatingBreakdown counts={counts} total={total} />
      </div>

      {/* WRITE A REVIEW */}
      <div className="flex flex-col items-center justify-center rounded-3xl border border-[#D4A853]/20 bg-gradient-to-br from-[#D4A853]/10 via-white/[0.03] to-[#D4A5A5]/5 p-6 text-center backdrop-blur-xl">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#D4A853]/30 bg-[#D4A853]/10">
          <PenLine className="h-6 w-6 text-[#D4A853]" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">
          Share your experience
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          Tell us what you loved about this piece.
        </p>
        <button
          type="button"
          onClick={onWriteReview}
          className="nayamo-btn-primary mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
        >
          <Star className="h-4 w-4" />
          Write a review
        </button>
        {!isAuthenticated && (
          <p className="mt-3 text-xs text-zinc-500">
            You'll sign in to share your review.
          </p>
        )}
      </div>
    </div>
  );
}

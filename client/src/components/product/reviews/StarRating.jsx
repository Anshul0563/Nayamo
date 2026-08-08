import { Star } from "lucide-react";

/**
 * Displays a star rating that supports fractional values (e.g. 4.67).
 * Uses a golden base layer of stars plus a clipped overlay that only
 * fills up to the fractional rating width.
 *
 * @param {number} rating  - The rating value (0..5)
 * @param {number} size    - Pixel size of each star
 * @param {boolean} showValue - Whether to render the numeric value next to stars
 */
export default function StarRating({
  rating = 0,
  size = 18,
  showValue = false,
}) {
  const clamped = Math.min(5, Math.max(0, Number(rating) || 0));
  const percent = Math.min(100, (clamped / 5) * 100);

  const renderStars = (overlay) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        aria-hidden="true"
        className={
          overlay
            ? "fill-current text-[#D4A853]"
            : "fill-zinc-700 text-zinc-700"
        }
        style={{ width: size, height: size }}
      />
    ));

  return (
    <span
      className="inline-flex items-center gap-2"
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      <span className="relative inline-flex" aria-hidden="true">
        {/* Base (empty) stars */}
        <span className="flex">{renderStars(false)}</span>
        {/* Overlay (filled) clipped to fractional width */}
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          {renderStars(true)}
        </span>
      </span>

      {showValue && (
        <span className="text-sm font-bold text-white">
          {clamped.toFixed(1)}
        </span>
      )}
    </span>
  );
}

import React from "react";
import { X, Star } from "lucide-react";

const categories = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

const ratings = [4, 3, 2];

export default function ProductFilters({
  showFilters,
  category,
  updateParam,
  rating,
  setRating,
  clearFilters,
}) {
  if (!showFilters) return null;

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 mr-2">Category:</span>

          {categories.map((c) => {
            const active = category === c;

            return (
              <button
                key={c}
                onClick={() =>
                  updateParam("category", active ? "" : c)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#D4A853] text-black shadow-[0_0_10px_rgba(212,168,83,0.4)]"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Rating:</span>

          {ratings.map((r) => {
            const active = rating === r;

            return (
              <button
                key={r}
                onClick={() => {
                  setRating(active ? 0 : r);
                  updateParam("rating", active ? "" : r);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  active
                    ? "bg-[#D4A853] text-black"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                {r}+
              </button>
            );
          })}
        </div>

        {/* Clear */}
        {(category || rating > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-[#D4A853] hover:text-white transition"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
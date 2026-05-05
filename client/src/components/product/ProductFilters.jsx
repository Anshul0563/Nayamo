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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-lg">

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-xs uppercase tracking-wider text-zinc-400 mr-3 font-medium">Category</span>

          {categories.map((c) => {
            const active = category === c;

            return (
              <button
                key={c}
                onClick={() => updateParam("category", active ? "" : c)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-r from-[#D4A853] to-amber-500 text-black shadow-md shadow-[#D4A853]/30 scale-[1.05]"
                    : "bg-[#1a1a1f]/50 backdrop-blur-sm text-zinc-400 border border-white/[0.1] hover:bg-[#D4A853]/10 hover:text-zinc-200 hover:border-[#D4A853]/30 hover:shadow-md"
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs uppercase tracking-wider text-zinc-400 mr-2 font-medium flex-shrink-0">Rating</span>
          
          {ratings.map((r) => {
            const active = rating === r;

            return (
              <button
                key={r}
                onClick={() => {
                  setRating(active ? 0 : r);
                  updateParam("rating", active ? "" : r.toString());
                }}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  active
                    ? "bg-gradient-to-r from-[#D4A853] to-amber-500 text-black shadow-md shadow-[#D4A853]/40"
                    : "bg-[#1a1a1f]/50 backdrop-blur-sm text-zinc-400 border border-white/[0.1] hover:bg-[#D4A853]/10 hover:text-zinc-200 hover:border-[#D4A853]/30 hover:shadow-md"
                }`}
              >
                {Array(r).fill().map((_, i) => (
                  <Star key={i} className="w-3 h-3 flex-shrink-0" />
                ))}
                <span>&amp; up</span>
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        {(category || rating > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-[#D4A853]/20 backdrop-blur-sm text-[#D4A853] border border-[#D4A853]/30 hover:bg-[#D4A853]/30 hover:text-white hover:shadow-lg shadow-md transition-all duration-300 whitespace-nowrap flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

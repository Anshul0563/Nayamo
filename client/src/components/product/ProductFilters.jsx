import React, { useState } from "react";
import { X, Star, ChevronDown } from "lucide-react";
import { useFilter } from "../../context/FilterContext";

const CATEGORIES = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

const RATINGS = [4, 3, 2];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "-createdAt", label: "Newest First" },
];

export default function ProductFilters() {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilter();
  const [stockOnly, setStockOnly] = useState(false);

  const handleSortChange = (e) => {
    updateFilter("sort", e.target.value);
  };

  const handleRatingChange = (value) => {
    updateFilter("rating", value);
  };

  const hasFilters = activeFilterCount > 0;

  return (
    <div className="space-y-6">

      {/* Categories */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <span className="text-xs text-zinc-400 mb-3 block">Category</span>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = filters.category === c;

            return (
              <button
                key={c}
                onClick={() => updateFilter("category", active ? "" : c)}
                className={`px-4 py-2 rounded-full text-xs ${
                  active
                    ? "bg-[#D4A853] text-black"
                    : "bg-white/[0.05] text-zinc-400"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <span className="text-xs text-zinc-400 mb-3 block">Rating</span>

        <div className="flex gap-2">
          {RATINGS.map((r) => {
            const active = filters.rating === r;

            return (
              <button
                key={r}
                onClick={() => handleRatingChange(active ? 0 : r)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs ${
                  active
                    ? "bg-[#D4A853] text-black"
                    : "bg-white/[0.05] text-zinc-400"
                }`}
              >
                {Array(r).fill().map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                & up
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <span className="text-xs text-zinc-400 mb-3 block">Sort</span>

        <div className="relative">
          <select
            value={filters.sort}
            onChange={handleSortChange}
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30"
        >
          Clear All ({activeFilterCount})
        </button>
      )}
    </div>
  );
}
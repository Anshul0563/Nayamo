import React from "react";
import { X, Star, ChevronDown } from "lucide-react";
import { useFilter } from "../context/FilterContext";
const CATEGORIES = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "-createdAt", label: "Newest" },
];

export default function ProductFilters() {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilter();

  return (
    <div className="mb-8">

      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-2 py-3 rounded-2xl 
      bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">

        {/* 🔥 Categories */}
        {CATEGORIES.map((c) => {
          const active = filters.category === c;

          return (
            <button
              key={c}
              onClick={() => updateFilter("category", active ? "" : c)}
              className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
                active
                  ? "bg-[#D4A853] text-black shadow-md"
                  : "bg-white/[0.05] text-zinc-400 hover:bg-[#D4A853]/10 hover:text-white"
              }`}
            >
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          );
        })}

        {/* 🔥 Rating */}
        <button
          onClick={() =>
            updateFilter("rating", filters.rating === 4 ? 0 : 4)
          }
          className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs ${
            filters.rating === 4
              ? "bg-[#D4A853] text-black"
              : "bg-white/[0.05] text-zinc-400"
          }`}
        >
          <Star className="w-3 h-3" />
          4+
        </button>

        {/* 🔥 Sort Dropdown */}
        <div className="relative">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none px-4 py-2 rounded-full text-xs bg-white/[0.05] text-zinc-300 border border-white/[0.1]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 text-zinc-400" />
        </div>

        {/* 🔥 Clear */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 px-3 py-2 rounded-full text-xs 
            bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
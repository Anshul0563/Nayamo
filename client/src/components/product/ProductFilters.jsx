import React from "react";
import { X, Star, Filter, ChevronDown } from "lucide-react";

const categories = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

const ratings = [4, 3, 2];

const sortOptions = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "-createdAt", label: "Newest First" },
];

export default function ProductFilters({
  category,
  updateParam,
  rating,
  setRating,
  clearFilters,
  priceRange,
  setPriceRange,
  sortFilter,
  setSortFilter,
  search,
  setSearch
}) {
  const handlePriceChange = (e, isMin) => {
    const value = Number(e.target.value);
    if (isMin) {
      setPriceRange([value, priceRange[1]]);
      updateParam("priceMin", value);
    } else {
      setPriceRange([priceRange[0], value]);
      updateParam("priceMax", value);
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortFilter(value);
    updateParam("sort", value);
  };

  const hasFilters = category || rating > 0 || priceRange[0] > 0 || priceRange[1] < 50000 || sortFilter;

  return (
    <div className="space-y-4">
      {/* Search - optional mini version, or hidden since in header */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nayamo-gold" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateParam("search", e.target.value || "");
          }}
          placeholder="Search products..."
          className="w-full pl-10 pr-12 py-3 rounded-2xl bg-nayamo-bg-card/80 border border-nayamo-border-light text-nayamo-text-primary placeholder-nayamo-text-muted focus:ring-2 focus:ring-nayamo-gold/50 backdrop-blur-xl nayamo-input"
        />
      </div>

      {/* Categories & Rating Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-xl">
        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-xs uppercase tracking-wider text-zinc-400 mr-3 font-medium whitespace-nowrap">Category</span>
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

        {/* Rating */}
        <div className="flex items-center gap-2">
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
                  <Star key={i} className="w-3 h-3 flex-shrink-0 fill-current" />
                ))}
                <span>& up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-xl">
        <label className="block text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
          Price Range
          <span className="text-lg font-bold text-nayamo-gold ml-auto">
            ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </span>
        </label>
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange(e, true)}
              className="flex-1 h-2 bg-nayamo-border-light rounded-lg appearance-none cursor-pointer accent-nayamo-gold hover:accent-amber-500"
            />
            <span className="w-20 text-right text-sm font-mono text-zinc-400">
              ₹{priceRange[0].toLocaleString()}
            </span>
          </div>
          <div className="flex gap-3">
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange(e, false)}
              className="flex-1 h-2 bg-nayamo-border-light rounded-lg appearance-none cursor-pointer accent-nayamo-gold hover:accent-amber-500"
            />
            <span className="w-20 text-right text-sm font-mono text-zinc-400">
              ₹{priceRange[1].toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-xl">
        <label className="block text-sm font-medium text-zinc-300 mb-3">Sort By</label>
        <div className="relative">
          <select
            value={sortFilter}
            onChange={handleSortChange}
            className="w-full appearance-none bg-nayamo-bg-card/80 border border-nayamo-border-light rounded-2xl px-4 py-3 pr-10 text-nayamo-text-primary focus:ring-2 focus:ring-nayamo-gold/50 focus:border-transparent backdrop-blur-xl cursor-pointer font-medium"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <div className="text-center">
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-300 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-200 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 font-semibold shadow-md"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}


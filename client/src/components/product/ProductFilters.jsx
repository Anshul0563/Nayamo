import React from "react";
import { X, Search } from "lucide-react";

export default function ProductFilters({
  showFilters,
  setShowFilters,
  category,
  updateParam,
  search,
  setSearch,
  clearFilters,
}) {
  if (!showFilters) return null;

  const categories = [
    "party",
    "daily",
    "traditional",
    "western",
    "statement",
    "bridal",
  ];

  return (
    <div className="relative mb-8">
      {/* Glass Card */}
      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.4)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white tracking-wide">
            Filters
          </h3>

          {(category || search) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 transition"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111113] border border-white/[0.06] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/50 transition"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => {
            const active = category === c;

            return (
              <button
                key={c}
                onClick={() =>
                  updateParam("category", active ? "" : c)
                }
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${
                    active
                      ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black shadow-lg shadow-[#D4A853]/20 scale-105"
                      : "bg-[#141416] text-gray-400 border border-white/[0.05] hover:bg-[#1E1E22] hover:text-white"
                  }
                `}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
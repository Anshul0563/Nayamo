import React from "react";
import { X, Search } from "lucide-react";

const categories = [
  "party",
  "daily",
  "traditional",
  "western",
  "statement",
  "bridal",
];

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

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Filters
        </h2>

        {(category || search) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Category
        </h3>

        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = category === c;

            return (
              <button
                key={c}
                onClick={() =>
                  updateParam("category", active ? "" : c)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  active
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Footer */}
      <button
        onClick={clearFilters}
        className="w-full text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
      >
        Reset Filters
      </button>
    </div>
  );
}
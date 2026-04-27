import React from "react";
import { X } from "lucide-react";

export default function ProductFilters({ showFilters, setShowFilters, category, updateParam, search, setSearch, clearFilters }) {
  if (!showFilters) return null;

  return (
    <div className="nayamo-card p-5 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[#E8E8E8]">Category:</span>
        {["party", "daily", "traditional", "western", "statement", "bridal"].map((c) => (
          <button
            key={c}
            onClick={() => updateParam("category", category === c ? "" : c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              category === c
                ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#0A0A0A]"
                : "bg-[#1A1A1C] text-[#9CA3AF] hover:bg-[#242428] border border-white/[0.06]"
            }`}
          >
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        {(category || search) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-[#D4A5A5] hover:text-[#E8C4C4] ml-auto"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}


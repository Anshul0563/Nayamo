import React from "react";
import {
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Sparkle,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useFilter } from "../../context/FilterContext";

const CATEGORIES = [
  { value: "party", label: "Party Wear" },
  { value: "daily", label: "Daily Wear" },
  { value: "traditional", label: "Traditional" },
  { value: "western", label: "Western" },
  { value: "statement", label: "Statement" },
  { value: "bridal", label: "Bridal" },
];

const RATINGS = [4, 3, 2];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price Low to High" },
  { value: "price-desc", label: "Price High to Low" },
  { value: "rating-desc", label: "Top Rated" },
  { value: "-createdAt", label: "Newest Arrivals" },
];

const containerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
      staggerChildren: 0.035,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

export default function ProductFilters() {
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilter();

  const selectedSort =
    SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ||
    "Recommended";

  return (
    <motion.section
      className="mb-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      aria-label="Product filters"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0F0F11]/80 shadow-[0_24px_80px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/45 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#D4A853]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 px-4 py-4 sm:px-5 lg:px-6">
          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D4A853]/20 bg-[#D4A853]/10 text-[#D4A853] shadow-[0_0_28px_rgba(212,168,83,0.10)]">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Refine Collection</p>
                <p className="text-xs text-zinc-500">
                  Category, rating, and order of display
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <span className="rounded-full border border-[#D4A853]/20 bg-[#D4A853]/10 px-3 py-1.5 text-xs font-medium text-[#D4A853]">
                  {activeFilterCount} active
                </span>
              )}

              {activeFilterCount > 0 && (
                <motion.button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-medium text-zinc-300 transition-all duration-300 hover:border-[#D4A853]/35 hover:bg-[#D4A853]/10 hover:text-[#F0D78C]"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </motion.button>
              )}
            </div>
          </motion.div>

          <div className="grid gap-5 xl:grid-cols-[1fr_auto_auto] xl:items-end">
            <motion.div variants={itemVariants} className="min-w-0">
              <div className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
                <Sparkle className="h-3.5 w-3.5 text-[#D4A853]" />
                Category
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 lg:gap-3 pb-1">
                {CATEGORIES.map((category) => {
                  const active = filters.category === category.value;

                  return (
                    <motion.button
                      key={category.value}
                      type="button"
                      onClick={() =>
                        updateFilter(
                          "category",
                          active ? "" : category.value,
                        )
                      }
                      className={`relative h-10 rounded-full border px-3 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm ${
                        active
                          ? "border-[#D4A853] bg-[#D4A853] text-[#060607] shadow-[0_10px_28px_rgba(212,168,83,0.20)]"
                          : "border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {category.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
                <Star className="h-3.5 w-3.5 text-[#D4A853]" />
                Rating
              </div>

              <div className="flex rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
                {RATINGS.map((rating) => {
                  const active = filters.rating === rating;

                  return (
                    <motion.button
                      key={rating}
                      type="button"
                      onClick={() =>
                        updateFilter("rating", active ? 0 : rating)
                      }
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-all duration-300 sm:px-3.5 ${
                        active
                          ? "bg-[#D4A853] text-[#060607] shadow-[0_8px_24px_rgba(212,168,83,0.18)]"
                          : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          active
                            ? "fill-[#060607] text-[#060607]"
                            : "text-[#D4A853]"
                        }`}
                      />
                      {rating}+
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="min-w-[220px]">
              <label
                htmlFor="product-sort"
                className="mb-2.5 block text-xs font-medium uppercase tracking-normal text-zinc-500"
              >
                Sort
              </label>

              <div className="relative">
                <select
                  id="product-sort"
                  value={filters.sort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="h-11 w-full appearance-none rounded-full border border-white/[0.08] bg-white/[0.035] px-4 pr-10 text-sm font-medium text-zinc-200 outline-none transition-all duration-300 hover:border-[#D4A853]/35 focus:border-[#D4A853]/55 focus:bg-[#D4A853]/10 focus:text-white"
                  aria-label={`Sort products by ${selectedSort}`}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#0F0F11] text-zinc-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A853]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

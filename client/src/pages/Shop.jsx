import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

const categories = [
  { value: "party", label: "Party Wear" },
  { value: "daily", label: "Daily Wear" },
  { value: "traditional", label: "Traditional" },
  { value: "western", label: "Western" },
  { value: "statement", label: "Statement" },
  { value: "bridal", label: "Bridal" },
];

const sortOptions = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Newest" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = { page };
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (search) params.search = search;
        const res = await productAPI.getProducts(params);
        setProducts(res.data?.data || []);
        setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1 });
      } catch (err) {
        console.error("Shop error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, sort, page, search]);

  const updateParam = (key, value) => {
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.set("page", "1");
    setSearchParams(sp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchParams(new URLSearchParams());
  };

  const pageTitle = category
    ? `${category.charAt(0).toUpperCase() + category.slice(1)} Earrings`
    : "All Earrings";

  const activeFiltersCount = (category ? 1 : 0) + (search ? 1 : 0) + (sort ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#070708]">
      {/* Header */}
      <div className="bg-[#0A0A0C] border-b border-white/[0.04]">
        <div className="nayamo-container py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              {pageTitle}
            </h1>
            <p className="text-[#A1A1AA] max-w-lg">
              {category
                ? `Exquisite ${category} earrings crafted to perfection`
                : "Discover handcrafted earrings for every occasion"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="nayamo-container py-8">
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search earrings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nayamo-input pl-11 pr-4 py-3.5"
            />
          </form>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-3 rounded-xl border font-medium text-sm flex items-center gap-2.5 transition-all ${
                showFilters
                  ? "border-[#D4A853] text-[#D4A853] bg-[#D4A853]/8"
                  : "border-white/[0.07] text-[#A1A1AA] bg-[#131316] hover:bg-[#18181C]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D4A853] text-[#070708] text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="appearance-none px-5 py-3 pr-12 rounded-xl border border-white/[0.07] bg-[#131316] text-sm font-medium text-[#E4E4E7] focus:border-[#D4A853]/40 outline-none cursor-pointer hover:bg-[#18181C] transition-colors"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(category || search || sort) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/20">
                {categories.find((c) => c.value === category)?.label || category}
                <button onClick={() => updateParam("category", "")}>
                  <X className="w-3 h-3 hover:text-white transition-colors" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#D4A5A5]/10 text-[#D4A5A5] border border-[#D4A5A5]/20">
                &ldquo;{search}&rdquo;
                <button onClick={() => { setSearch(""); updateParam("search", ""); }}>
                  <X className="w-3 h-3 hover:text-white transition-colors" />
                </button>
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-[#A1A1AA] border border-white/[0.08]">
                {sortOptions.find((s) => s.value === sort)?.label}
                <button onClick={() => updateParam("sort", "")}>
                  <X className="w-3 h-3 hover:text-white transition-colors" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-[#71717A] hover:text-[#D4A5A5] transition-colors ml-1"
            >
              Clear all
            </button>
          </motion.div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="nayamo-card p-6 mb-8 border border-white/[0.04]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-[#E4E4E7] mr-2">
                    Category:
                  </span>
                  {categories.map((c) => (
                    <button
                      key={c.value}
                      onClick={() =>
                        updateParam("category", category === c.value ? "" : c.value)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        category === c.value
                          ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708] shadow-[0_4px_16px_rgba(212,168,83,0.25)]"
                          : "bg-[#131316] text-[#A1A1AA] hover:bg-[#18181C] border border-white/[0.06]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            type="search"
            title="No earrings found"
            description="Try adjusting your filters or search query."
            actionText="Clear Filters"
            actionLink="/shop"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mb-12">
              {products.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i % 4} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="p-2.5 rounded-xl border border-white/[0.07] bg-[#131316] disabled:opacity-30 hover:bg-[#18181C] text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => updateParam("page", String(p))}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        p === page
                          ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708] shadow-[0_4px_16px_rgba(212,168,83,0.25)]"
                          : "border border-white/[0.07] bg-[#131316] text-[#A1A1AA] hover:bg-[#18181C] hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2.5 rounded-xl border border-white/[0.07] bg-[#131316] disabled:opacity-30 hover:bg-[#18181C] text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


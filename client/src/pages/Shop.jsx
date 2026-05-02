import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

const categories = [
  { value: "party", label: "Party Wear", icon: "🎭" },
  { value: "daily", label: "Daily Wear", icon: "✨" },
  { value: "traditional", label: "Traditional", icon: "🪔" },
  { value: "western", label: "Western", icon: "💎" },
  { value: "statement", label: "Statement", icon: "👑" },
  { value: "bridal", label: "Bridal", icon: "💍" },
];

const sortOptions = [
  { value: "", label: "Sort By" },
  { value: "newest", label: "Newest First" },
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
    ? `${categories.find(c => c.value === category)?.label || category} Collection`
    : "Luxury Earrings Collection";

  const activeFiltersCount = (category ? 1 : 0) + (search ? 1 : 0) + (sort ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(212,168,83,0.03),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,165,165,0.02),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <motion.div
        className="relative border-b border-white/[0.08] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="nayamo-container py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A853] via-[#FFD700] to-[#D4A853] shadow-[0_12px_40px_rgba(212,168,83,0.4)] ring-2 ring-white/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-transparent tracking-tight">
                  {pageTitle}
                </h1>
                <motion.div
                  className="flex items-center justify-center gap-2 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Sparkles className="w-5 h-5 text-[#D4A853]" />
                  <p className="text-zinc-400 text-lg font-medium">
                    {category
                      ? `Exquisite ${category} earrings crafted to perfection`
                      : "Discover handcrafted luxury for every occasion"}
                  </p>
                  <Sparkles className="w-5 h-5 text-[#D4A853]" />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <div className="relative nayamo-container py-12">
        {/* Search & Controls */}
        <motion.div
          className="flex flex-col md:flex-row gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.form
            onSubmit={handleSearch}
            className="flex-1 relative group"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4A853]/10 via-transparent to-[#D4A5A5]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-3xl backdrop-blur-xl hover:border-[#D4A853]/30 transition-all duration-500 overflow-hidden">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-hover:text-[#D4A853] transition-colors" />
              <input
                type="text"
                placeholder="Search luxury earrings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-transparent text-white placeholder-zinc-500 outline-none text-lg"
              />
            </div>
          </motion.form>

          <div className="flex gap-4">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative px-8 py-5 rounded-3xl border font-semibold text-sm flex items-center gap-3 transition-all duration-500 overflow-hidden ${
                showFilters
                  ? "border-[#D4A853] text-white bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 shadow-[0_8px_32px_rgba(212,168,83,0.3)]"
                  : "border-white/[0.15] text-zinc-300 bg-white/[0.02] backdrop-blur-xl hover:border-[#D4A853]/50 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D4A853] to-[#FFD700] text-black text-xs font-bold flex items-center justify-center shadow-lg"
                >
                  {activeFiltersCount}
                </motion.span>
              )}
            </motion.button>

            <motion.div
              className="relative group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4A853]/10 to-[#D4A5A5]/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="relative appearance-none px-8 py-5 pr-14 rounded-3xl border border-white/[0.15] bg-white/[0.02] backdrop-blur-xl text-sm font-semibold text-zinc-300 hover:border-[#D4A853]/50 hover:bg-white/[0.06] focus:border-[#D4A853]/60 focus:ring-2 focus:ring-[#D4A853]/20 outline-none cursor-pointer transition-all duration-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0A0A0C] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none group-hover:text-[#D4A853] transition-colors" />
            </motion.div>
          </div>
        </motion.div>

        {/* Active Filters */}
        <AnimatePresence>
          {(category || search || sort) && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl"
            >
              <span className="text-sm font-medium text-zinc-400 mr-2">Active Filters:</span>
              {category && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 text-white border border-[#D4A853]/30 shadow-lg"
                >
                  {categories.find((c) => c.value === category)?.icon} {categories.find((c) => c.value === category)?.label || category}
                  <button
                    onClick={() => updateParam("category", "")}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              )}
              {search && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-[#D4A5A5]/20 to-[#D4A853]/20 text-white border border-[#D4A5A5]/30 shadow-lg"
                >
                  "{search}"
                  <button
                    onClick={() => { setSearch(""); updateParam("search", ""); }}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              )}
              {sort && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold bg-white/[0.08] text-zinc-300 border border-white/[0.15]"
                >
                  {sortOptions.find((s) => s.value === sort)?.label}
                  <button
                    onClick={() => updateParam("sort", "")}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              )}
              <motion.button
                onClick={clearFilters}
                className="text-sm text-zinc-400 hover:text-[#D4A5A5] transition-colors ml-2 underline underline-offset-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear all
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mb-10"
            >
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-lg font-semibold text-white mr-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#D4A853]" />
                    Categories:
                  </span>
                  {categories.map((c, index) => (
                    <motion.button
                      key={c.value}
                      onClick={() =>
                        updateParam("category", category === c.value ? "" : c.value)
                      }
                      className={`relative px-6 py-4 rounded-2xl text-sm font-semibold transition-all duration-500 overflow-hidden ${
                        category === c.value
                          ? "bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black shadow-[0_8px_32px_rgba(212,168,83,0.4)] border-2 border-[#D4A853]/50"
                          : "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] border border-white/[0.12] hover:border-[#D4A853]/40 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
                      }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="mr-2">{c.icon}</span>
                      {c.label}
                      {category === c.value && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        />
                      )}
                    </motion.button>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EmptyState
              type="search"
              title="No luxury pieces found"
              description="Try adjusting your filters or search for different styles."
              actionText="Browse All Collections"
              actionLink="/shop"
            />
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {products.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>

            {pagination.totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <motion.button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="p-4 rounded-3xl border border-white/[0.15] bg-white/[0.02] backdrop-blur-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06] hover:border-[#D4A853]/40 text-white transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
                  whileHover={{ scale: page > 1 ? 1.1 : 1 }}
                  whileTap={{ scale: page > 1 ? 0.9 : 1 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    const distance = Math.abs(p - page);
                    return distance === 0 || distance === 1 || p === 1 || p === pagination.totalPages;
                  })
                  .map((p, index, arr) => (
                    <React.Fragment key={p}>
                      {index > 0 && arr[index - 1] !== p - 1 && (
                        <span className="text-zinc-600 px-2">...</span>
                      )}
                      <motion.button
                        onClick={() => updateParam("page", String(p))}
                        className={`w-14 h-14 rounded-3xl text-sm font-bold transition-all duration-500 ${
                          p === page
                            ? "bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black shadow-[0_12px_40px_rgba(212,168,83,0.4)] border-2 border-[#D4A853]/50"
                            : "border border-white/[0.15] bg-white/[0.02] backdrop-blur-xl text-zinc-300 hover:bg-white/[0.06] hover:border-[#D4A853]/40 hover:text-white hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
                        }`}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {p}
                      </motion.button>
                    </React.Fragment>
                  ))}

                <motion.button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-4 rounded-3xl border border-white/[0.15] bg-white/[0.02] backdrop-blur-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/[0.06] hover:border-[#D4A853]/40 text-white transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
                  whileHover={{ scale: page < pagination.totalPages ? 1.1 : 1 }}
                  whileTap={{ scale: page < pagination.totalPages ? 0.9 : 1 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
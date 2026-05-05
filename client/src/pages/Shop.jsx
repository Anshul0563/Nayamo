import React, { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  Filter as FilterIcon,
} from "lucide-react";

import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { useFilter } from "../context/FilterContext";

const sortOptions = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "-createdAt", label: "Newest First" },
];

export default function Shop() {
  const { filters, apiParams, updateFilter, clearFilters, activeFilterCount } =
    useFilter();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { ref, inView } = useInView({ threshold: 0 });

  // ================= FETCH =================
  const fetchProducts = useCallback(
    async (append = false) => {
      try {
        setLoading(!append);
        setLoadingMore(append);
        setError(null);

        const params = { ...apiParams, page };

        const res = await productAPI.getProducts(params);
        const newProducts = res.data?.data || [];

        setProducts((prev) => {
          const ids = new Set(prev.map((p) => p._id));
          const filtered = newProducts.filter((p) => !ids.has(p._id));
          return append ? [...prev, ...filtered] : filtered;
        });

        setHasMore(newProducts.length === 20);
      } catch (err) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [apiParams, page]
  );

  // ================= RESET PAGE ON FILTER CHANGE =================
  useEffect(() => {
    setPage(1);
  }, [apiParams]);

  // ================= FETCH ON PAGE CHANGE =================
  useEffect(() => {
    fetchProducts(page > 1);
  }, [page, fetchProducts]);

  // ================= INFINITE SCROLL =================
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loadingMore]);

  // ================= FILTER CHIPS =================
  const activeFilters = [
    filters.category && {
      key: "category",
      label:
        "Category: " +
        filters.category.charAt(0).toUpperCase() +
        filters.category.slice(1),
    },
    filters.rating > 0 && {
      key: "rating",
      label: `${filters.rating}+ Stars`,
    },
    filters.sort && {
      key: "sort",
      label: sortOptions.find((o) => o.value === filters.sort)?.label,
    },
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key === "category") updateFilter("category", "");
    if (key === "rating") updateFilter("rating", 0);
    if (key === "sort") updateFilter("sort", "");
  };

  // ================= LOADING =================
  if (loading && page === 1) {
    return <SkeletonGrid count={16} className="py-32" />;
  }

  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden py-12">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#D4A853]/10 blur-[140px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-[#D4A853]/5 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">

        {/* 🔥 HEADER */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-5xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-transparent"
        >
          Luxury Jewellery
        </motion.h1>

        {/* 🔥 FILTER CHIPS */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div className="mb-8 p-4 rounded-3xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl">
              <div className="flex flex-wrap gap-2 items-center">
                {activeFilters.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => removeFilter(chip.key)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.15] text-zinc-300"
                  >
                    {chip.label}
                    <X className="w-4 h-4" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-zinc-400 hover:text-zinc-200"
                >
                  Clear all ({activeFilterCount})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-8">

          {/* 🔥 DESKTOP FILTER */}
          <div className="hidden lg:block w-80">
            <ProductFilters />
          </div>

          {/* 🔥 PRODUCTS */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.length === 0 ? (
                <EmptyState title="No products found" />
              ) : (
                products.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))
              )}
            </div>

            {/* 🔥 LOAD MORE */}
            <div ref={ref} className="h-20 flex justify-center items-center">
              {loadingMore && <SkeletonGrid count={4} />}
            </div>

            {error && (
              <div className="text-center text-zinc-400 py-10">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 🔥 MOBILE FILTER BUTTON */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-r from-[#D4A853] to-amber-500 text-black flex items-center justify-center shadow-xl"
        >
          <FilterIcon />
        </button>

        {/* 🔥 MOBILE DRAWER */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div className="fixed inset-0 bg-black/50 z-50">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="w-full max-w-md h-full bg-[#0F0F11]"
              >
                <div className="p-6 border-b border-white/[0.1] flex items-center">
                  <button onClick={() => setMobileFiltersOpen(false)}>
                    <ChevronLeft />
                  </button>
                  <h3 className="ml-3 text-white text-lg">Filters</h3>
                </div>

                <div className="p-6">
                  <ProductFilters />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
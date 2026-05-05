import React, { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Filter as FilterIcon, Search, ChevronDown } from "lucide-react";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import { useFilter } from "../context/FilterContext";

const CATEGORIES = [
  "party", "daily", "traditional", "western", "statement", "bridal"
];

const sortOptions = [
  { value: "", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Highest Rated" },
  { value: "-createdAt", label: "Newest First" },
];

export default function Shop() {
  const { filters, apiParams, updateFilter, clearFilters, activeFilterCount } = useFilter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  // Fetch products
  const fetchProducts = useCallback(async (append = false, nextPage = 1) => {
    try {
      setLoading(!append);
      setLoadingMore(append);
      setError(null);
      const params = { ...apiParams, page: nextPage };
      const res = await productAPI.getProducts(params);
      const newProducts = res.data?.data || [];
      setProducts(append ? [...products, ...newProducts] : newProducts);
      setHasMore(newProducts.length > 0 && newProducts.length === 20); // Assume pageSize=20
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [apiParams, products]);

  // Initial load + filter changes
  useEffect(() => {
    fetchProducts(false, 1);
  }, [apiParams, fetchProducts]);

  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      fetchProducts(true, filters.page + 1);
    }
  }, [inView, hasMore, loadingMore, fetchProducts, filters.page]);

  // Filter chips
  const activeFilters = [
    filters.category && { key: 'category', label: `Category: ${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}`, value: filters.category },
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) && { key: 'price', label: `₹${filters.priceRange[0].toLocaleString()} - ₹${filters.priceRange[1].toLocaleString()}`, value: filters.priceRange },
    filters.rating > 0 && { key: 'rating', label: `${filters.rating}+ Stars`, value: filters.rating },
    filters.sort && { key: 'sort', label: sortOptions.find(o => o.value === filters.sort)?.label, value: filters.sort },
  ].filter(Boolean);

  const removeFilter = (chipKey, chipValue) => {
    if (chipKey === 'price') {
      updateFilter('priceRange', [0, 50000]);
    } else if (chipKey === 'category') {
      updateFilter('category', '');
    } else if (chipKey === 'rating') {
      updateFilter('rating', 0);
    } else if (chipKey === 'sort') {
      updateFilter('sort', '');
    }
  };

  if (loading) return <SkeletonGrid count={16} className="py-32" />;

  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden py-12">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#D4A853]/10 blur-[140px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-[#D4A53]/5 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-5xl md:text-7xl font-bold mb-12 bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-transparent"
        >
          Luxury Jewellery
        </motion.h1>

        {/* Filter Summary Chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 rounded-3xl bg-white/[0.05] border border-white/[0.1] backdrop-blur-xl"
            >
              <div className="flex flex-wrap gap-2 items-center">
                {activeFilters.map((chip, i) => (
                  <motion.button
                    key={`${chip.key}-${i}`}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={() => removeFilter(chip.key, chip.value)}
                    className="group flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.15] backdrop-blur-sm border border-white/[0.2] text-zinc-300 hover:bg-white/[0.25] hover:border-[#D4A53]/50 transition-all text-sm font-medium"
                  >
                    {chip.label}
                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </motion.button>
                ))}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-zinc-400 hover:text-zinc-200 font-medium"
                >
                  Clear all ({activeFilterCount})
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-80 lg:flex-shrink-0 hidden lg:block"
          >
            <ProductFilters />
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Products */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[60vh]">
              {products.length === 0 ? (
                <EmptyState title="No products match your filters" />
              ) : (
                products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <ProductCard product={product} index={i} />
                  </motion.div>
                ))
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={ref} className="h-20 flex items-center justify-center">
              {loadingMore && <SkeletonGrid count={4} />}
            </div>

            {error && (
              <div className="text-center py-12 text-zinc-400">
                {error}. <button onClick={() => fetchProducts(false, 1)} className="text-[#D4A53] hover:underline font-medium">Retry</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Button */}
        <motion.div
          className="lg:hidden fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#D4A53] to-amber-500 text-black shadow-2xl flex items-center justify-center shadow-[#D4A53]/40 hover:shadow-[#D4A53]/60"
          >
            <FilterIcon className="w-6 h-6" />
            {activeFilterCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {activeFilterCount}
              </motion.div>
            )}
          </button>
        </motion.div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[99] bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', bounce: 0 }}
                className="w-full max-w-md h-full bg-[#0F0F11] border-l border-white/[0.1] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/[0.1]">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 rounded-xl bg-white/[0.1] hover:bg-white/[0.2]"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h3 className="text-xl font-bold text-white">Filters</h3>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="ml-auto text-sm text-zinc-400 hover:text-zinc-200">
                        Clear ({activeFilterCount})
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6 overflow-auto pb-32">
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


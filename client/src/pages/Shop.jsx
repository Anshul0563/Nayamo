import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [rating, setRating] = useState(
    Number(searchParams.get("rating") || 0)
  );

  const [showFilters, setShowFilters] = useState(false);
  const [showPrice, setShowPrice] = useState(false);

  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);

  // ================= FETCH =================
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };

      if (category) params.category = category;
      if (search) params.search = search;
      if (priceRange[0] > 0) params.priceMin = priceRange[0];
      if (priceRange[1] < 50000) params.priceMax = priceRange[1];
      if (rating > 0) params.rating = rating;

      const res = await productAPI.getProducts(params);

      setProducts(res.data?.data || []);
      setPagination(res.data?.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, priceRange, rating, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ================= PARAM =================
  const updateParam = (key, value) => {
    const sp = new URLSearchParams(searchParams);
    value ? sp.set(key, value) : sp.delete(key);
    sp.set("page", "1");
    setSearchParams(sp);
  };

  const clearFilters = () => {
    setSearch("");
    setPriceRange([0, 50000]);
    setRating(0);
    setSearchParams({});
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden">

      {/* 🔥 Background */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#D4A853]/10 blur-[140px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-[#D4A853]/5 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">

        {/* 🔥 Header */}
        <h1 className="text-center text-4xl md:text-6xl font-semibold mb-10 
        bg-gradient-to-r from-white via-[#D4A853] to-white 
        bg-clip-text text-transparent">
          Luxury Collection
        </h1>

        {/* 🔥 Search + Buttons */}
        <div className="flex items-center gap-3 max-w-xl mx-auto mb-10">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/[0.03] 
              border border-white/[0.08] text-white 
              focus:outline-none focus:border-[#D4A853]/40"
            />
          </div>

          {/* Filters Button */}
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              setShowPrice(false);
            }}
            className="px-4 py-3 rounded-full bg-[#0F0F11] border border-white/[0.08] text-zinc-300"
          >
            Filters
          </button>

          {/* Price Button */}
          <button
            onClick={() => {
              setShowPrice(!showPrice);
              setShowFilters(false);
            }}
            className="px-4 py-3 rounded-full bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/30"
          >
            Price
          </button>
        </div>

        {/* 🔥 Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ProductFilters
                showFilters={true}
                category={category}
                updateParam={updateParam}
                rating={rating}
                setRating={setRating}
                clearFilters={clearFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔥 Price Panel */}
        <AnimatePresence>
          {showPrice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08]"
            >
              <div className="flex flex-col gap-4">

                <span className="text-sm text-zinc-400">Price Range</span>

                <input
                  type="range"
                  min="0"
                  max="50000"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setPriceRange([0, value]);
                    updateParam("priceMax", value);
                  }}
                  className="w-full accent-[#D4A853]"
                />

                <div className="text-xs text-zinc-400">
                  ₹0 — ₹{priceRange[1].toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔥 Products */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}

        {/* 🔥 Pagination */}
        <div className="flex justify-center gap-3 mt-16">
          <button
            onClick={() => updateParam("page", page - 1)}
            disabled={page <= 1}
            className="w-10 h-10 rounded-xl bg-white/[0.04]"
          >
            <ChevronLeft />
          </button>

          <button className="w-10 h-10 rounded-xl bg-[#D4A853] text-black font-bold">
            {page}
          </button>

          <button
            onClick={() => updateParam("page", page + 1)}
            className="w-10 h-10 rounded-xl bg-white/[0.04]"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
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
  const [sortFilter, setSortFilter] = useState("");

  const [showFilters, setShowFilters] = useState(true);

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
      if (sortFilter) params.sort = sortFilter;

      const res = await productAPI.getProducts(params);

      setProducts(res.data?.data || []);
      setPagination(
        res.data?.pagination || { currentPage: 1, totalPages: 1 }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, search, priceRange, rating, sortFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ================= PARAM HANDLER =================
  const updateParam = (key, value) => {
    const sp = new URLSearchParams(searchParams);
    value ? sp.set(key, value) : sp.delete(key);
    sp.set("page", "1");
    setSearchParams(sp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParam("search", search);
  };

  const clearFilters = () => {
    setSearch("");
    setPriceRange([0, 50000]);
    setRating(0);
    setSortFilter("");
    setSearchParams({});
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden">

      {/* 🔥 Background Gradient */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#D4A853]/10 blur-[140px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-[#D4A853]/5 blur-[120px] bottom-[-100px] right-[-100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">

        {/* 🔥 Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight 
          bg-gradient-to-r from-white via-[#D4A853] to-white 
          bg-clip-text text-transparent">
            Luxury Collection
          </h1>

          <p className="text-zinc-400 mt-3">
            Discover elegance crafted with perfection
          </p>
        </motion.div>

        {/* 🔥 Search */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white/[0.03] 
              border border-white/[0.08] text-white 
              focus:outline-none focus:border-[#D4A853]/40 backdrop-blur-lg"
            />
          </div>
        </form>

        {/* 🔥 Filters */}
        <ProductFilters
          showFilters={showFilters}
          category={category}
          updateParam={updateParam}
          rating={rating}
          setRating={setRating}
          clearFilters={clearFilters}
        />

        {/* 🔥 Products */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -6 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* 🔥 Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-16">

            <button
              onClick={() => updateParam("page", page - 1)}
              disabled={page <= 1}
              className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08]"
            >
              <ChevronLeft />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam("page", p)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium ${
                    p === page
                      ? "bg-[#D4A853] text-black"
                      : "bg-white/[0.04] text-zinc-400"
                  }`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => updateParam("page", page + 1)}
              disabled={page >= pagination.totalPages}
              className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08]"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
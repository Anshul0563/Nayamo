import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import logo from "../assets/logo.png";

const categories = [
  { value: "party", label: "Party Wear", icon: "🎭" },
  { value: "daily", label: "Daily Wear", icon: "✨" },
  { value: "traditional", label: "Traditional", icon: "🪔" },
  { value: "western", label: "Western", icon: "💎" },
  { value: "statement", label: "Statement", icon: "👑" },
  { value: "bridal", label: "Bridal", icon: "💍" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filter states - managed by ProductFilters via props
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [rating, setRating] = useState(0);
  const [sortFilter, setSortFilter] = useState("");

  const category = searchParams.get("category") || "";
  const ratingParam = Number(searchParams.get("rating") || 0);
  const priceMin = Number(searchParams.get("priceMin") || 0);
  const priceMax = Number(searchParams.get("priceMax") || 50000);
  const page = Number(searchParams.get("page") || 1);

  // Sync URL params to state
  useEffect(() => {
    setRating(ratingParam);
    setPriceRange([priceMin, priceMax]);
    setSortFilter(searchParams.get("sort") || "");
  }, [ratingParam, priceMin, priceMax, searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (category) params.category = category;
      if (sortFilter) params.sort = sortFilter;
      if (search) params.search = search;
      if (priceRange[0] > 0) params.priceMin = priceRange[0];
      if (priceRange[1] < 50000) params.priceMax = priceRange[1];
      if (rating > 0) params.rating = rating;

      const res = await productAPI.getProducts(params);
      setProducts(res.data?.data || []);
      setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1 });
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [category, sortFilter, search, priceRange, rating, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const sp = new URLSearchParams(searchParams);
    if (value) {
      sp.set(key, value);
    } else {
      sp.delete(key);
    }
    sp.set("page", "1");
    setSearchParams(sp);
  };

  const pageTitle = category ? categories.find((c) => c.value === category)?.label || category : "Luxury Jewellery";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <motion.section className="relative py-20 mb-16 text-center text-white" 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4">
          <motion.div className="mb-8" whileHover={{ scale: 1.05 }}>
            <img src={logo} alt="Nayamo" className="mx-auto h-20 w-20 shadow-2xl drop-shadow-2xl" />
          </motion.div>
          <motion.h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-nayamo-gold to-white bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {pageTitle} Collection
          </motion.h1>
          <motion.p className="text-xl text-zinc-300 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Handcrafted luxury earrings for every occasion
          </motion.p>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ProductFilters - Always visible horizontal bar */}
        <ProductFilters
          category={category}
          updateParam={updateParam}
          search={search}
          setSearch={setSearch}
          rating={rating}
          setRating={setRating}
          clearFilters={() => {
            setSearch("");
            setPriceRange([0, 50000]);
            setRating(0);
            setSortFilter("");
            updateParam("category", "");
            updateParam("rating", "");
            updateParam("priceMin", "");
            updateParam("priceMax", "");
            updateParam("sort", "");
          }}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortFilter={sortFilter}
          setSortFilter={setSortFilter}
        />

        {/* Products Grid */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No Jewellery Found"
            description="Try adjusting your filters or search for different styles."
            type="filter"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <motion.button
              onClick={() => updateParam("page", (page - 1).toString())}
              disabled={page <= 1}
              className="p-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl shadow-lg flex items-center justify-center w-12 h-12"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <motion.button
                key={p}
                onClick={() => updateParam("page", p.toString())}
                className={`w-12 h-12 rounded-xl font-semibold transition-all flex items-center justify-center shadow-lg ${
                  p === page
                    ? "bg-nayamo-gold text-black shadow-nayamo-gold/50"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:shadow-xl"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p}
              </motion.button>
            ))}

            <motion.button
              onClick={() => updateParam("page", (page + 1).toString())}
              disabled={page >= pagination.totalPages}
              className="p-3 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl shadow-lg flex items-center justify-center w-12 h-12"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}


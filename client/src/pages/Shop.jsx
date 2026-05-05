import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import logo from "../assets/logo.png";

const categories = [
  { value: "party", label: "Party Wear" },
  { value: "daily", label: "Daily Wear" },
  { value: "traditional", label: "Traditional" },
  { value: "western", label: "Western" },
  { value: "statement", label: "Statement" },
  { value: "bridal", label: "Bridal" },
];

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
  const [rating, setRating] = useState(0);
  const [sortFilter, setSortFilter] = useState("");

  const category = searchParams.get("category") || "";
  const ratingParam = Number(searchParams.get("rating") || 0);
  const priceMin = Number(searchParams.get("priceMin") || 0);
  const priceMax = Number(searchParams.get("priceMax") || 50000);
  const page = Number(searchParams.get("page") || 1);

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
      console.error("Fetch error:", err);
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

  const pageTitle = category
    ? categories.find((c) => c.value === category)?.label || category
    : "Luxury Jewellery";

  // 🔥 ONLY UI CHANGES — LOGIC SAME

  return (
    <div className="min-h-screen bg-[#050506] relative overflow-hidden">
      {/* 🔥 BACKGROUND DEPTH */}
      <div className="absolute inset-0">
        <div className="absolute w-[600px] h-[600px] bg-[#D4A853]/10 blur-[120px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[500px] h-[500px] bg-[#D4A853]/5 blur-[100px] bottom-[-100px] right-[-100px]" />
      </div>

      {/* 🔥 HEADER */}
      <motion.section
        className="relative py-24 text-center z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.img
          src={logo}
          className="mx-auto w-20 mb-6 drop-shadow-[0_10px_40px_rgba(212,168,83,0.5)]"
          whileHover={{ scale: 1.08 }}
        />

        <motion.h1
          className="text-5xl md:text-7xl font-serif font-bold tracking-tight 
        bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-transparent"
        >
          {pageTitle} Collection
        </motion.h1>

        <motion.p className="text-zinc-400 mt-4 text-lg font-light">
          Crafted for timeless elegance
        </motion.p>
      </motion.section>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
        {/* 🔥 SEARCH BAR (GLASS + DEPTH) */}
        <motion.div className="relative max-w-xl mx-auto mb-10">
          <div className="absolute inset-0 bg-[#D4A853]/10 blur-xl rounded-full opacity-30" />

          <div
            className="relative flex items-center px-5 py-3 rounded-full 
        bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] 
        focus-within:border-[#D4A853]/50 transition-all"
          >
            <Search className="text-zinc-500 w-5 mr-3" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="bg-transparent w-full text-white outline-none placeholder-zinc-500"
            />
          </div>
        </motion.div>

        {/* 🔥 FILTER BAR */}
        <ProductFilters
          category={category}
          updateParam={updateParam}
          search={search}
          setSearch={setSearch}
          rating={rating}
          setRating={setRating}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortFilter={sortFilter}
          setSortFilter={setSortFilter}
          clearFilters={() => {
            setSearch("");
            setPriceRange([0, 50000]);
            setRating(0);
            setSortFilter("");
            setSearchParams({});
          }}
        />

        {/* 🔥 PRODUCTS */}
        {loading ? (
          <SkeletonGrid count={12} />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -10 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* 🔥 PAGINATION (CLEAN GOLD ACCENT) */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-16">
            <motion.button
              onClick={() => updateParam("page", page - 1)}
              disabled={page <= 1}
              className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
              whileHover={{ scale: 1.1 }}
            >
              <ChevronLeft />
            </motion.button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <motion.button
                  key={p}
                  onClick={() => updateParam("page", p)}
                  className={`w-12 h-12 rounded-xl font-semibold transition ${
                    p === page
                      ? "bg-[#D4A853] text-black shadow-[0_0_15px_rgba(212,168,83,0.4)]"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {p}
                </motion.button>
              ),
            )}

            <motion.button
              onClick={() => updateParam("page", page + 1)}
              disabled={page >= pagination.totalPages}
              className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white"
              whileHover={{ scale: 1.1 }}
            >
              <ChevronRight />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

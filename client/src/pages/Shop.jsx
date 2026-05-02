import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProducts({
          page,
          category,
          search,
        });
        setProducts(res.data?.data || []);
        setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, page, search]);

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

  return (
    <div className="bg-[#070708] text-white min-h-screen">

      {/* 🔥 HERO */}
      <div className="py-14 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,192,203,0.08),transparent_70%)]" />

        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-200 via-white to-[#D4A853] bg-clip-text text-transparent">
          Discover Your Shine ✨
        </h1>

        <p className="text-zinc-400 mt-3">
          Handpicked jewellery for every beautiful moment
        </p>
      </div>

      <div className="nayamo-container">

        {/* 🔍 SEARCH + FILTER BTN */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jewellery..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#111] border border-white/10 focus:border-pink-400 outline-none"
            />
          </form>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-4 rounded-xl border border-white/10 bg-[#111] hover:border-pink-400 flex items-center gap-2"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        {/* 🎯 FILTER PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() =>
                    updateParam("category", category === c.value ? "" : c.value)
                  }
                  className={`px-5 py-2 rounded-full text-sm transition ${
                    category === c.value
                      ? "bg-gradient-to-r from-pink-400 to-[#D4A853] text-black"
                      : "bg-[#111] border border-white/10 hover:border-pink-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🛍 PRODUCTS */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>

            {/* 📄 PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-14">
                <button
                  disabled={page <= 1}
                  onClick={() => updateParam("page", page - 1)}
                  className="p-3 bg-[#111] rounded-xl border border-white/10"
                >
                  <ChevronLeft />
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateParam("page", p)}
                    className={`w-10 h-10 rounded-xl ${
                      p === page
                        ? "bg-gradient-to-r from-pink-400 to-[#D4A853] text-black"
                        : "bg-[#111] border border-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => updateParam("page", page + 1)}
                  className="p-3 bg-[#111] rounded-xl border border-white/10"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
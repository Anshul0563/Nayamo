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
        const params = { page, category, sort, search };
        const res = await productAPI.getProducts(params);
        setProducts(res.data?.data || []);
        setPagination(res.data?.pagination || { currentPage: 1, totalPages: 1 });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category, sort, page, search]);

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

      {/* 🔥 HERO SECTION */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        
        <img
          src="/images/hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />

        <div className="absolute inset-0 bg-black/60" />

        {/* glow */}
        <div className="absolute w-[500px] h-[500px] bg-[#D4A853]/20 blur-[120px] top-[-100px] left-[-100px]" />
        <div className="absolute w-[400px] h-[400px] bg-[#D4A5A5]/10 blur-[100px] bottom-[-100px] right-[-100px]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold">
            Luxury That Speaks
          </h1>
          <p className="text-zinc-300 mt-4 text-lg">
            Crafted for elegance. Designed for you.
          </p>
        </motion.div>
      </div>

      <div className="nayamo-container py-16">

        {/* 🔍 SEARCH */}
        <form onSubmit={handleSearch} className="mb-10 relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search luxury jewellery..."
            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#111] border border-white/10 focus:border-[#D4A853] outline-none"
          />
        </form>

        {/* 🛍 PRODUCTS */}
        {loading ? (
          <SkeletonGrid count={8} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>

            {/* 📄 PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-16">
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
                        ? "bg-[#D4A853] text-black"
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
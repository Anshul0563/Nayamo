import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
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
        const params = { page };
        if (category) params.category = category;
        if (sort) params.sort = sort;
        if (search) params.search = search;
        const res = await productAPI.getProducts(params);
        setProducts(res.data?.data?.products || []);
        setPagination(res.data?.data?.pagination || { currentPage: 1, totalPages: 1 });
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="bg-[#0F0F0F] border-b border-white/[0.06]">
        <div className="nayamo-container py-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {pageTitle}
          </h1>
          <p className="text-[#9CA3AF]">
            {category
              ? `Exquisite ${category} earrings crafted to perfection`
              : "Discover handcrafted earrings for every occasion"}
          </p>
        </div>
      </div>

      <div className="nayamo-container py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search earrings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="nayamo-input pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          </form>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl border font-medium text-sm flex items-center gap-2 transition-colors ${
                showFilters
                  ? "border-[#D4A853] text-[#D4A853] bg-[#D4A853]/10"
                  : "border-white/[0.08] text-[#9CA3AF] bg-[#1A1A1C] hover:bg-[#1E1E22]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="appearance-none px-4 py-2.5 pr-10 rounded-xl border border-white/[0.08] bg-[#1A1A1C] text-sm font-medium text-[#E8E8E8] focus:border-[#D4A853]/40 outline-none"
              >
                <option value="">Sort By</option>
                <option value="newest">Newest</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="nayamo-card p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-[#E8E8E8]">Category:</span>
              {["party", "daily", "traditional", "western", "statement", "bridal"].map((c) => (
                <button
                  key={c}
                  onClick={() => updateParam("category", category === c ? "" : c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === c
                      ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#0A0A0A]"
                      : "bg-[#1A1A1C] text-[#9CA3AF] hover:bg-[#242428] border border-white/[0.06]"
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
              {(category || search) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-[#D4A5A5] hover:text-[#E8C4C4] ml-auto"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={6} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => updateParam("page", String(page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-white/[0.08] bg-[#1A1A1C] disabled:opacity-40 hover:bg-[#242428] text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-[#9CA3AF] font-medium px-3">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => updateParam("page", String(page + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-2 rounded-lg border border-white/[0.08] bg-[#1A1A1C] disabled:opacity-40 hover:bg-[#242428] text-white"
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


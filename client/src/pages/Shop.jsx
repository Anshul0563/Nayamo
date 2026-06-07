import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Gem,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { SkeletonGrid } from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import StateFeedback from "../components/common/StateFeedback";
import logo from "../assets/logo.png";
import {
  getPaginationFromResponse,
  getProductsFromResponse,
} from "../utils/apiResponse";
import { getApiErrorMessage } from "../utils/errorMessage";

const categories = [
  { value: "party", label: "Party Wear" },
  { value: "daily", label: "Daily Wear" },
  { value: "traditional", label: "Traditional" },
  { value: "western", label: "Western" },
  { value: "statement", label: "Statement" },
  { value: "bridal", label: "Bridal" },
];

const ratings = [4, 3, 2];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const stagger = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const productReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [rating, setRating] = useState(0);
  const [sortFilter, setSortFilter] = useState("");

  const category = searchParams.get("category") || "";
  const ratingParam = Number(searchParams.get("rating") || 0);
  const priceMin = Number(searchParams.get("min") || searchParams.get("priceMin") || 0);
  const priceMax = Number(searchParams.get("max") || searchParams.get("priceMax") || 50000);
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    setRating(ratingParam);
    setPriceRange([priceMin, priceMax]);
    setSortFilter(searchParams.get("sort") || "");
  }, [ratingParam, priceMin, priceMax, searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (category) params.category = category;
      if (sortFilter) params.sort = sortFilter;
      if (search) params.search = search;
      if (priceRange[0] > 0) params.min = priceRange[0];
      if (priceRange[1] < 50000) params.max = priceRange[1];
      if (rating > 0) params.rating = rating;

      const res = await productAPI.getProducts(params);
      setProducts(getProductsFromResponse(res.data));
      setPagination(getPaginationFromResponse(res.data));
    } catch (err) {
      setProducts([]);
      setPagination({ currentPage: 1, totalPages: 1 });
      setError(getApiErrorMessage(err, "Failed to load products"));
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

    if (key !== "page") {
      sp.set("page", "1");
    }

    setSearchParams(sp);
  };

  const clearFilters = () => {
    const sp = new URLSearchParams(searchParams);
    ["category", "rating", "min", "max", "priceMin", "priceMax", "sort", "search"].forEach(
      (key) => sp.delete(key),
    );
    sp.set("page", "1");

    setSearch("");
    setPriceRange([0, 50000]);
    setRating(0);
    setSortFilter("");
    setSearchParams(sp);
  };

  const activeCategory = categories.find((item) => item.value === category);
  const pageTitle = activeCategory?.label || "Luxury Jewellery";
  const hasActiveFilters =
    Boolean(category) ||
    rating > 0 ||
    Boolean(search) ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    Boolean(sortFilter);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060607] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(212,168,83,0.18),rgba(212,168,83,0.045)_34%,transparent_66%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4A853]/50 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-32 h-80 w-px bg-gradient-to-b from-transparent via-[#D4A853]/20 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-32 h-80 w-px bg-gradient-to-b from-transparent via-[#D4A853]/20 to-transparent" />

      <motion.header
        className="relative mx-auto max-w-6xl px-4 pb-10 pt-20 text-center sm:px-6 sm:pb-14 sm:pt-24 lg:pt-28"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="mb-7 flex justify-center">
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#D4A853]/20 bg-white/[0.035] shadow-[0_0_54px_rgba(212,168,83,0.24)] backdrop-blur-xl"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <span className="absolute inset-2 rounded-full border border-white/[0.05]" />
            <img
              src={logo}
              alt="Nayamo"
              className="h-14 w-14 object-contain drop-shadow-[0_10px_28px_rgba(212,168,83,0.3)]"
            />
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#D4A853]/18 bg-[#D4A853]/8 px-4 py-2 text-xs font-medium uppercase tracking-normal text-[#D4A853]"
        >
          <Gem className="h-3.5 w-3.5" />
          Curated Fine Jewellery
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mx-auto mb-6 max-w-5xl bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-4xl font-semibold leading-[1.03] tracking-normal text-transparent sm:text-6xl lg:text-7xl"
        >
          {pageTitle} Collection
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto max-w-2xl text-base font-light leading-8 tracking-normal text-zinc-300 sm:text-lg"
        >
          Sculptural earrings and refined essentials, selected for luminous
          evenings, rituals, and everyday polish.
        </motion.p>
      </motion.header>

      <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.section
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mx-auto mb-5 max-w-2xl">
            <div className="relative rounded-full border border-white/[0.10] bg-white/[0.045] shadow-[0_18px_70px_rgba(0,0,0,0.36)] backdrop-blur-xl transition-all duration-300 focus-within:border-[#D4A853]/55 focus-within:shadow-[0_18px_70px_rgba(212,168,83,0.14)]">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#D4A853]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search luxury jewellery"
                className="h-14 w-full rounded-full bg-transparent pl-14 pr-6 text-sm text-white outline-none placeholder:text-zinc-500 sm:text-base"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-[2rem] border border-white/[0.08] bg-[#0F0F11]/80 px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 md:flex-nowrap md:gap-3 lg:overflow-visible">
                <span className="mr-2 hidden sm:inline-flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-[#D4A853]" />
                  Category
                </span>

                <div className="flex flex-wrap gap-2 md:gap-2 lg:gap-3 -order-1 md:order-none flex-1 min-w-0">
                  {categories.map((item) => {
                    const active = category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          updateParam("category", active ? "" : item.value)
                        }
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition-all duration-300 flex-shrink-0 sm:px-4 sm:text-sm ${
                          active
                            ? "border-[#D4A853] bg-[#D4A853] text-[#060607] shadow-[0_10px_30px_rgba(212,168,83,0.18)]"
                            : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <span className="mr-2 text-xs font-medium uppercase tracking-normal text-zinc-500">
                  Rating
                </span>

                {ratings.map((value) => {
                  const active = rating === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setRating(active ? 0 : value);
                        updateParam("rating", active ? "" : value.toString());
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-300 sm:text-sm ${
                        active
                          ? "border-[#D4A853] bg-[#D4A853] text-[#060607] shadow-[0_10px_30px_rgba(212,168,83,0.18)]"
                          : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                      }`}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          active ? "fill-[#060607]" : "fill-transparent"
                        }`}
                      />
                      {value} & up
                    </button>
                  );
                })}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/25 bg-[#D4A853]/10 px-3.5 py-2 text-xs font-medium text-[#D4A853] transition-all duration-300 hover:border-[#D4A853]/45 hover:bg-[#D4A853]/15 hover:text-[#F0D78C] sm:text-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {loading ? (
          <SkeletonGrid count={12} />
        ) : error ? (
          <StateFeedback
            type="network"
            title="Products could not load"
            description={error}
            actionText="Retry"
            onAction={fetchProducts}
            loading={loading}
          />
        ) : products.length === 0 ? (
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <EmptyState
              title="No Jewellery Found"
              description="Try adjusting your filters or search for different styles."
              type="filter"
            />
          </motion.div>
        ) : (
          <motion.section
            className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {products.map((product) => (
              <motion.div
                key={product._id}
                variants={productReveal}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.section>
        )}

        {pagination.totalPages > 1 && (
          <motion.nav
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-label="Pagination"
          >
            <motion.button
              type="button"
              aria-label="Previous page"
              onClick={() => updateParam("page", (page - 1).toString())}
              disabled={page <= 1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <motion.button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === page ? "page" : undefined}
                  onClick={() => updateParam("page", pageNumber.toString())}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    pageNumber === page
                      ? "bg-[#D4A853] text-[#060607] shadow-[0_12px_34px_rgba(212,168,83,0.24)]"
                      : "border border-white/[0.10] bg-white/[0.035] text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.24)] hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {pageNumber}
                </motion.button>
              ),
            )}

            <motion.button
              type="button"
              aria-label="Next page"
              onClick={() => updateParam("page", (page + 1).toString())}
              disabled={page >= pagination.totalPages}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.nav>
        )}
      </main>
    </div>
  );
}

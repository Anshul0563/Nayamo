import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gem,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import EmptyState from "../components/common/EmptyState";
import { SkeletonGrid } from "../components/common/Loader";
import StateFeedback from "../components/common/StateFeedback";
import ProductCard from "../components/product/ProductCard";
import SEO from "../components/SEO";
import { jewelleryLabel } from "../config/jewelleryCategories";
import { productAPI } from "../services/api";
import {
  getPaginationFromResponse,
  getProductsFromResponse,
} from "../utils/apiResponse";
import { getApiErrorMessage } from "../utils/errorMessage";

// Wear-type categories (existing `category` field) — kept unchanged.
const categories = [
  { value: "party", label: "Party Wear" },
  { value: "daily", label: "Daily Wear" },
  { value: "traditional", label: "Traditional" },
  { value: "western", label: "Western" },
  { value: "statement", label: "Statement" },
  { value: "bridal", label: "Bridal" },
];

const ratings = [4, 3, 2];

const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "newest", label: "New Arrivals" },
  { value: "best-seller", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating" },
];

const PRICE_BANDS = [
  { label: "Under ₹499", min: 0, max: 499 },
  { label: "₹500 – ₹999", min: 500, max: 999 },
  { label: "₹1,000 – ₹1,499", min: 1000, max: 1499 },
  { label: "₹1,500+", min: 1500, max: 50000 },
];

const DEFAULT_MAX = 50000;

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

const parseNumber = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const FILTER_KEYS = {
  category: "category",
  jewelleryType: "jewelleryType",
  legacyJewelleryType: "jewellerytype",
  sort: "sort",
  search: "search",
  rating: "rating",
  min: "min",
  max: "max",
  page: "page",
};

const getQueryValue = (params, key, fallbackKey) => {
  const value = params.get(key) ?? (fallbackKey ? params.get(fallbackKey) : null);
  return value ? String(value).trim() : "";
};

const normalizeFilterValue = (value) =>
  value ? String(value).trim().toLowerCase() : "";

const getQueryNumber = (params, key, fallback) =>
  parseNumber(params.get(key), fallback);

const setQueryValue = (params, key, value) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value === "number" && Number.isNaN(value))
  ) {
    params.delete(key);
    return;
  }

  params.set(key, String(value));
};

const createQueryParams = (searchParams, overrides = {}, resetPage = true) => {
  const params = new URLSearchParams(searchParams);

  Object.entries(overrides).forEach(([key, value]) => {
    setQueryValue(params, key, value);

    if (key === FILTER_KEYS.jewelleryType) {
      params.delete(FILTER_KEYS.legacyJewelleryType);
    }
  });

  if (resetPage && overrides.page === undefined) {
    params.set(FILTER_KEYS.page, "1");
  }

  return params;
};

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestSeqRef = useRef(0);

  const [search, setSearch] = useState(() =>
    getQueryValue(searchParams, FILTER_KEYS.search),
  );
  const [priceRange, setPriceRange] = useState(() => [
    getQueryNumber(searchParams, FILTER_KEYS.min, 0),
    getQueryNumber(searchParams, FILTER_KEYS.max, DEFAULT_MAX),
  ]);
  const [rating, setRating] = useState(() =>
    getQueryNumber(searchParams, FILTER_KEYS.rating, 0),
  );
  const [sortFilter, setSortFilter] = useState(() =>
    getQueryValue(searchParams, FILTER_KEYS.sort),
  );

  const queryFilters = useMemo(() => {
    const category = normalizeFilterValue(
      getQueryValue(searchParams, FILTER_KEYS.category),
    );
    const jewelleryType = normalizeFilterValue(
      getQueryValue(
        searchParams,
        FILTER_KEYS.jewelleryType,
        FILTER_KEYS.legacyJewelleryType,
      ),
    );
    const sortParam = normalizeFilterValue(
      getQueryValue(searchParams, FILTER_KEYS.sort),
    );
    const searchParam = getQueryValue(searchParams, FILTER_KEYS.search);
    const ratingParam = getQueryNumber(searchParams, FILTER_KEYS.rating, 0);
    const priceMin = getQueryNumber(
      searchParams,
      FILTER_KEYS.min,
      parseNumber(searchParams.get("priceMin"), 0),
    );
    const priceMax = getQueryNumber(
      searchParams,
      FILTER_KEYS.max,
      parseNumber(searchParams.get("priceMax"), DEFAULT_MAX),
    );
    const page = parseNumber(searchParams.get(FILTER_KEYS.page), 1);

    return {
      category,
      jewelleryType,
      sortParam,
      searchParam,
      ratingParam,
      priceMin,
      priceMax,
      page,
    };
  }, [searchParams]);

  useEffect(() => {
    setSearch(queryFilters.searchParam);
    setRating(queryFilters.ratingParam);
    setPriceRange([queryFilters.priceMin, queryFilters.priceMax]);
    setSortFilter(queryFilters.sortParam);
  }, [
    queryFilters.searchParam,
    queryFilters.ratingParam,
    queryFilters.priceMin,
    queryFilters.priceMax,
    queryFilters.sortParam,
  ]);

  useEffect(() => {
    const legacyValue = getQueryValue(
      searchParams,
      FILTER_KEYS.legacyJewelleryType,
    );
    const currentValue = getQueryValue(
      searchParams,
      FILTER_KEYS.jewelleryType,
    );

    if (legacyValue && currentValue !== legacyValue) {
      const params = new URLSearchParams(searchParams);
      params.delete(FILTER_KEYS.legacyJewelleryType);
      params.set(FILTER_KEYS.jewelleryType, currentValue || legacyValue);
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchProducts = useCallback(async () => {
    const params = {};
    if (queryFilters.category) params.category = queryFilters.category;
    if (queryFilters.jewelleryType) params.jewelleryType = queryFilters.jewelleryType;
    if (queryFilters.sortParam) params.sort = queryFilters.sortParam;
    if (queryFilters.searchParam) params.search = queryFilters.searchParam;
    if (queryFilters.priceMin > 0) params.min = queryFilters.priceMin;
    if (queryFilters.priceMax < DEFAULT_MAX) params.max = queryFilters.priceMax;
    if (queryFilters.ratingParam > 0) params.rating = queryFilters.ratingParam;
    if (queryFilters.page > 1) params.page = queryFilters.page;

    const requestId = ++requestSeqRef.current;
    setLoading(true);
    setError("");
    // Dev debug: log outgoing params and current URL search for tracing
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[Shop] fetchProducts start", {
        requestId,
        urlSearch: String(searchParams),
        apiParams: params,
        queryFilters,
      });
    }

    try {
      const res = await productAPI.getProducts(params);
      if (requestId !== requestSeqRef.current) return;
      setProducts(getProductsFromResponse(res.data) || []);
      setPagination(getPaginationFromResponse(res.data));
    } catch (err) {
      if (requestId !== requestSeqRef.current) return;
      setProducts([]);
      setPagination({ currentPage: 1, totalPages: 1, totalItems: 0 });
      setError(getApiErrorMessage(err, "Failed to load products"));
    } finally {
      if (requestId === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [queryFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateSearchParams = (overrides, resetPage = true) => {
    const params = createQueryParams(searchParams, overrides, resetPage);
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    [
      FILTER_KEYS.category,
      FILTER_KEYS.jewelleryType,
      FILTER_KEYS.legacyJewelleryType,
      FILTER_KEYS.rating,
      FILTER_KEYS.min,
      FILTER_KEYS.max,
      "priceMin",
      "priceMax",
      FILTER_KEYS.sort,
      FILTER_KEYS.search,
      FILTER_KEYS.page,
    ].forEach((key) => params.delete(key));

    setSearch("");
    setPriceRange([0, DEFAULT_MAX]);
    setRating(0);
    setSortFilter("");
    setSearchParams(params);
  };

  const activeCategory = categories.find(
    (item) => item.value === queryFilters.category,
  );
  const activeJewelleryLabel = jewelleryLabel(queryFilters.jewelleryType);

  const baseCollectionLabel =
    activeJewelleryLabel || activeCategory?.label || "";
  const pageTitle = baseCollectionLabel || "Luxury Jewellery";

  const subtitle = activeJewelleryLabel
    ? `Curated ${activeJewelleryLabel.toLowerCase()} crafted for luminous evenings, rituals, and everyday polish.`
    : activeCategory
      ? `Curated ${activeCategory.label.toLowerCase()} wear selected for any occasion.`
      : "Sculptural earrings and refined essentials, selected for luminous evenings, rituals, and everyday polish.";

  const productCount = pagination.totalItems ?? products.length;

  const hasActiveFilters =
    Boolean(queryFilters.category) ||
    Boolean(queryFilters.jewelleryType) ||
    queryFilters.ratingParam > 0 ||
    Boolean(queryFilters.searchParam) ||
    queryFilters.priceMin > 0 ||
    queryFilters.priceMax < DEFAULT_MAX ||
    Boolean(queryFilters.sortParam);

  const applyPriceBand = (band) => {
    setPriceRange([band.min, band.max]);
    const params = createQueryParams(
      searchParams,
      {
        min: band.min > 0 ? band.min : "",
        max: band.max < DEFAULT_MAX ? band.max : "",
      },
      true,
    );
    setSearchParams(params);
  };

  const applyCustomPrice = () => {
    updateSearchParams({
      [FILTER_KEYS.min]: priceRange[0] > 0 ? priceRange[0] : "",
      [FILTER_KEYS.max]: priceRange[1] < DEFAULT_MAX ? priceRange[1] : "",
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060607] text-white">
      <SEO
        title={
          baseCollectionLabel
            ? `${baseCollectionLabel} | Nayamo`
            : "Shop Luxury Jewellery | Nayamo"
        }
        description={subtitle}
      />

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
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#D4A853]/50 bg-[#0b0907] p-1.5 shadow-[0_0_0_3px_rgba(255,255,255,0.08),0_0_54px_rgba(212,168,83,0.32)]"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <span className="absolute inset-2 rounded-full border border-white/[0.05]" />
            <img
              src={logo}
              alt="Nayamo"
              className="relative z-10 h-full w-full rounded-full object-cover drop-shadow-[0_10px_28px_rgba(212,168,83,0.45)]"
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
          {subtitle}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateSearchParams({ search: e.target.value });
                  }
                }}
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
                    const active = queryFilters.category === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          updateSearchParams({
                            category: active ? "" : item.value,
                          })
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
                        updateSearchParams({
                          rating: active ? "" : value.toString(),
                        });
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
              </div>
            </div>

            {/* SORT + PRICE + CLEAR */}
            <div className="mt-4 flex flex-col gap-4 border-t border-white/[0.06] pt-4 md:flex-row md:flex-wrap md:items-center md:justify-between">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-normal text-zinc-500">
                  <Sparkles className="h-3.5 w-3.5 text-[#D4A853]" />
                  Sort
                </span>
                <div className="relative">
                  <select
                    value={sortFilter}
                    onChange={(e) =>
                      updateSearchParams({ sort: e.target.value })
                    }
                    aria-label="Sort products"
                    className="h-10 appearance-none rounded-full border border-white/[0.08] bg-white/[0.035] pl-4 pr-9 text-xs font-medium text-zinc-200 outline-none transition-all duration-300 hover:border-[#D4A853]/35 focus:border-[#D4A853]/55 sm:text-sm"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-[#0F0F11] text-zinc-100"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4A853]" />
                </div>
              </div>

              {/* Price bands + custom */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-normal text-zinc-500">
                  Price
                </span>

                {PRICE_BANDS.map((band) => {
                  const active =
                    priceRange[0] === band.min && priceRange[1] === band.max;
                  return (
                    <button
                      key={band.label}
                      type="button"
                      onClick={() => applyPriceBand(band)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                        active
                          ? "border-[#D4A853] bg-[#D4A853] text-[#060607]"
                          : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                      }`}
                    >
                      {band.label}
                    </button>
                  );
                })}

                {/* Custom min/max */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={priceRange[0] || ""}
                    onChange={(e) =>
                      setPriceRange([
                        parseNumber(e.target.value, 0),
                        priceRange[1],
                      ])
                    }
                    className="h-9 w-20 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#D4A853]/55"
                  />
                  <span className="text-zinc-600">–</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={priceRange[1] === DEFAULT_MAX ? "" : priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([
                        priceRange[0],
                        parseNumber(e.target.value, DEFAULT_MAX),
                      ])
                    }
                    className="h-9 w-20 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#D4A853]/55"
                  />
                  <button
                    type="button"
                    onClick={applyCustomPrice}
                    className="h-9 rounded-full bg-[#D4A853] px-3 text-xs font-semibold text-[#060607] transition-all hover:bg-[#F0D78C]"
                  >
                    Apply
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/25 bg-[#D4A853]/10 px-3.5 py-2 text-xs font-medium text-[#D4A853] transition-all duration-300 hover:border-[#D4A853]/45 hover:bg-[#D4A853]/15 hover:text-[#F0D78C] sm:text-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Result meta */}
          {!loading && !error && (
            <motion.div
              variants={fadeUp}
              className="mt-5 flex items-center justify-between px-1 text-sm"
            >
              <p className="text-zinc-400">
                {pageTitle}
                {queryFilters.jewelleryType && (
                  <span className="text-[#D4A853]">
                    {" "}
                    · {jewelleryLabel(queryFilters.jewelleryType)}
                  </span>
                )}
              </p>
              <p className="text-zinc-500">
                <span className="font-semibold text-white">{productCount}</span>{" "}
                {productCount === 1 ? "product" : "products"}
              </p>
            </motion.div>
          )}
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
              type="filter"
              title="No Products Found"
              description={`No ${activeJewelleryLabel || ""}${
                activeJewelleryLabel ? " " : ""
              }jewellery matches your current filters. Try adjusting or clearing them.`}
            />
            <div className="flex justify-center gap-3 pb-10">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/10 px-5 py-2.5 text-sm font-semibold text-[#D4A853] transition-all hover:bg-[#D4A853]/20"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Filters
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
              >
                <Gem className="h-4 w-4" />
                View All Jewellery
              </button>
            </div>
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

        {!loading &&
          !error &&
          products.length > 0 &&
          pagination.totalPages > 1 && (
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
                onClick={() =>
                  updateSearchParams({ page: queryFilters.page - 1 }, false)
                }
                disabled={queryFilters.page <= 1}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.button>

              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((pageNumber) => (
                <motion.button
                  key={pageNumber}
                  type="button"
                  aria-current={pageNumber === queryFilters.page ? "page" : undefined}
                  onClick={() =>
                    updateSearchParams({ page: pageNumber }, false)
                  }
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                    pageNumber === queryFilters.page
                      ? "bg-[#D4A853] text-[#060607] shadow-[0_12px_34px_rgba(212,168,83,0.24)]"
                      : "border border-white/[0.10] bg-white/[0.035] text-zinc-300 shadow-[0_14px_40px_rgba(0,0,0,0.24)] hover:border-[#D4A853]/40 hover:bg-[#D4A853]/10 hover:text-white"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {pageNumber}
                </motion.button>
              ))}

              <motion.button
                type="button"
                aria-label="Next page"
                onClick={() =>
                  updateSearchParams({ page: queryFilters.page + 1 }, false)
                }
                disabled={queryFilters.page >= pagination.totalPages}
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

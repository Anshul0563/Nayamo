import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Star,
  Minus,
  Plus,
  MessageSquare,
  Sparkles,
  Gem,
  Award,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { productAPI, reviewAPI } from "../services/api";

import logo from "../assets/logo.png";

import Loader from "../components/common/Loader";

import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

export default function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);

  const [added, setAdded] = useState(false);

  const [qty, setQty] = useState(1);

  // Reviews
  const [reviews, setReviews] = useState([]);

  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewStats, setReviewStats] = useState({
    avgRating: 0,
    total: 0,
  });

  const [showReviewForm, setShowReviewForm] = useState(false);

  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });

  const [submittingReview, setSubmittingReview] = useState(false);

  const [reviewError, setReviewError] = useState("");

  // Fetch Reviews
  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);

      const res = await reviewAPI.getProductReviews(id, {
        page: 1,
        limit: 10,
      });

      setReviews(res.data?.data || []);

      const data = res.data;

      if (data?.stats) {
        setReviewStats({
          avgRating: data.stats.avgRating || 0,
          total: data.pagination?.totalItems || 0,
        });
      }
    } catch (_err) {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // Fetch Product + reset scroll to top when arriving (fix mobile redirect to bottom)
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }

    const fetch = async () => {
      setLoading(true);

      try {
        const res = await productAPI.getProductById(id);

        setProduct(res.data?.data);

        setSelectedImage(0);

        setQty(1);

        await fetchReviews();
      } catch (_err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id, fetchReviews]);

  const liked = product ? isInWishlist(product._id) : false;

  const handleWishlist = () => {
    if (!product) return;

    liked ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product._id, qty);

    setAdded(true);

    setTimeout(() => setAdded(false), 2000);
  };

  // Submit Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");

      return;
    }

    const comment = newReview.comment.trim();

    if (!comment) {
      setReviewError("Comment is required");

      return;
    }

    const payload = {
      title:
        newReview.title.trim() || comment.substring(0, 30) || "User Review",

      rating: Number(newReview.rating),

      comment,
    };

    try {
      setSubmittingReview(true);

      setReviewError("");

      await reviewAPI.submitReview(id, payload);

      setNewReview({
        rating: 5,
        title: "",
        comment: "",
      });

      setShowReviewForm(false);

      const prodRes = await productAPI.getProductById(id);

      if (prodRes.data?.data) {
        setProduct(prodRes.data.data);
      }

      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getImageUrl = (p, idx = 0) => {
    if (!p) return "";

    const img = p.images?.[idx];

    return (
      img?.url ||
      img ||
      "https://placehold.co/600x600/131316/D4A853?text=Nayamo+Earrings"
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  // Not Found
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Earring Not Found
          </h2>

          <Link to="/shop" className="text-[#D4A853] hover:underline">
            Browse all earrings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${product.title} | Nayamo`}
        description={
          product.description || "Luxury handcrafted jewellery by Nayamo"
        }
        image={product.images?.[0]?.url}
        url={`https://nayamo.in/product/${product._id}`}
      />
      <div className="min-h-screen overflow-hidden bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708]">
        {/* BG */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,83,0.05),transparent_50%)]" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,165,165,0.03),transparent_50%)]" />

        <div className="relative nayamo-container overflow-hidden px-4 sm:px-0 py-6 sm:py-12">
          {/* Breadcrumb */}
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="mb-8 sm:mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="w-full sm:w-fit flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl text-sm sm:text-base text-zinc-300 hover:text-white hover:border-[#D4A853]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
              whileHover={{
                scale: 1.03,
                x: -2,
              }}
              whileTap={{
                scale: 0.95,
              }}
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />

              <span className="font-medium">Back to Collection</span>
            </motion.button>

            <motion.div
              className="hidden sm:flex items-center gap-2 text-sm text-zinc-400"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                delay: 0.3,
              }}
            >
              <Link to="/" className="hover:text-[#D4A853] transition-colors">
                Home
              </Link>

              <span>/</span>

              <Link
                to="/shop"
                className="hover:text-[#D4A853] transition-colors"
              >
                Shop
              </Link>

              <span>/</span>

              <span className="text-white">{product.name}</span>
            </motion.div>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-14 sm:mb-20">
            {/* LEFT */}
            <motion.div
              initial={{
                opacity: 0,
                x: -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
              }}
            >
              <div className="relative">
                {/* LOGO */}
                <motion.div
                  className="absolute top-3 right-3 sm:-top-4 sm:-right-4 z-10"
                  initial={{
                    scale: 0,
                    rotate: -180,
                  }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    delay: 0.5,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  <motion.img
                    src={logo}
                    alt="Nayamo"
                    className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-[0_12px_40px_rgba(212,168,83,0.4)]"
                    whileHover={{
                      scale: 1.1,
                    }}
                  />
                </motion.div>

                {/* IMAGE */}
                <div className="group relative aspect-square overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0A0A0C] to-[#070708] shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/10 via-transparent to-[#D4A5A5]/10 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  <motion.img
                    key={selectedImage}
                    src={getImageUrl(product, selectedImage)}
                    alt={product.title}
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    width={600}
                    height={600}
                    style={{ objectFit: "cover" }}
                    initial={{
                      scale: 1.1,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.7,
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>
              </div>

              {/* THUMBNAILS */}
              {product.images?.length > 1 && (
                <motion.div
                  className="mt-5 sm:mt-8 flex gap-3 sm:gap-4 overflow-x-auto pb-2"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.3,
                  }}
                >
                  {product.images.map((img, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative min-w-[72px] w-[72px] h-[72px] sm:w-20 sm:h-20 overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                        selectedImage === i
                          ? "border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.4)] ring-2 ring-[#D4A853]/20"
                          : "border-white/[0.12] hover:border-[#D4A853]/60"
                      }`}
                      whileHover={{
                        scale: 1.08,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                    >
                      <img
                        src={img?.url || img}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* RIGHT */}
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
            >
              {/* CATEGORY */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <div className="inline-flex items-center gap-2 rounded-2xl border border-[#D4A853]/30 bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 px-4 py-2 text-sm font-semibold text-white">
                  <Gem className="h-4 w-4 text-[#D4A853]" />

                  {product.category || "Luxury Earrings"}
                </div>
              </motion.div>

              {/* TITLE */}
              <motion.h1
                className="bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-transparent"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {product.title ||
                  product.name ||
                  "Exquisite Handcrafted Earrings"}
              </motion.h1>

              {/* RATING */}
              {(product.ratings?.count > 0 || reviewStats.total > 0) && (
                <motion.div
                  className="flex flex-wrap items-center gap-4"
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i <
                          Math.floor(
                            product.ratings?.average || reviewStats.avgRating,
                          )
                            ? "fill-[#D4A853] text-[#D4A853]"
                            : "fill-zinc-600 text-zinc-600"
                        }`}
                      />
                    ))}

                    <span className="ml-2 text-lg font-bold text-white">
                      {(
                        product.ratings?.average || reviewStats.avgRating
                      ).toFixed(1)}
                    </span>
                  </div>

                  <span className="text-zinc-400">
                    ({product.ratings?.count || reviewStats.total} reviews)
                  </span>
                </motion.div>
              )}

              {/* PRICE */}
              <motion.div
                className="flex flex-wrap items-center gap-4"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <span className="bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] bg-clip-text text-3xl sm:text-4xl font-bold text-transparent">
                  ₹{product.price?.toLocaleString("en-IN")}
                </span>

                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-lg sm:text-xl text-zinc-500 line-through">
                      ₹{product.originalPrice?.toLocaleString("en-IN")}
                    </span>
                  )}
              </motion.div>

              {/* DESC */}
              <motion.p
                className="text-base sm:text-lg leading-relaxed text-zinc-300"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {product.description ||
                  "Experience unparalleled craftsmanship with our handcrafted luxury earrings."}
              </motion.p>

              {/* QTY */}
              <motion.div
                className="space-y-6"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <span className="text-sm font-semibold text-zinc-300">
                    Quantity:
                  </span>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/40"
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                    >
                      <Minus className="h-5 w-5 text-zinc-300" />
                    </motion.button>

                    <span className="w-16 text-center text-lg font-bold text-white">
                      {qty}
                    </span>

                    <motion.button
                      onClick={() => setQty(qty + 1)}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/40"
                      whileHover={{
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.9,
                      }}
                    >
                      <Plus className="h-5 w-5 text-zinc-300" />
                    </motion.button>
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={added}
                    className="group relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] px-6 sm:px-8 py-4 sm:py-5 text-lg font-bold text-black shadow-[0_12px_40px_rgba(212,168,83,0.4)] transition-all duration-500 hover:shadow-[0_16px_60px_rgba(212,168,83,0.5)]"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                    <div className="relative flex items-center justify-center gap-3">
                      <ShoppingBag className="h-6 w-6" />

                      {added ? "Added to Cart!" : "Add to Cart"}

                      <Sparkles className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={handleWishlist}
                    className={`flex h-14 sm:h-16 w-full sm:w-16 items-center justify-center rounded-3xl border-2 backdrop-blur-xl transition-all duration-500 ${
                      liked
                        ? "border-[#D4A5A5]/50 bg-gradient-to-br from-[#D4A5A5] via-[#C48888] to-[#D4A5A5]"
                        : "border-white/[0.15] bg-white/[0.02]"
                    }`}
                    whileHover={{
                      scale: 1.08,
                    }}
                    whileTap={{
                      scale: 0.9,
                    }}
                  >
                    <Heart
                      className={`h-6 w-6 ${
                        liked ? "fill-white text-white" : "text-zinc-300"
                      }`}
                    />
                  </motion.button>
                </div>
              </motion.div>

              {/* TRUST */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.08] pt-8"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >
                {[
                  {
                    icon: Shield,
                    label: "Authentic",
                    desc: "100% Genuine",
                  },

                  {
                    icon: Truck,
                    label: "Free Shipping",
                    desc: "All Orders",
                  },

                  {
                    icon: RotateCcw,
                    label: "Easy Returns",
                    desc: "30 Days",
                  },

                  {
                    icon: Award,
                    label: "Premium Quality",
                    desc: "Handcrafted",
                  },
                ].map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-xl"
                    whileHover={{
                      scale: 1.03,
                    }}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 1 + index * 0.1,
                    }}
                  >
                    <badge.icon className="h-6 w-6 text-[#D4A853]" />

                    <div>
                      <div className="text-sm font-bold text-white">
                        {badge.label}
                      </div>

                      <div className="text-xs text-zinc-400">{badge.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* REVIEWS */}
          <motion.section
            className="mb-14 sm:mb-20 border-t border-white/[0.08] pt-10 sm:pt-14"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#D4A853]/30 bg-[#D4A853]/10 px-4 py-2 text-sm font-semibold text-[#F0D78C]">
                  <MessageSquare className="h-4 w-4" />
                  Customer Reviews
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Loved by Nayamo customers
                </h2>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-zinc-400">
                  Read honest notes from buyers, or share your experience after
                  signing in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate("/login", {
                      state: { from: { pathname: `/product/${id}` } },
                    });
                    return;
                  }
                  setShowReviewForm((value) => !value);
                  setReviewError("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#D4A853] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#F0D78C]"
              >
                <Star className="h-4 w-4 fill-black" />
                Write a Review
              </button>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div className="text-5xl font-bold text-white">
                  {Number(
                    product.ratings?.average || reviewStats.avgRating || 0,
                  ).toFixed(1)}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i <
                        Math.round(
                          product.ratings?.average ||
                            reviewStats.avgRating ||
                            0,
                        )
                          ? "fill-[#D4A853] text-[#D4A853]"
                          : "text-zinc-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  Based on {product.ratings?.count || reviewStats.total || 0}{" "}
                  approved reviews.
                </p>
              </div>

              <div className="space-y-5">
                <AnimatePresence>
                  {showReviewForm && (
                    <motion.form
                      onSubmit={handleSubmitReview}
                      className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-bold text-white">
                          Share your review
                        </h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const ratingValue = i + 1;
                            return (
                              <button
                                key={ratingValue}
                                type="button"
                                onClick={() =>
                                  setNewReview((current) => ({
                                    ...current,
                                    rating: ratingValue,
                                  }))
                                }
                                className="p-1"
                                aria-label={`${ratingValue} star rating`}
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    ratingValue <= Number(newReview.rating)
                                      ? "fill-[#D4A853] text-[#D4A853]"
                                      : "text-zinc-600"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <input
                        value={newReview.title}
                        onChange={(e) =>
                          setNewReview((current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        placeholder="Review title"
                        className="mb-3 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#D4A853]/60"
                        maxLength={120}
                      />
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview((current) => ({
                            ...current,
                            comment: e.target.value,
                          }))
                        }
                        placeholder="Tell us what you liked, how it looked, and how it felt to wear."
                        className="min-h-32 w-full resize-y rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-[#D4A853]/60"
                        maxLength={2000}
                        required
                      />

                      {reviewError && (
                        <p className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                          {reviewError}
                        </p>
                      )}

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="rounded-2xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="rounded-2xl bg-[#D4A853] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#F0D78C] disabled:opacity-50"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
                      <Loader size={28} />
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
                      <MessageSquare className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                      <p className="font-semibold text-white">No reviews yet</p>
                      <p className="mt-1 text-sm text-zinc-400">
                        Be the first to review this piece.
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <article
                        key={review._id}
                        className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#D4A853]/15 text-sm font-bold text-[#F0D78C]">
                              {(review.user?.name || "N")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {review.user?.name || "Nayamo Customer"}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-[#D4A853] text-[#D4A853]"
                                    : "text-zinc-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h3 className="mt-4 text-base font-bold text-white">
                            {review.title}
                          </h3>
                        )}
                        <p className="mt-2 leading-relaxed text-zinc-300">
                          {review.comment}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}

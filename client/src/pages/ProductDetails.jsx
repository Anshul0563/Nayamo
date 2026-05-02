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
  User,
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
import ProductCard from "../components/product/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, total: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Fetch reviews for this product
  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await reviewAPI.getProductReviews(id, { page: 1, limit: 10 });
      setReviews(res.data?.data || []);
      // Calculate stats from returned data
      const data = res.data;
      if (data?.stats) {
        setReviewStats({
          avgRating: data.stats.avgRating || 0,
          total: data.pagination?.totalItems || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProductById(id);
        setProduct(res.data?.data);
        setSelectedImage(0);
        setQty(1);
        const relRes = await productAPI.getProducts({
          category: res.data?.data?.category,
          page: 1,
        });
        setRelated(
          (relRes.data?.data?.products || [])
            .filter((p) => p._id !== id)
            .slice(0, 4),
        );
        // Fetch reviews after product loads
        await fetchReviews();
      } catch (err) {
        console.error("Product detail error:", err);
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

  // Submit review handler
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
      title: comment.substring(0, 30) || "User Review",
      rating: Number(newReview.rating),
      comment,
    };

    try {
      setSubmittingReview(true);
      setReviewError("");

      await reviewAPI.submitReview(id, payload);

      setNewReview({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      await fetchReviews();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Helper: format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper: Get image URL
  const getImageUrl = (p, idx = 0) => {
    if (!p) return "";
    const img = p.images?.[idx];
    return (
      img?.url ||
      img ||
      "https://placehold.co/600x600/131316/D4A853?text=Nayamo+Earrings"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708] flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-[#070708] via-[#0A0A0C] to-[#070708]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,83,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,165,165,0.03),transparent_50%)] pointer-events-none" />

      <div className="relative nayamo-container py-12">
        {/* Premium Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 px-6 py-3 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl text-zinc-300 hover:text-white hover:border-[#D4A853]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Collection</span>
          </motion.button>

          <motion.div
            className="flex items-center gap-2 text-sm text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/" className="hover:text-[#D4A853] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-[#D4A853] transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Premium Images Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              {/* Luxury Badge */}
              <motion.div
                className="absolute -top-4 -right-4 z-10"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <motion.img
                  src={logo}
                  alt="Nayamo Premium"
                  className="h-16 w-16 drop-shadow-[0_12px_40px_rgba(212,168,83,0.4)]"
                  whileHover={{ scale: 1.15 }}
                />
              </motion.div>

              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#0A0A0C] to-[#070708] border border-white/[0.08] shadow-2xl group">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/10 via-transparent to-[#D4A5A5]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <motion.img
                  key={selectedImage}
                  src={getImageUrl(product, selectedImage)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {product.images?.length > 1 && (
              <motion.div
                className="flex gap-4 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {product.images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
                      selectedImage === i
                        ? "border-[#D4A853] shadow-[0_0_20px_rgba(212,168,83,0.4)] ring-2 ring-[#D4A853]/20"
                        : "border-white/[0.12] hover:border-[#D4A853]/60 hover:shadow-[0_0_16px_rgba(212,168,83,0.3)]"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <img
                      src={img?.url || img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {selectedImage === i && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Premium Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Category Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30 text-sm font-semibold text-white">
                <Gem className="w-4 h-4 text-[#D4A853]" />
                {product.category || "Luxury Earrings"}
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#D4A853] to-white bg-clip-text text-transparent leading-tight">
                {product.name}
              </h1>
            </motion.div>

            {/* Rating */}
            {reviewStats.total > 0 && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(reviewStats.avgRating)
                          ? "fill-[#D4A853] text-[#D4A853]"
                          : "fill-zinc-600 text-zinc-600"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-bold text-white ml-2">
                    {reviewStats.avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-zinc-400">
                  ({reviewStats.total} reviews)
                </span>
              </motion.div>
            )}

            {/* Price */}
            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-4xl font-bold bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] bg-clip-text text-transparent">
                ₹{product.price?.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-zinc-500 line-through">
                  ₹{product.originalPrice?.toLocaleString("en-IN")}
                </span>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="prose prose-invert max-w-none"
            >
              <p className="text-zinc-300 text-lg leading-relaxed">
                {product.description || "Experience unparalleled craftsmanship with our handcrafted luxury earrings. Each piece is meticulously designed to complement your unique style and elevate any occasion."}
              </p>
            </motion.div>

            {/* Quantity & Actions */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-zinc-300">Quantity:</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex items-center justify-center hover:border-[#D4A853]/40 hover:bg-white/[0.06] transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus className="w-5 h-5 text-zinc-300" />
                  </motion.button>
                  <span className="w-16 text-center text-lg font-bold text-white">{qty}</span>
                  <motion.button
                    onClick={() => setQty(qty + 1)}
                    className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex items-center justify-center hover:border-[#D4A853]/40 hover:bg-white/[0.06] transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus className="w-5 h-5 text-zinc-300" />
                  </motion.button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={added}
                  className="flex-1 relative py-5 px-8 rounded-3xl bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black font-bold text-lg shadow-[0_12px_40px_rgba(212,168,83,0.4)] hover:shadow-[0_16px_60px_rgba(212,168,83,0.5)] transition-all duration-500 overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative flex items-center justify-center gap-3">
                    <ShoppingBag className="w-6 h-6" />
                    {added ? "Added to Cart!" : "Add to Cart"}
                    <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>

                <motion.button
                  onClick={handleWishlist}
                  className={`w-16 h-16 rounded-3xl border-2 backdrop-blur-xl flex items-center justify-center shadow-xl transition-all duration-500 ${
                    liked
                      ? "bg-gradient-to-br from-[#D4A5A5] via-[#C48888] to-[#D4A5A5] border-[#D4A5A5]/50 shadow-[0_8px_32px_rgba(212,165,165,0.4)]"
                      : "bg-white/[0.02] border-white/[0.15] hover:border-[#D4A5A5]/40 hover:bg-white/[0.06] hover:shadow-[0_8px_32px_rgba(212,165,165,0.3)]"
                  }`}
                  whileHover={{ scale: 1.1, rotate: liked ? 360 : 0 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-300 ${
                      liked ? "text-white fill-white scale-110" : "text-zinc-300 group-hover:text-[#D4A5A5]"
                    }`}
                  />
                </motion.button>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              className="grid grid-cols-2 gap-4 pt-8 border-t border-white/[0.08]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              {[
                { icon: Shield, label: "Authentic", desc: "100% Genuine" },
                { icon: Truck, label: "Free Shipping", desc: "All Orders" },
                { icon: RotateCcw, label: "Easy Returns", desc: "30 Days" },
                { icon: Award, label: "Premium Quality", desc: "Handcrafted" },
              ].map((badge, index) => (
                <motion.div
                  key={badge.label}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  <badge.icon className="w-6 h-6 text-[#D4A853]" />
                  <div>
                    <div className="text-sm font-bold text-white">{badge.label}</div>
                    <div className="text-xs text-zinc-400">{badge.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          className="border-t border-white/[0.08] pt-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
          </div>

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl"
              >
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="text-2xl"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= newReview.rating
                                ? "fill-[#D4A853] text-[#D4A853]"
                                : "text-zinc-600"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-white placeholder-zinc-500 focus:border-[#D4A853]/60 outline-none resize-none"
                      rows={4}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>

                  {reviewError && (
                    <div className="text-red-400 text-sm">{reviewError}</div>
                  )}

                  <div className="flex gap-4">
                    <motion.button
                      type="submit"
                      disabled={submittingReview}
                      className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] text-white font-semibold hover:shadow-[0_8px_32px_rgba(212,168,83,0.3)] transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-8 py-4 rounded-2xl border border-white/[0.15] text-zinc-300 hover:border-white/[0.3] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews List */}
          <div className="space-y-6 mb-8">
            {reviewsLoading ? (
              <div className="text-center py-8">
                <Loader size={30} />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400 mb-2">No reviews yet</h3>
                <p className="text-zinc-500">Be the first to share your experience!</p>
              </div>
            ) : (
              reviews.map((review, index) => (
                <motion.div
                  key={review._id}
                  className="p-6 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white">{review.user?.name || "Anonymous"}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-[#D4A853] text-[#D4A853]"
                                  : "text-zinc-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-zinc-500">{formatDate(review.createdAt)}</span>
                      </div>
                      <p className="text-zinc-300">{review.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Write Review Button */}
          {isAuthenticated && !showReviewForm && (
            <motion.button
              onClick={() => setShowReviewForm(true)}
              className="px-8 py-4 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl text-zinc-300 hover:text-white hover:border-[#D4A853]/40 transition-all duration-500 hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Write a Review
            </motion.button>
          )}
        </motion.div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.div
            className="border-t border-white/[0.08] pt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A5A5] to-[#D4A853] shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">You Might Also Like</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((product, i) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

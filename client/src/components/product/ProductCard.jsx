import React from "react";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import SafeImage from "../common/SafeImage";

const PLACEHOLDER_IMAGE = "/placeholder.jpg";

const getProductImage = (product) =>
  product.images?.[0]?.url ||
  product.images?.[0] ||
  product.image ||
  PLACEHOLDER_IMAGE;

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const productId = product._id || product.id;
  const title = product.title || product.name || "Exquisite Jewellery";
  const inWishlist = isInWishlist(productId);
  const ratingAverage = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.34,
        delay: Math.min(index * 0.04, 0.24),
        ease: "easeOut",
      }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0F0F11]/80 shadow-[0_14px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/35 hover:shadow-[0_18px_54px_rgba(212,168,83,0.14)] sm:rounded-3xl">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#070708]">
          <Link to={`/product/${productId}`} className="block h-full w-full">
            <SafeImage
              src={getProductImage(product)}
              alt={title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060607]/78 via-transparent to-transparent opacity-80" />
          </Link>

          {discount > 0 && (
            <div className="absolute left-2 top-2 rounded-full border border-[#D4A853]/35 bg-[#D4A853] px-2.5 py-1 text-[10px] font-bold text-[#060607] shadow-[0_8px_24px_rgba(212,168,83,0.24)] sm:left-3 sm:top-3 sm:text-xs">
              {discount}% OFF
            </div>
          )}

          <div className="absolute right-2 top-2 flex flex-col gap-2 sm:right-3 sm:top-3">
            <button
              type="button"
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-all duration-300 sm:h-10 sm:w-10 ${
                inWishlist
                  ? "border-[#D4A5A5]/50 bg-[#D4A5A5] text-white"
                  : "border-white/[0.14] bg-black/35 text-white hover:border-[#D4A5A5]/45 hover:bg-[#D4A5A5]/20"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? "fill-white" : ""}`}
              />
            </button>

            <Link
              to={`/product/${productId}`}
              aria-label="View product"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/[0.14] bg-black/35 text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-[#D4A853]/45 hover:bg-[#D4A853]/15 sm:flex"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(productId);
            }}
            className="absolute bottom-2 left-2 right-2 flex h-10 items-center justify-center gap-2 rounded-full bg-[#D4A853] text-xs font-bold text-[#060607] shadow-[0_12px_34px_rgba(212,168,83,0.28)] transition-all duration-300 hover:bg-[#F0D78C] sm:bottom-3 sm:left-3 sm:right-3 sm:h-11 sm:text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden min-[380px]:inline">Add to Cart</span>
            <span className="min-[380px]:hidden">Add</span>
          </button>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          {product.category && (
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-normal text-[#D4A853] sm:text-xs">
              {product.category}
            </p>
          )}

          <h3 className="mb-2 line-clamp-2 min-h-[2.4rem] text-sm font-semibold leading-5 text-white transition-colors duration-300 group-hover:text-[#D4A853] sm:min-h-[3rem] sm:text-lg sm:leading-6">
            <Link to={`/product/${productId}`}>{title}</Link>
          </h3>

          <div className="mt-auto">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-base font-bold text-[#D4A853] sm:text-xl">
                ₹{product.price?.toLocaleString("en-IN") || "0"}
              </span>
              {discount > 0 && (
                <span className="text-xs text-zinc-500 line-through sm:text-sm">
                  ₹{product.originalPrice?.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                      i < Math.floor(ratingAverage)
                        ? "fill-[#D4A853] text-[#D4A853]"
                        : "text-zinc-650"
                    }`}
                  />
                ))}
              </div>
              {ratingCount > 0 ? (
                <span>
                  {ratingAverage.toFixed(1)} ({ratingCount})
                </span>
              ) : (
                <span>No reviews</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

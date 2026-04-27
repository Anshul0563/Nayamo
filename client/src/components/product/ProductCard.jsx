import React from "react";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product._id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group nayamo-card">
        {/* Image Area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#0E0E10]">
          <Link to={`/product/${product._id}`} className="block w-full h-full">
            <img
              src={
                product.images?.[0] ||
                product.image ||
                "/placeholder.jpg"
              }
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
            {/* Vignette overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/70 via-[#070708]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708] shadow-[0_4px_12px_rgba(212,168,83,0.35)]">
              {discount}% OFF
            </div>
          )}

          {/* Action Buttons - slide in from right */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-14 group-hover:translate-x-0 transition-transform duration-500 ease-out">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                inWishlist
                  ? "bg-gradient-to-br from-[#D4A5A5] to-[#C48888]"
                  : "bg-[#131316]/80 backdrop-blur-md hover:bg-[#D4A5A5]/20 border border-white/[0.06]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  inWishlist
                    ? "text-white fill-white"
                    : "text-white"
                }`}
              />
            </button>
            <Link
              to={`/product/${product._id}`}
              className="w-9 h-9 rounded-full bg-[#131316]/80 backdrop-blur-md flex items-center justify-center hover:bg-[#D4A853]/20 transition-all duration-300 border border-white/[0.06]"
            >
              <Eye className="w-4 h-4 text-white" />
            </Link>
          </div>

          {/* Quick Add Button - slides up */}
          <div className="absolute bottom-4 left-4 right-4 translate-y-16 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708] shadow-[0_8px_24px_rgba(212,168,83,0.35)] flex items-center justify-center gap-2 hover:shadow-[0_12px_36px_rgba(212,168,83,0.45)] transition-shadow duration-300"
            >
              <ShoppingBag className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-white group-hover:text-[#D4A853] transition-colors duration-300 line-clamp-1 mb-1.5">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          {product.category && (
            <p className="text-[11px] text-[#71717A] uppercase tracking-widest mb-2.5">
              {product.category}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="text-base font-bold nayamo-text-gold">
              Rs {product.price?.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <span className="text-sm text-[#52525B] line-through">
                Rs {product.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


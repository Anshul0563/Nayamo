import React from "react";
import { Heart, ShoppingBag, Eye, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product._id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="relative bg-white/[0.02] border border-white/[0.08] rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(212,168,83,0.15)] transition-all duration-700 hover:border-[#D4A853]/30">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/5 via-transparent to-[#D4A5A5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Image Area */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#0A0A0C] to-[#070708]">
          <Link to={`/product/${product._id}`} className="block w-full h-full">
            <motion.img
              src={
                product.images?.[0]?.url ||
                product.images?.[0] ||
                product.image ||
                "/placeholder.jpg"
              }
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Luxury Vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-[#070708]/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/10 via-transparent to-[#D4A5A5]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>

          {/* Premium Badge */}
          <motion.div
            className="absolute top-4 left-4 flex items-center gap-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
          >
<div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] via-[#FFD700] to-[#D4A853] shadow-[0_8px_24px_rgba(212,168,83,0.4)] ring-1 ring-white/20">
              <motion.img src={logo} alt="Crown" className="w-4 h-4 object-contain" whileHover={{ scale: 1.1 }} />
            </div>
            {discount > 0 && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.15 + 0.5 }}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black shadow-[0_6px_20px_rgba(212,168,83,0.4)] border border-[#D4A853]/50"
              >
                {discount}% OFF
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons - Elegant slide animation */}
          <motion.div
            className="absolute top-4 right-4 flex flex-col gap-3"
            initial={{ x: 60, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.15 + 0.4, duration: 0.6 }}
          >
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 overflow-hidden ${
                inWishlist
                  ? "bg-gradient-to-br from-[#D4A5A5] via-[#C48888] to-[#D4A5A5] shadow-[0_8px_32px_rgba(212,165,165,0.4)]"
                  : "bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] hover:bg-white/[0.15] hover:border-[#D4A5A5]/40 hover:shadow-[0_8px_32px_rgba(212,165,165,0.3)]"
              }`}
              whileHover={{ scale: 1.1, rotate: inWishlist ? 360 : 0 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  inWishlist ? "text-white fill-white scale-110" : "text-white group-hover:text-[#D4A5A5]"
                }`}
              />
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={`/product/${product._id}`}
                className="w-11 h-11 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] flex items-center justify-center hover:bg-white/[0.15] hover:border-[#D4A853]/40 transition-all duration-500 shadow-xl hover:shadow-[0_8px_32px_rgba(212,168,83,0.3)]"
              >
                <Eye className="w-5 h-5 text-white group-hover:text-[#D4A853] transition-colors" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Luxury Quick Add Button */}
          <motion.div
            className="absolute bottom-6 left-6 right-6"
            initial={{ y: 80, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.15 + 0.6, duration: 0.6 }}
          >
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="w-full py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black shadow-[0_12px_40px_rgba(212,168,83,0.4)] flex items-center justify-center gap-3 hover:shadow-[0_16px_60px_rgba(212,168,83,0.5)] transition-all duration-500 border-2 border-[#D4A853]/50 overflow-hidden relative group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <ShoppingBag className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Add to Cart</span>
              <Sparkles className="w-4 h-4 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </motion.div>
        </div>

        {/* Premium Info Section */}
        <div className="p-6 bg-gradient-to-b from-transparent to-white/[0.02]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 + 0.8, duration: 0.5 }}
          >
            <h3 className="text-lg font-bold text-white group-hover:text-[#D4A853] transition-colors duration-500 line-clamp-2 mb-2 leading-tight">
              <Link to={`/product/${product._id}`} className="hover:underline decoration-[#D4A853]/50 underline-offset-4">
                {product.name}
              </Link>
            </h3>

            {product.category && (
              <motion.div
                className="flex items-center gap-2 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.15 + 1 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">
                  {product.category}
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-xl font-bold bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] bg-clip-text text-transparent"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.15 + 1.2, type: "spring", stiffness: 200 }}
                >
                  ₹{product.price?.toLocaleString("en-IN")}
                </motion.span>
                {discount > 0 && (
                  <motion.span
                    className="text-sm text-zinc-500 line-through"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 + 1.4 }}
                  >
                    ₹{product.originalPrice?.toLocaleString("en-IN")}
                  </motion.span>
                )}
              </div>
            </div>

{/* Enhanced Rating Display - Always show if ratings exist */}
            {product.ratings?.count > 0 && (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 + 1.6, duration: 0.4 }}
              >
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.ratings.average || 0)
                          ? "fill-[#D4A853] text-[#D4A853]"
                          : "fill-zinc-600 text-zinc-600"
                      }`}
                      viewBox="0 0 20 20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.15 + 1.6 + i * 0.1 }}
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.645L.197 6.015l6.695-.972L10 0l3.108 5.043 6.695.972-5.046 5.43 1.123 6.645z" />
                    </motion.svg>
                  ))}
                </div>
                <span className="text-sm text-zinc-400 font-medium">
                  {product.ratings.average?.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500">
                  ({product.ratings.count})
                </span>
              </motion.div>
            )}
            {/* Show "No reviews" when count is 0 */}
            {(!product.ratings?.count || product.ratings.count === 0) && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-zinc-600" />
                  ))}
                </div>
                <span className="text-xs text-zinc-500">No reviews</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

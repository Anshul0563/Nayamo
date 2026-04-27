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
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="group nayamo-card">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#141414]">
          <Link to={`/product/${product._id}`}>
            <img
              src={product.images?.[0] || product.image || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#0A0A0A] shadow-lg">
              {discount}% OFF
            </div>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
              className={inWishlist
                ? "w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#D4A5A5] to-[#C48888] shadow-lg"
                : "w-9 h-9 rounded-full flex items-center justify-center bg-[#1A1A1C]/80 backdrop-blur-md hover:bg-[#D4A5A5]/20"}
            >
              <Heart className={inWishlist ? "w-4 h-4 text-white fill-white" : "w-4 h-4 text-white"} />
            </button>
            <Link to={`/product/${product._id}`} className="w-9 h-9 rounded-full bg-[#1A1A1C]/80 backdrop-blur-md flex items-center justify-center hover:bg-[#D4A853]/20 transition-all duration-300">
              <Eye className="w-4 h-4 text-white" />
            </Link>
          </div>
          <div className="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product, 1); }}
              className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#0A0A0A] shadow-lg flex items-center justify-center gap-2 hover:shadow-[0_8px_30px_rgba(212,168,83,0.4)] transition-shadow duration-300"
            >
              <ShoppingBag className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-white group-hover:text-[#D4A853] transition-colors line-clamp-1 mb-1">
            <Link to={`/product/${product._id}`}>{product.name}</Link>
          </h3>
          {product.category && (
            <p className="text-[11px] text-[#6B7280] uppercase tracking-wider mb-2">{product.category}</p>
          )}
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-white">Rs {product.price?.toLocaleString("en-IN")}</span>
            {discount > 0 && (
              <span className="text-sm text-[#6B7280] line-through">Rs {product.originalPrice?.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

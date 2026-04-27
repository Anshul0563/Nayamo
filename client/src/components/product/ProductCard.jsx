import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const liked = isInWishlist(product._id);
  const imageUrl = product.images?.[0]?.url || product.images?.[0] || "https://placehold.co/400x400/FFFAF7/D4A853?text=Nayamo";

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product._id);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group nayamo-card overflow-hidden hover:-translate-y-1"
    >
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden rounded-t-2xl bg-[#FAF5F2]">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#D4A5A5] text-white text-[11px] font-bold rounded-lg shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${
              liked ? "bg-[#D4A5A5] text-white" : "bg-white text-[#8C7B73] hover:text-[#D4A5A5]"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Add to Cart Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#D4A853] hover:bg-[#C49A48] text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg backdrop-blur-sm bg-opacity-95"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-lg capitalize text-[#5C4F48] shadow-sm">
            {product.category} Earrings
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-[#2C2C2C] truncate hover:text-[#D4A853] transition-colors duration-200">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#D4A853]">
              Rs {product.price?.toLocaleString("en-IN")}
            </span>
            {hasDiscount && (
              <span className="text-sm text-[#B8A99A] line-through">
                Rs {product.originalPrice?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {product.stock === 0 && (
            <span className="text-xs text-[#D4A5A5] font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}


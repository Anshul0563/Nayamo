import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const liked = isInWishlist(product._id);
  const imageUrl = product.images?.[0]?.url || product.images?.[0] || "https://placehold.co/400x400/FDF8F0/D4A853?text=Nayamo";

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
    <div className="group nayamo-card overflow-hidden">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden rounded-t-2xl bg-stone-50">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              liked ? "bg-red-50 text-red-500" : "bg-white text-stone-600 hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
          </button>
        </div>
        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#D4A853] hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
<span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-lg capitalize text-stone-700 shadow-sm">
            {product.category} Earr
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-stone-800 truncate hover:text-[#D4A853] transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-semibold text-stone-900">
            ₹{product.price?.toLocaleString("en-IN")}
          </span>
          {product.stock === 0 && (
            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}


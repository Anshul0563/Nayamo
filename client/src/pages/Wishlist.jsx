import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

export default function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="nayamo-container py-20">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-10">
          My Wishlist
        </h1>
        <EmptyState
          type="wishlist"
          title="Your wishlist is empty"
          description="Save your favourite pieces here for later."
          actionText="Browse Products"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            My Wishlist
          </h1>
          <p className="text-[#A1A1AA]">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {wishlist.map((product, i) => {
            const imageUrl =
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "https://placehold.co/400x400/131316/D4A853?text=Nayamo";
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="nayamo-card overflow-hidden group border border-white/[0.04]"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0E0E10]">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 p-2.5 bg-[#131316]/80 backdrop-blur-md rounded-full text-[#D4A5A5] hover:bg-[#D4A5A5]/20 transition-colors border border-white/[0.06]"
                  >
                    <Heart className="w-4 h-4 fill-[#D4A5A5]" />
                  </button>
                </div>
                <div className="p-5">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-white hover:text-[#D4A853] transition-colors line-clamp-1">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-[#71717A] capitalize mt-1 mb-4">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#D4A853] font-bold text-lg">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                      className="p-2.5 bg-[#131316] rounded-xl hover:bg-[#D4A853] hover:text-[#070708] text-[#D4A853] transition-all border border-white/[0.06] disabled:opacity-30"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


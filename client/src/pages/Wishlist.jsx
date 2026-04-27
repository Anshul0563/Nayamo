import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

export default function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="nayamo-container py-16">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">My Wishlist</h1>
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
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const imageUrl = product.images?.[0]?.url || product.images?.[0] || "https://placehold.co/400x400/1A1A1C/D4A853?text=Nayamo";
            return (
              <div key={product._id} className="nayamo-card overflow-hidden group">
                <div className="relative aspect-square overflow-hidden bg-[#141414]">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 p-2 bg-[#1A1A1C]/80 backdrop-blur-md rounded-full text-[#D4A5A5] hover:bg-[#D4A5A5]/20 transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-[#D4A5A5]" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-white hover:text-[#D4A853] transition-colors line-clamp-1">{product.title}</h3>
                  </Link>
                  <p className="text-sm text-[#6B7280] capitalize mb-2">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#D4A853] font-semibold">₹{product.price?.toLocaleString("en-IN")}</p>
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={product.stock === 0}
                      className="p-2 bg-[#1A1A1C] rounded-lg hover:bg-[#D4A853] hover:text-[#0A0A0A] text-[#D4A853] transition-colors disabled:opacity-40"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


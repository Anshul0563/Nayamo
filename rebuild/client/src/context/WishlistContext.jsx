import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { wishlistAPI } from "@/services/api";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.getWishlist();
      setWishlist(res.data.data.products || []);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      await wishlistAPI.addToWishlist(productId);
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch (err) {
      toast.error("Add failed");
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      await wishlistAPI.removeFromWishlist(productId);
      await fetchWishlist();
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Remove failed");
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const toggleWishlist = (productId) => {
    if (wishlist.some(p => p._id === productId)) {
      return removeFromWishlist(productId);
    }
    return addToWishlist(productId);
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
    isInWishlist: (productId) => wishlist.some(p => p._id === productId),
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};


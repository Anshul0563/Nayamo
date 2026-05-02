import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { wishlistAPI } from "../services/api";
import toast from "react-hot-toast";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setWishlist([]);
        setWishlistCount(0);
        return;
      }
      const res = await wishlistAPI.getWishlist();
      const data = res.data?.data || res.data;
      const products = data?.products || [];
      setWishlist(products);
      setWishlistCount(products.length);
    } catch (err) {
      console.error("Wishlist fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (productId) => {
    setLoading(true);
    try {
      await wishlistAPI.addToWishlist(productId);
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    setLoading(true);
    try {
      await wishlistAPI.removeFromWishlist(productId);
      await fetchWishlist();
      toast.success("Removed from wishlist");
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((p) => p._id === productId || p === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback(async (product) => {
    const productId = product._id || product;
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        loading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}


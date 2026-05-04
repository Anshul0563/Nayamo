import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "@/services/api";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cartAPI.getCart();
      setCart(res.data.data || { items: [] });
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId) => {
    try {
      setLoading(true);
      await cartAPI.addToCart(productId);
      await fetchCart();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      await cartAPI.updateQuantity(productId, quantity);
      await fetchCart();
    } catch (err) {
      toast.error("Update failed");
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
      toast.success("Removed");
    } catch (err) {
      toast.error("Remove failed");
    }
  }, [fetchCart]);

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};


import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "../services/api";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setCart({ items: [] });
        setCartCount(0);
        setCartTotal(0);
        return;
      }
      const res = await cartAPI.getCart();
      const data = res.data?.data || res.data;
      setCart(data?.cart || { items: [] });
      setCartCount(data?.itemCount || 0);
      setCartTotal(data?.total || 0);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId) => {
    setLoading(true);
    try {
      await cartAPI.addToCart(productId);
      await fetchCart();
      toast.success("Added to cart");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add to cart";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setLoading(true);
    try {
      await cartAPI.updateQuantity(productId, quantity);
      await fetchCart();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    setLoading(true);
    try {
      await cartAPI.removeFromCart(productId);
      await fetchCart();
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Failed to remove");
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const clearCart = useCallback(() => {
    setCart({ items: [] });
    setCartCount(0);
    setCartTotal(0);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


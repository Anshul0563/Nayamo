import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { cartAPI } from "../services/api";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/errorMessage";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
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
      setCart({ items: [] });
      setCartCount(0);
      setCartTotal(0);
      setError(getApiErrorMessage(err, "Failed to load your cart"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      setLoading(true);

      try {
        if (!productId) {
          toast.error("Product ID missing");
          return;
        }

        const normalizedProductId = String(productId);
        // Prevent backend 400s from invalid ids
        if (!/^[a-fA-F0-9]{24}$/.test(normalizedProductId)) {
          toast.error("Invalid product id");
          return;
        }

        await cartAPI.addToCart(normalizedProductId, Number(quantity));

        await fetchCart();

        toast.success("Added to cart");
      } catch (err) {
        const msg =
          err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          "Failed to add to cart";

        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [fetchCart],
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
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
    },
    [fetchCart],
  );

  const removeFromCart = useCallback(
    async (productId) => {
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
    },
    [fetchCart],
  );

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
        error,
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

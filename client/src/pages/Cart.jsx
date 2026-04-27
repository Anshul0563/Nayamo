import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

export default function Cart() {
  const { cart, cartTotal, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const items = cart?.items || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nayamo-container py-20">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-10">
          Shopping Cart
        </h1>
        <EmptyState
          type="cart"
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet."
          actionText="Start Shopping"
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
            Shopping Cart
          </h1>
          <p className="text-[#A1A1AA]">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => {
              const product = item.product;
              if (!product) return null;
              const imageUrl =
                product.images?.[0]?.url ||
                product.images?.[0] ||
                "https://placehold.co/200x200/131316/D4A853?text=Nayamo";

              return (
                <motion.div
                  key={item._id || product._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="nayamo-card p-5 flex gap-5 border border-white/[0.04]"
                >
                  <div className="w-24 h-28 rounded-xl overflow-hidden bg-[#0E0E10] flex-shrink-0 border border-white/[0.05]">
                    <img
                      src={imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/product/${product._id}`}
                          className="font-semibold text-white hover:text-[#D4A853] transition-colors line-clamp-1"
                        >
                          {product.title}
                        </Link>
                        <p className="text-sm text-[#71717A] capitalize mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-2 text-[#52525B] hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center border border-white/[0.07] rounded-xl bg-[#131316] overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(
                              product._id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#1E1E24] text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(product._id, item.quantity + 1)
                          }
                          disabled={item.quantity >= product.stock}
                          className="w-9 h-9 flex items-center justify-center hover:bg-[#1E1E24] text-white transition-colors disabled:opacity-25"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-bold text-white text-lg">
                        ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="nayamo-card p-7 sticky top-24 border border-white/[0.04]">
              <h2 className="text-lg font-semibold text-white mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 text-sm mb-8">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Subtotal</span>
                  <span className="text-white">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Shipping</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="nayamo-divider my-4" />
                <div className="flex justify-between font-bold text-lg text-white">
                  <span>Total</span>
                  <span className="nayamo-text-gold">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full nayamo-btn-primary flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/shop"
                className="block text-center mt-5 text-sm text-[#D4A853] hover:text-[#F0D78C] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


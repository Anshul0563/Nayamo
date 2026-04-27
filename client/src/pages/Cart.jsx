import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

export default function Cart() {
  const { cart, cartTotal, loading, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const items = cart?.items || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nayamo-container py-16">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Shopping Cart</h1>
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
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.product;
              if (!product) return null;
              const imageUrl = product.images?.[0]?.url || product.images?.[0] || "https://placehold.co/200x200/FDF8F0/D4A853?text=Nayamo";

              return (
                <div key={item._id || product._id} className="nayamo-card p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                    <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/product/${product._id}`} className="font-medium text-stone-800 hover:text-[#D4A853] transition-colors line-clamp-1">
                          {product.title}
                        </Link>
                        <p className="text-sm text-stone-500 capitalize">{product.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-stone-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-semibold text-stone-900">
                        ₹{(product.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="nayamo-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="w-full nayamo-btn-primary flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/shop" className="block text-center mt-4 text-sm text-[#D4A853] hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


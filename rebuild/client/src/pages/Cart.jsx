import { useCart } from "@/context/CartContext";
import Loader from "@/components/common/EmptyState";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();

  if (loading) return <Loader />;

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0);

  return (
    <div className="py-12">
      <div className="nayamo-container">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-2">
            Shopping Cart
          </h1>
          <p className="text-nayamo-text-muted">
            {cart.items.length} items
          </p>
        </div>

        {cart.items.length === 0 ? (
          <EmptyState 
            title="Your cart is empty"
            subtitle="Looks like you haven't added anything yet"
            action={
              <Link to="/shop" className="nayamo-btn-primary mt-4 inline-block">
                Continue Shopping
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex gap-6 p-6 nayamo-glass rounded-3xl">
                  <img 
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-24 h-24 object-cover rounded-2xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-semibold text-nayamo-text-primary mb-2">
                      {item.product.title}
                    </h3>
                    <p className="text-nayamo-gold text-2xl font-bold mb-4">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-nayamo-bg-card px-4 py-2 rounded-xl">
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="w-10 h-10 rounded-lg border hover:bg-nayamo-hover flex items-center justify-center text-nayamo-text-secondary"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold mx-4">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="w-10 h-10 rounded-lg border hover:bg-nayamo-hover flex items-center justify-center text-nayamo-text-secondary"
                        >
                          +
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product._id)}
                        className="p-2 text-nayamo-text-muted hover:text-red-400 transition-colors flex items-center gap-1 hover:bg-red-500/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 p-8 nayamo-glass rounded-3xl border h-fit">
                <h2 className="text-2xl font-serif font-bold text-nayamo-text-primary mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-nayamo-text-secondary">
                    <span>Subtotal ({cart.items.length} items):</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-nayamo-text-secondary">
                    <span>Shipping:</span>
                    <span className="font-semibold text-nayamo-gold">FREE</span>
                  </div>
                  <div className="h-px bg-nayamo-border-light" />
                  <div className="flex justify-between text-xl font-bold text-nayamo-text-primary">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/checkout" className="w-full nayamo-btn-primary py-4 text-lg">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


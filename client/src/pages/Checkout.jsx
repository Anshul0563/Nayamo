import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Truck, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI } from "../services/api";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    paymentMethod: "cod",
  });

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="nayamo-container py-10">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">Checkout</h1>
        <EmptyState
          type="cart"
          title="Your cart is empty"
          description="Add some items before checking out."
          actionText="Browse Products"
          actionLink="/shop"
        />
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pin) {
      toast.error("Please fill all shipping details");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (!/^\d{6}$/.test(form.pin)) {
      toast.error("PIN must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        address: `${form.name}, ${form.address}, ${form.city}, ${form.state} - ${form.pin}`,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
      };

      const res = await orderAPI.placeOrder(orderData);
      const order = res.data?.data;

      if (form.paymentMethod === "online" && order) {
        const paymentRes = await paymentAPI.createOrder({ amount: cartTotal, orderId: order._id });
        const paymentOrder = paymentRes.data?.order || paymentRes.data?.data?.order;

        if (window.Razorpay && paymentOrder?.id) {
          const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: "Nayamo",
            description: "Jewellery Order",
            order_id: paymentOrder.id,
            handler: async (response) => {
              await paymentAPI.verifyPayment({
                orderId: paymentOrder.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                mongoOrderId: order._id,
              });
              toast.success("Payment successful!");
              clearCart();
              navigate("/orders");
            },
            theme: { color: "#D4A853" },
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        }
      }

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { num: 1, label: "Shipping" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Review" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#0A0A0A]" : "bg-[#1A1A1C] text-[#6B7280] border border-white/[0.08]"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-sm ${step >= s.num ? "text-white font-medium" : "text-[#6B7280]"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="nayamo-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-[#D4A853]" />
                  <h2 className="text-lg font-semibold text-white">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="nayamo-input" />
                  <input name="phone" placeholder="Phone (10 digits)" value={form.phone} onChange={handleChange} className="nayamo-input" />
                  <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="nayamo-input md:col-span-2" />
                  <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="nayamo-input" />
                  <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="nayamo-input" />
                  <input name="pin" placeholder="PIN Code (6 digits)" value={form.pin} onChange={handleChange} className="nayamo-input" />
                </div>
                <button onClick={() => setStep(2)} className="mt-6 nayamo-btn-primary">Continue to Payment</button>
              </div>
            )}

            {step === 2 && (
              <div className="nayamo-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="w-5 h-5 text-[#D4A853]" />
                  <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                </div>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.paymentMethod === "cod" ? "border-[#D4A853] bg-[#D4A853]/5" : "border-white/[0.08] bg-[#0A0A0A]"}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === "cod"} onChange={handleChange} className="w-4 h-4 accent-[#D4A853]" />
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-[#9CA3AF]" />
                      <div>
                        <p className="font-medium text-white">Cash on Delivery</p>
                        <p className="text-xs text-[#9CA3AF]">Pay when you receive</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${form.paymentMethod === "online" ? "border-[#D4A853] bg-[#D4A853]/5" : "border-white/[0.08] bg-[#0A0A0A]"}`}>
                    <input type="radio" name="paymentMethod" value="online" checked={form.paymentMethod === "online"} onChange={handleChange} className="w-4 h-4 accent-[#D4A853]" />
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#9CA3AF]" />
                      <div>
                        <p className="font-medium text-white">Online Payment</p>
                        <p className="text-xs text-[#9CA3AF]">UPI, Card, Net Banking via Razorpay</p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="nayamo-btn-secondary">Back</button>
                  <button onClick={() => setStep(3)} className="nayamo-btn-primary">Review Order</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="nayamo-card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Review Your Order</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between py-2 border-b border-white/[0.06]">
                      <div>
                        <p className="font-medium text-sm text-white">{item.product?.title}</p>
                        <p className="text-xs text-[#9CA3AF]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm text-white">₹{(item.product?.price * item.quantity).toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm mb-6">
                  <div className="flex justify-between"><span className="text-[#9CA3AF]">Subtotal</span><span className="text-white">₹{cartTotal.toLocaleString("en-IN")}</span></div>
                  <div className="flex justify-between"><span className="text-[#9CA3AF]">Shipping</span><span className="text-green-400">Free</span></div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-white/[0.06] text-white"><span>Total</span><span>₹{cartTotal.toLocaleString("en-IN")}</span></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="nayamo-btn-secondary">Back</button>
                  <button onClick={handlePlaceOrder} disabled={loading} className="nayamo-btn-primary flex-1 disabled:opacity-50">
                    {loading ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="nayamo-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#141414] border border-white/[0.06] flex-shrink-0">
                      <img src={item.product?.images?.[0]?.url || item.product?.images?.[0] || ""} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">{item.product?.title}</p>
                      <p className="text-xs text-[#9CA3AF]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-white">₹{(item.product?.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-[#9CA3AF]"><span>Subtotal</span><span>₹{cartTotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-[#9CA3AF]"><span>Shipping</span><span className="text-green-400">Free</span></div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-white/[0.06] text-white"><span>Total</span><span>₹{cartTotal.toLocaleString("en-IN")}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


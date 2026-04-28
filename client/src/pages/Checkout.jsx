import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Truck, CheckCircle, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderAPI, paymentAPI } from "../services/api";
import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";

const steps = [
  { num: 1, label: "Shipping" },
  { num: 2, label: "Payment" },
  { num: 3, label: "Review" },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to checkout");
    }
  }, [authLoading, user]);

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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: { pathname: "/checkout" } }} />;
  }

  if (items.length === 0) {
    return (
      <div className="nayamo-container py-20">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-10">
          Checkout
        </h1>
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
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pin
    ) {
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
        const paymentRes = await paymentAPI.createOrder({
          amount: cartTotal,
          orderId: order._id,
        });
        const paymentOrder =
          paymentRes.data?.order || paymentRes.data?.data?.order;

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
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            Checkout
          </h1>
          <p className="text-[#A1A1AA]">Complete your purchase</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s.num
                    ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708] shadow-[0_4px_16px_rgba(212,168,83,0.25)]"
                    : "bg-[#131316] text-[#52525B] border border-white/[0.06]"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= s.num ? "text-white" : "text-[#52525B]"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-[#52525B] mx-1" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="nayamo-card p-7 md:p-8 border border-white/[0.04]"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A853]/8 flex items-center justify-center border border-[#D4A853]/10">
                    <MapPin className="w-5 h-5 text-[#D4A853]" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Shipping Address
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="nayamo-input"
                  />
                  <input
                    name="phone"
                    placeholder="Phone (10 digits)"
                    value={form.phone}
                    onChange={handleChange}
                    className="nayamo-input"
                  />
                  <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="nayamo-input md:col-span-2"
                  />
                  <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="nayamo-input"
                  />
                  <input
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="nayamo-input"
                  />
                  <input
                    name="pin"
                    placeholder="PIN Code (6 digits)"
                    value={form.pin}
                    onChange={handleChange}
                    className="nayamo-input"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="mt-8 nayamo-btn-primary"
                >
                  Continue to Payment
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="nayamo-card p-7 md:p-8 border border-white/[0.04]"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A853]/8 flex items-center justify-center border border-[#D4A853]/10">
                    <CreditCard className="w-5 h-5 text-[#D4A853]" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Payment Method
                  </h2>
                </div>
                <div className="space-y-4">
                  <label
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === "cod"
                        ? "border-[#D4A853] bg-[#D4A853]/5"
                        : "border-white/[0.06] bg-[#070708] hover:border-white/[0.1]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#D4A853]"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                        <Truck className="w-5 h-5 text-[#A1A1AA]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-[#71717A]">
                          Pay when you receive
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      form.paymentMethod === "online"
                        ? "border-[#D4A853] bg-[#D4A853]/5"
                        : "border-white/[0.06] bg-[#070708] hover:border-white/[0.1]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={form.paymentMethod === "online"}
                      onChange={handleChange}
                      className="w-4 h-4 accent-[#D4A853]"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#A1A1AA]" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          Online Payment
                        </p>
                        <p className="text-xs text-[#71717A]">
                          UPI, Card, Net Banking via Razorpay
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setStep(1)} className="nayamo-btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="nayamo-btn-primary">
                    Review Order
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="nayamo-card p-7 md:p-8 border border-white/[0.04]"
              >
                <h2 className="text-lg font-semibold text-white mb-6">
                  Review Your Order
                </h2>
                <div className="space-y-4 mb-8">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between py-3 border-b border-white/[0.04]"
                    >
                      <div>
                        <p className="font-medium text-sm text-white">
                          {item.product?.title}
                        </p>
                        <p className="text-xs text-[#71717A]">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-sm text-white">
                        ₹
                        {(
                          item.product?.price * item.quantity
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 text-sm mb-8">
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Subtotal</span>
                    <span className="text-white">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A1A1AA]">Shipping</span>
                    <span className="text-green-400 font-medium">Free</span>
                  </div>
                  <div className="nayamo-divider my-3" />
                  <div className="flex justify-between font-bold text-base text-white">
                    <span>Total</span>
                    <span className="nayamo-text-gold">
                      ₹{cartTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="nayamo-btn-secondary">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="nayamo-btn-primary flex-1 disabled:opacity-40"
                  >
                    {loading ? (
                      <Loader size={20} />
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="nayamo-card p-7 sticky top-24 border border-white/[0.04]">
              <h2 className="text-lg font-semibold text-white mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0E0E10] border border-white/[0.05] flex-shrink-0">
                      <img
                        src={
                          item.product?.images?.[0]?.url ||
                          item.product?.images?.[0] ||
                          ""
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {item.product?.title}
                      </p>
                      <p className="text-xs text-[#71717A]">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      ₹
                      {(
                        item.product?.price * item.quantity
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.05] pt-5 space-y-3 text-sm">
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
                <div className="nayamo-divider my-3" />
                <div className="flex justify-between font-bold text-base text-white">
                  <span>Total</span>
                  <span className="nayamo-text-gold">
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import { orderAPI, paymentAPI } from "../services/api";

import EmptyState from "../components/common/EmptyState";
import Loader from "../components/common/Loader";

// =========================
// LOAD RAZORPAY SDK
// =========================
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const existingScript = document.getElementById("razorpay-sdk");

    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.id = "razorpay-sdk";

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

const steps = [
  {
    num: 1,
    label: "Shipping",
  },
  {
    num: 2,
    label: "Payment",
  },
  {
    num: 3,
    label: "Review",
  },
];

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();

  const { user, loading: authLoading } = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pin: "",
    paymentMethod: "cod",
  });

  // =========================
  // HANDLE CHANGE
  // =========================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // AUTH CHECK
  // =========================
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to checkout");
    }
  }, [authLoading, user]);

  const items = cart?.items || [];

  // =========================
  // PLACE ORDER
  // =========================
  const handlePlaceOrder = async () => {
    const idempotencyKey = `${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}`;

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

    if (loading) return;

    setLoading(true);

    try {
      const orderData = {
        address: `${form.name}, ${form.address}, ${form.city}, ${form.state} - ${form.pin}`,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
        idempotencyKey,
      };

      // COD
      if (form.paymentMethod === "cod") {
        await orderAPI.placeOrder(orderData);

        toast.success("Order placed successfully!");

        clearCart();

        navigate("/orders");

        return;
      }

      // ONLINE
      if (form.paymentMethod === "online") {
        const razorpayLoaded = await loadRazorpayScript();

        if (!razorpayLoaded) {
          toast.error("Failed to load Razorpay SDK");
          return;
        }

        const orderRes = await orderAPI.placeOrder(orderData);

        const order = orderRes.data?.data;

        if (!order?._id) {
          throw new Error("Order creation failed");
        }

        const paymentRes = await paymentAPI.createOrder({
          orderId: order._id,
        });

        const paymentOrder =
          paymentRes.data?.order || paymentRes.data?.data?.order;

        if (!paymentOrder?.id) {
          throw new Error("Failed to create Razorpay order");
        }

        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || "",

          amount: paymentOrder.amount,

          currency: paymentOrder.currency,

          name: "Nayamo",

          description: "Jewellery Order",

          order_id: paymentOrder.id,

          prefill: {
            name: form.name,
            contact: form.phone,
            email: user?.email || "",
          },

          theme: {
            color: "#D4A853",
          },

          handler: async (response) => {
            try {
              await paymentAPI.verifyPayment({
                orderId: paymentOrder.id,

                razorpayPaymentId: response.razorpay_payment_id,

                razorpaySignature: response.razorpay_signature,

                mongoOrderId: order._id,
              });

              toast.success("Payment successful!");

              clearCart();

              navigate("/orders");
            } catch (verifyErr) {
              const msg =
                verifyErr?.response?.data?.message ||
                verifyErr?.message ||
                "Payment verification failed";

              toast.error(msg);
            }
          },

          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled");
            },
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.open();

        return;
      }

      throw new Error("Invalid payment method");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to place order";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  // =========================
  // NOT LOGGED IN
  // =========================
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: "/checkout",
          },
        }}
      />
    );
  }

  // =========================
  // EMPTY CART
  // =========================
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

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-10">
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
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
                    ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-[#070708]"
                    : "bg-[#131316] text-[#52525B]"
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
                <ChevronRight className="w-4 h-4 text-[#52525B]" />
              )}
            </div>
          ))}
        </div>

        {/* KEEP YOUR OLD UI BELOW SAME */}
      </div>
    </div>
  );
}

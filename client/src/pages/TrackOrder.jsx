import React, { useState } from "react";
import { Search, Package, Truck, CheckCircle, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { orderAPI } from "../services/api";
import Loader from "../components/common/Loader";

const trackingSteps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "ready_to_ship", label: "Ready to Ship", icon: Package },
  { status: "pickup_requested", label: "Pickup Requested", icon: Truck },
  { status: "in_transit", label: "In Transit", icon: Truck },
  { status: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await orderAPI.getOrderById(orderId.trim());
      if (res.data?.data) {
        setOrder(res.data.data);
      } else {
        setError("Order not found. Please check the Order ID.");
      }
    } catch (err) {
      setError("Order not found. Please check the Order ID.");
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return trackingSteps.findIndex((s) => s.status === status);
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
            Track Order
          </h1>
          <p className="text-[#A1A1AA]">
            Enter your Order ID to check delivery status
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nayamo-card p-8 max-w-xl border border-white/[0.04] mb-10"
        >
          <form onSubmit={handleTrack} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717A]" />
            <input
              type="text"
              placeholder="Enter Order ID (e.g. 64a1b2c3...)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="nayamo-input pl-12 pr-32 py-4"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 nayamo-btn-primary text-xs px-5 py-2.5 disabled:opacity-40"
            >
              {loading ? <Loader size={16} /> : "Track"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </motion.div>

        <AnimatePresence>
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="nayamo-card p-8 md:p-10 border border-white/[0.04]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                  <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
                    Order ID
                  </p>
                  <p className="font-mono font-semibold text-white text-lg">
                    {order._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <p className="font-semibold text-white capitalize">
                    {order.status?.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="font-bold nayamo-text-gold text-lg">
                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/[0.06]" />
                <div className="space-y-6">
                  {trackingSteps.map((step, i) => {
                    const currentStepIndex = getStepIndex(order.status);
                    const isCompleted = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;

                    return (
                      <div key={step.status} className="flex items-center gap-5 relative">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                            isCompleted
                              ? "bg-gradient-to-br from-[#D4A853] to-[#C9963B] shadow-[0_4px_16px_rgba(212,168,83,0.3)]"
                              : "bg-[#131316] border border-white/[0.08]"
                          }`}
                        >
                          <step.icon
                            className={`w-4 h-4 ${
                              isCompleted ? "text-[#070708]" : "text-[#52525B]"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isCompleted ? "text-white" : "text-[#52525B]"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-[#D4A853] mt-0.5">
                              Current Status
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


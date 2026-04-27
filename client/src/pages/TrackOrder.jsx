import React, { useState } from "react";
import { Search, Package, MapPin } from "lucide-react";
import { orderAPI } from "../services/api";
import Loader from "../components/common/Loader";

const statusSteps = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "ready_to_ship", label: "Ready to Ship" },
  { key: "pickup_requested", label: "Pickup Requested" },
  { key: "in_transit", label: "In Transit" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
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
      setOrder(res.data?.data);
    } catch (err) {
      setError("Order not found. Please check the order ID.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? statusSteps.findIndex((s) => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-white mb-2 text-center">Track Your Order</h1>
        <p className="text-[#9CA3AF] text-center mb-8">Enter your order ID to check delivery status</p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Enter Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="nayamo-input pl-10"
            />
          </div>
          <button type="submit" disabled={loading} className="nayamo-btn-primary px-6 disabled:opacity-50">
            {loading ? <Loader size={16} /> : <><Search className="w-4 h-4 inline mr-1" /> Track</>}
          </button>
        </form>

        {error && (
          <div className="nayamo-card p-6 text-center text-[#D4A5A5] mb-6">{error}</div>
        )}

        {order && (
          <div className="nayamo-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-[#9CA3AF]">Order ID</p>
                <p className="font-mono font-medium text-white">{order._id?.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#9CA3AF]">Status</p>
                <span className="inline-block px-3 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs font-medium rounded-full capitalize border border-[#D4A853]/20">
                  {order.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="relative mb-8 overflow-x-auto pb-4">
              <div className="flex justify-between items-center min-w-[500px]">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-[#D4A853] to-[#C9963B] border-[#D4A853] text-[#0A0A0A]"
                            : "bg-[#1A1A1C] border-white/[0.08] text-[#6B7280]"
                        } ${isCurrent ? "ring-4 ring-[#D4A853]/20" : ""}`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 text-center w-16 leading-tight ${isActive ? "text-white" : "text-[#6B7280]"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#1A1A1C] -z-0 mx-4">
                <div
                  className="h-full bg-gradient-to-r from-[#D4A853] to-[#C9963B] transition-all"
                  style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t border-white/[0.06] pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Order Date</span>
                <span className="font-medium text-white">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Total Amount</span>
                <span className="font-semibold text-[#D4A853]">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Payment Method</span>
                <span className="font-medium text-white capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA3AF]">Payment Status</span>
                <span className={`font-medium ${order.isPaid ? "text-green-400" : "text-amber-400"}`}>
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              {order.delhivery?.waybill && (
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">Tracking Number</span>
                  <span className="font-mono font-medium text-white">{order.delhivery.waybill}</span>
                </div>
              )}
              <div className="flex items-start gap-2 pt-2">
                <MapPin className="w-4 h-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
                <span className="text-[#9CA3AF]">{order.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


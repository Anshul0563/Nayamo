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
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="nayamo-container py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2 text-center">Track Your Order</h1>
        <p className="text-stone-500 text-center mb-8">Enter your order ID to check delivery status</p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-10">
          <div className="flex-1 relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
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
          <div className="nayamo-card p-6 text-center text-red-500 mb-6">{error}</div>
        )}

        {order && (
          <div className="nayamo-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-stone-500">Order ID</p>
                <p className="font-mono font-medium text-stone-800">{order._id?.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-500">Status</p>
                <span className="inline-block px-3 py-1 bg-amber-50 text-[#D4A853] text-xs font-medium rounded-full capitalize">
                  {order.status?.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="relative mb-8">
              <div className="flex justify-between items-center">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors ${
                          isActive
                            ? "bg-[#D4A853] border-[#D4A853] text-white"
                            : "bg-white border-stone-200 text-stone-400"
                        } ${isCurrent ? "ring-4 ring-amber-100" : ""}`}
                      >
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 text-center w-16 leading-tight ${isActive ? "text-stone-700" : "text-stone-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-stone-200 -z-0">
                <div
                  className="h-full bg-[#D4A853] transition-all"
                  style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t border-stone-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Order Date</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Amount</span>
                <span className="font-semibold text-[#D4A853]">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Method</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Status</span>
                <span className={`font-medium ${order.isPaid ? "text-green-600" : "text-amber-600"}`}>
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </div>
              {order.delhivery?.waybill && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Tracking Number</span>
                  <span className="font-mono font-medium">{order.delhivery.waybill}</span>
                </div>
              )}
              <div className="flex items-start gap-2 pt-2">
                <MapPin className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                <span className="text-stone-600">{order.address}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { orderAPI } from "../services/api";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "Confirmed" },
  ready_to_ship: { icon: Package, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", label: "Ready to Ship" },
  pickup_requested: { icon: Truck, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20", label: "Pickup Requested" },
  in_transit: { icon: Truck, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20", label: "In Transit" },
  out_for_delivery: { icon: Truck, color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20", label: "Out for Delivery" },
  delivered: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Cancelled" },
  returned: { icon: XCircle, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "Returned" },
  rto: { icon: XCircle, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", label: "RTO" },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getOrders();
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Orders error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="nayamo-container py-16">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">My Orders</h1>
        <EmptyState
          type="orders"
          title="No orders yet"
          description="You haven't placed any orders yet."
          actionText="Start Shopping"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const firstItem = order.items?.[0];
            const itemCount = order.items?.length || 0;

            return (
              <div key={order._id} className="nayamo-card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Order ID</p>
                    <p className="font-mono font-medium text-white">{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Date</p>
                    <p className="font-medium text-white">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[#9CA3AF]">Total</p>
                    <p className="font-semibold text-[#D4A853]">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} border ${config.border}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4">
                  <div className="flex items-center gap-4">
                    {firstItem?.product?.images?.[0] && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#141414] border border-white/[0.06] flex-shrink-0">
                        <img
                          src={firstItem.product.images[0]?.url || firstItem.product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {firstItem?.product?.title}
                        {itemCount > 1 && <span className="text-[#9CA3AF] text-sm"> +{itemCount - 1} more</span>}
                      </p>
                      <p className="text-sm text-[#9CA3AF]">{order.address}</p>
                    </div>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await orderAPI.cancelOrder(order._id);
                          setOrders(orders.map((o) => (o._id === order._id ? { ...o, status: "cancelled" } : o)));
                        } catch (err) {
                          console.error("Cancel failed:", err);
                        }
                      }}
                      className="text-sm text-[#D4A5A5] hover:text-[#E8C4C4] font-medium"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


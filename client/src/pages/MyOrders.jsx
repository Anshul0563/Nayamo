import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { orderAPI } from "../services/api";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";

const statusConfig = {
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Confirmed" },
  ready_to_ship: { icon: Package, color: "text-purple-600", bg: "bg-purple-50", label: "Ready to Ship" },
  pickup_requested: { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50", label: "Pickup Requested" },
  in_transit: { icon: Truck, color: "text-cyan-600", bg: "bg-cyan-50", label: "In Transit" },
  out_for_delivery: { icon: Truck, color: "text-teal-600", bg: "bg-teal-50", label: "Out for Delivery" },
  delivered: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
  returned: { icon: XCircle, color: "text-orange-600", bg: "bg-orange-50", label: "Returned" },
  rto: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50", label: "RTO" },
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
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="nayamo-container py-16">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">My Orders</h1>
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
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-8">My Orders</h1>

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
                    <p className="text-sm text-stone-500">Order ID</p>
                    <p className="font-mono font-medium text-stone-800">{order._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Date</p>
                    <p className="font-medium text-stone-800">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Total</p>
                    <p className="font-semibold text-[#D4A853]">₹{order.totalPrice?.toLocaleString("en-IN")}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${config.color}`} />
                    <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-4">
                    {firstItem?.product?.images?.[0] && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-50 flex-shrink-0">
                        <img
                          src={firstItem.product.images[0]?.url || firstItem.product.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-stone-800">
                        {firstItem?.product?.title}
                        {itemCount > 1 && <span className="text-stone-500 text-sm"> +{itemCount - 1} more</span>}
                      </p>
                      <p className="text-sm text-stone-500">{order.address}</p>
                    </div>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
                    <button
                      onClick={async () => {
                        try {
                          await orderAPI.cancelOrder(order._id);
                          setOrders(orders.map((o) => (o._id === order._id ? { ...o, status: "cancelled" } : o)));
                        } catch (err) {
                          console.error("Cancel failed:", err);
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-600 font-medium"
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


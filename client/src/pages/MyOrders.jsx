import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import OrderCard from "../components/orders/OrderCard";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError(null);
        const res = await orderAPI.getOrders();
        setOrders(res.data?.data || []);
      } catch (err) {
        console.error("Orders error:", err);
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    try {
      await orderAPI.cancelOrder(orderId);
      // Update the order status in local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="nayamo-btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="nayamo-container py-20">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-10">
          My Orders
        </h1>
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

  // Group orders for better UX
  const activeStatuses = ["pending", "confirmed", "ready_to_ship", "pickup_requested", "in_transit", "out_for_delivery"];
  const activeOrders = orders.filter(order => activeStatuses.includes(order.status));
  const completedOrders = orders.filter(order => !activeStatuses.includes(order.status));

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            My Orders
          </h1>
          <p className="text-[#A1A1AA]">
            {orders.length} {orders.length === 1 ? "order" : "orders"} total
          </p>
        </motion.div>

        {activeOrders.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
              <div className="w-2 h-8 bg-[#D4A853] rounded-full" />
              <h2 className="text-2xl font-serif font-bold text-white">
                Active Orders ({activeOrders.length})
              </h2>
            </div>
            <div className="space-y-5 mb-8">
              {activeOrders.map((order, index) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={index}
                  onCancel={handleCancelOrder}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
            <div className="w-2 h-8 bg-green-500/60 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-white">
              Completed Orders ({completedOrders.length})
            </h2>
          </div>
          <div className="space-y-5">
            {completedOrders.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                index={index}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

}

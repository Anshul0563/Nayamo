import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import OrderDetailsComponent from "../components/orders/OrderDetails";
import Loader from "../components/common/Loader";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        const res = await orderAPI.getOrderById(id);
        setOrder(res.data?.data);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleBack = () => {
    navigate("/orders");
  };

  const handleCancel = async (orderId) => {
    try {
      setCancelLoading(true);
      await orderAPI.cancelOrder(orderId);
      // Update local state
      setOrder((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReturn = async (orderId) => {
    try {
      setReturnLoading(true);
      await orderAPI.returnOrder(orderId);
      // Update local state
      setOrder((prev) => ({
        ...prev,
        status: "return_requested",
      }));
    } catch (err) {
      console.error("Return failed:", err);
      alert(err.response?.data?.message || "Failed to return order");
    } finally {
      setReturnLoading(false);
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
            onClick={handleBack}
            className="nayamo-btn-secondary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrderDetailsComponent
      order={order}
      onBack={handleBack}
      onCancel={handleCancel}
      onReturn={handleReturn}
      cancelLoading={cancelLoading}
      returnLoading={returnLoading}
    />
  );
}

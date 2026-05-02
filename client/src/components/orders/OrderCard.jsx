import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function OrderCard({ order, onCancel, index = 0 }) {
  const navigate = useNavigate();
  const firstItem = order.items?.[0];
  const itemCount = order.items?.length || 0;

  // Determine if cancel button should be shown
  const canCancel = ["pending", "confirmed"].includes(order.status);

  const handleCardClick = (e) => {
    // Don't navigate if clicking cancel button
    if (e.target.closest(".cancel-btn")) return;
    navigate(`/orders/${order._id}`);
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    if (onCancel) {
      await onCancel(order._id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={handleCardClick}
      className="nayamo-card p-6 md:p-8 border border-white/[0.04] cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 flex-1">
          <div>
            <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
              Order ID
            </p>
            <p className="font-mono font-semibold text-white group-hover:text-[#D4A853] transition-colors">
              {order._id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
              Date
            </p>
            <p className="font-semibold text-white">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#71717A] uppercase tracking-wider mb-1">
              Total
            </p>
            <p className="font-bold nayamo-text-gold">
              ₹{order.totalPrice?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="border-t border-white/[0.05] pt-5">
        <div className="flex items-center gap-4">
          {firstItem?.product?.images?.[0] && (
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-[#0E0E10] border border-white/[0.05] flex-shrink-0">
              <img
                src={
                  firstItem.product.images[0]?.url ||
                  firstItem.product.images[0]
                }
                alt=""
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate group-hover:text-[#D4A853] transition-colors">
              {firstItem?.product?.title}
              {itemCount > 1 && (
                <span className="text-[#A1A1AA] text-sm font-normal">
                  {" "}
                  +{itemCount - 1} more item{itemCount > 2 ? "s" : ""}
                </span>
              )}
            </p>
            <p className="text-sm text-[#71717A] mt-0.5 truncate">
              {order.address}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#71717A]">
              <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}</span>
              <span>•</span>
              <span>{itemCount} item{itemCount > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel button - only for pending/confirmed */}
      {canCancel && (
        <div className="mt-5 pt-5 border-t border-white/[0.05] flex justify-end">
          <button
            onClick={handleCancel}
            className="cancel-btn text-sm text-[#D4A5A5] hover:text-[#ECC5C5] font-medium transition-colors hover:underline"
          >
            Cancel Order
          </button>
        </div>
      )}
    </motion.div>
  );
}

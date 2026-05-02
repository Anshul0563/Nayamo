import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  RotateCcw, 
  X,
  Check,
  AlertCircle
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import OrderTimeline from "./OrderTimeline";
import Loader from "../common/Loader";

export default function OrderDetails({ 
  order, 
  onBack, 
  onCancel, 
  onReturn,
  cancelLoading,
  returnLoading 
}) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  // Determine button visibility and states
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canReturn = order.status === "delivered";
  const isCancelled = ["cancelled", "rto"].includes(order.status);
  
  // Check if return is within 7 days
  let returnAllowed = false;
  if (canReturn && order.deliveredAt) {
    const deliveredDate = new Date(order.deliveredAt);
    const now = new Date();
    const daysSinceDelivery = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
    returnAllowed = daysSinceDelivery <= 7;
  }

  const handleConfirmCancel = async () => {
    if (onCancel) {
      await onCancel(order._id);
    }
    setShowCancelModal(false);
  };

  const handleConfirmReturn = async () => {
    if (onReturn) {
      await onReturn(order._id);
    }
    setShowReturnModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#070708]"
    >
      <div className="nayamo-container py-6 md:py-10">
        {/* Back button */}
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-[#A1A1AA] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Orders</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">
                Order Details
              </h1>
              <p className="text-[#71717A] font-mono">
                #{order._id?.slice(-8).toUpperCase()}
              </p>
            </div>
            <StatusBadge status={order.status} size="lg" />
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="nayamo-card p-6 md:p-8 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Order Timeline</h2>
          <OrderTimeline status={order.status} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="nayamo-card p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-white mb-5">Products</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 bg-[#0E0E10] rounded-xl border border-white/[0.04]"
                >
                  {item.product?.images?.[0] && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#18181C] flex-shrink-0">
                      <img
                        src={item.product.images[0]?.url || item.product.images[0]}
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {item.product?.title}
                    </p>
                    <p className="text-sm text-[#71717A] mt-1">
                      Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm nayamo-text-gold font-semibold mt-2">
                      ₹{(item.quantity * item.price)?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-5 border-t border-white/[0.05]">
              <div className="flex justify-between text-sm text-[#71717A] mb-2">
                <span>Subtotal</span>
                <span>₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm text-[#71717A] mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-white pt-2 border-t border-white/[0.05]">
                <span>Total</span>
                <span className="nayamo-text-gold">₹{order.totalPrice?.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </motion.div>

          {/* Sidebar info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Shipping Address */}
            <div className="nayamo-card p-6">
              <div className="flex items-center gap-2 text-white mb-4">
                <MapPin className="w-5 h-5 text-[#D4A853]" />
                <h3 className="font-semibold">Shipping Address</h3>
              </div>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                {order.address}
              </p>
              <p className="text-[#71717A] text-sm mt-2">
                {order.phone}
              </p>
            </div>

            {/* Payment Method */}
            <div className="nayamo-card p-6">
              <div className="flex items-center gap-2 text-white mb-4">
                <CreditCard className="w-5 h-5 text-[#D4A853]" />
                <h3 className="font-semibold">Payment Method</h3>
              </div>
              <p className="text-[#A1A1AA] text-sm capitalize">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
              </p>
              <div className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                order.paymentStatus === "paid" 
                  ? "bg-green-500/10 text-green-400" 
                  : "bg-amber-500/10 text-amber-400"
              }`}>
                {order.paymentStatus === "paid" ? "Paid" : "Pending"}
              </div>
            </div>

            {/* Order Info */}
            <div className="nayamo-card p-6">
              <div className="flex items-center gap-2 text-white mb-4">
                <Package className="w-5 h-5 text-[#D4A853]" />
                <h3 className="font-semibold">Order Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#71717A]">Order Date</span>
                  <span className="text-[#A1A1AA]">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-[#71717A]">Delivered On</span>
                    <span className="text-[#A1A1AA]">
                      {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        {(!isCancelled) && (canCancel || canReturn) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 justify-end"
          >
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              >
                Cancel Order
              </button>
            )}
            {canReturn && returnAllowed && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
              >
                Return Order
              </button>
            )}
            {canReturn && !returnAllowed && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-xl text-amber-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Return period of 7 days has expired</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="nayamo-card p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Cancel Order</h3>
                </div>
                <p className="text-[#A1A1AA] mb-6">
                  Are you sure you want to cancel this order? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="flex-1 px-4 py-3 rounded-full font-medium text-sm border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={cancelLoading}
                    className="flex-1 px-4 py-3 rounded-full font-medium text-sm bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {cancelLoading ? <Loader size={20} /> : "Yes, Cancel"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Return Confirmation Modal */}
        <AnimatePresence>
          {showReturnModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowReturnModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="nayamo-card p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Return Order</h3>
                </div>
                <p className="text-[#A1A1AA] mb-6">
                  Are you sure you want to return this order? You can return within 7 days of delivery.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReturnModal(false)}
                    className="flex-1 px-4 py-3 rounded-full font-medium text-sm border border-white/[0.1] text-white hover:bg-white/[0.05] transition-colors"
                  >
                    No, Keep It
                  </button>
                  <button
                    onClick={handleConfirmReturn}
                    disabled={returnLoading}
                    className="flex-1 px-4 py-3 rounded-full font-medium text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {returnLoading ? <Loader size={20} /> : "Yes, Return"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

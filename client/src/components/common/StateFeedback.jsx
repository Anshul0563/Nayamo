import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Heart,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  WifiOff,
} from "lucide-react";
import { motion } from "framer-motion";

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
  search: Search,
  error: AlertTriangle,
  network: WifiOff,
};

export default function StateFeedback({
  type = "error",
  title,
  description,
  actionText,
  actionLink,
  onAction,
  loading = false,
}) {
  const Icon = icons[type] || AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center"
      role={type === "error" || type === "network" ? "alert" : "status"}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-[#D4A853]/20 bg-[#18181C] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <Icon className="h-10 w-10 text-[#D4A853]" />
      </div>

      <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-8 max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
        {description}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          disabled={loading}
          className="nayamo-btn-primary inline-flex min-w-32 items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {actionText || "Try Again"}
        </button>
      )}

      {!onAction && actionText && actionLink && (
        <Link
          to={actionLink}
          className="nayamo-btn-primary inline-flex items-center gap-2"
        >
          {actionText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </motion.div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Package, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
  search: Search,
};

export default function EmptyState({
  type = "cart",
  title,
  description,
  actionText,
  actionLink,
}) {
  const Icon = icons[type] || ShoppingBag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-24 h-24 rounded-2xl bg-[#18181C] border border-white/[0.06] flex items-center justify-center mb-6 shadow-xl">
        <Icon className="w-10 h-10 text-[#52525B]" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-[#A1A1AA] text-sm max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="nayamo-btn-primary inline-flex items-center gap-2"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </motion.div>
  );
}


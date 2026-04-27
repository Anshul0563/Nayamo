import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Package, Search } from "lucide-react";

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
  search: Search,
};

export default function EmptyState({ type = "cart", title, description, actionText, actionLink }) {
  const Icon = icons[type] || ShoppingBag;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-[#1E1E22] border border-white/[0.06] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#6B7280]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#9CA3AF] text-sm max-w-xs mb-6">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="nayamo-btn-primary text-sm">
          {actionText}
        </Link>
      )}
    </div>
  );
}


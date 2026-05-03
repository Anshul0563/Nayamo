import React from "react";
import PropTypes from "prop-types";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
} from "lucide-react";

export default function KeyInsights({ stats = {} }) {
  const growth = stats.growthRate || 0;
  const lowStock = stats.lowStockProducts || 0;
  const pending = stats.pendingOrders || 0;

  const insights = [
    {
      icon: growth >= 0 ? TrendingUp : TrendingDown,
      title: `Revenue ${growth >= 0 ? "up" : "down"} ${Math.abs(growth).toFixed(1)}%`,
      description:
        growth >= 0
          ? "Strong performance driven by customer engagement."
          : "Revenue dropped — analyze campaign and pricing strategy.",
      color: growth >= 0 ? "emerald" : "rose",
    },
    {
      icon: Package,
      title: `${lowStock} low stock items`,
      description:
        lowStock > 0
          ? "Restock fast-moving products to avoid lost sales."
          : "Inventory levels are healthy.",
      color: lowStock > 0 ? "amber" : "cyan",
    },
    {
      icon: AlertTriangle,
      title: `${pending} orders pending`,
      description:
        pending > 0
          ? "Speed up fulfillment to improve delivery experience."
          : "All orders are processed efficiently.",
      color: pending > 0 ? "violet" : "emerald",
    },
  ];

  return (
    <div className="relative p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 shadow-[0_0_25px_rgba(212,168,83,0.05)]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[#D4A853]/10">
          <Lightbulb className="text-[#D4A853]" size={18} />
        </div>
        <h3 className="text-lg font-semibold text-white tracking-wide">
          Key Insights
        </h3>
      </div>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="group flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#D4A853]/40 hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Icon */}
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#D4A853]/10 transition">
                <Icon
                  size={18}
                  className={`text-${item.color}-400 group-hover:text-[#D4A853]`}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-white font-medium mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_top,rgba(212,168,83,0.1),transparent_70%)]" />
    </div>
  );
}

KeyInsights.propTypes = {
  stats: PropTypes.object,
};
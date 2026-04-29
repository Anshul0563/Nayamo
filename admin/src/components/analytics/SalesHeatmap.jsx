import React, { useMemo } from "react";
import { Calendar, TrendingUp, Zap } from "lucide-react";

const getHeatColor = (orders) => {
  if (orders >= 100) {
    return "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)]";
  }

  if (orders >= 70) {
    return "bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.25)]";
  }

  if (orders >= 40) {
    return "bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_20px_rgba(234,179,8,0.25)]";
  }

  return "bg-gradient-to-br from-slate-500 to-slate-700 shadow-[0_0_20px_rgba(100,116,139,0.2)]";
};

const formatHour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const formatted = hour % 12 === 0 ? 12 : hour % 12;
  return `${formatted} ${suffix}`;
};

export default function SalesHeatmap({ data = [] }) {
  const normalizedData = useMemo(() => {
    const byHour = new Map();
    data.forEach((item) => {
      const hour = item.hour ?? item._id?.hour ?? 0;
      byHour.set(hour, (byHour.get(hour) || 0) + Number(item.orders || 0));
    });
    return Array.from({ length: 24 }, (_, hour) => ({ hour, orders: byHour.get(hour) || 0 }));
  }, [data]);

  const stats = useMemo(() => {
    const peakHour = normalizedData.reduce((max, item) =>
      item.orders > max.orders ? item : max
    );

    const total = normalizedData.reduce((sum, item) => sum + item.orders, 0);
    const average = total / normalizedData.length;

    const highTraffic = normalizedData.filter((item) => item.orders >= 70).length;

    return {
      peakHour,
      total,
      average,
      highTraffic,
    };
  }, [normalizedData]);

  return (
    <div className="glass-card rounded-2xl p-6 space-y-6 border-gold-animated">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-400/30 flex items-center justify-center gold-pulse">
            <Calendar size={20} className="text-orange-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-luxury-text">
              Sales Heatmap
            </h3>

            <p className="text-sm text-luxury-dim">
              Peak Hour:{" "}
              <span className="text-gold-400 font-medium">
                {formatHour(stats.peakHour.hour)}
              </span>{" "}
              ({stats.peakHour.orders} orders)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-luxury-dim">
            24h View
          </div>

          <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            Live Insights
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-12 gap-2">
        {normalizedData.map((item, index) => (
          <div
            key={item.hour}
            className="group relative aspect-square rounded-xl border border-white/10 bg-white/[0.02] p-1.5 overflow-hidden transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:z-10"
            style={{
              animationDelay: `${index * 40}ms`,
            }}
          >
            <div
              className={`${getHeatColor(
                item.orders
              )} h-full w-full rounded-lg transition-transform duration-300 group-hover:scale-105`}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-white drop-shadow-md leading-none">
                {item.orders}
              </span>
              <span className="text-[9px] text-white/80 mt-0.5">
                {item.hour}
              </span>
            </div>

            {/* Tooltip */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[115%] whitespace-nowrap rounded-lg border border-luxury-border bg-luxury-card px-3 py-2 text-xs text-luxury-text opacity-0 shadow-xl transition-all duration-300 group-hover:opacity-100">
              {formatHour(item.hour)} • {item.orders} Orders
            </div>
          </div>
        ))}
      </div>

      {/* Legends */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Peak", "100+", "from-emerald-500 to-emerald-600", "text-emerald-400"],
          ["High", "70-99", "from-blue-500 to-blue-600", "text-blue-400"],
          ["Medium", "40-69", "from-yellow-500 to-yellow-600", "text-yellow-400"],
          ["Low", "<40", "from-slate-500 to-slate-600", "text-slate-400"],
        ].map(([label, range, bg, text]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center gap-3"
          >
            <div className={`w-4 h-4 rounded bg-gradient-to-r ${bg}`} />
            <div>
              <p className={`text-sm font-medium ${text}`}>{label}</p>
              <p className="text-[11px] text-luxury-dim">{range}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 text-luxury-dim text-sm mb-1">
            <TrendingUp size={16} />
            Total Orders
          </div>
          <p className="text-xl font-bold text-luxury-text">
            {stats.total.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 text-luxury-dim text-sm mb-1">
            <Zap size={16} />
            Avg / Hour
          </div>
          <p className="text-xl font-bold text-gold-400">
            {Math.round(stats.average)}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-2 text-luxury-dim text-sm mb-1">
            <Calendar size={16} />
            High Traffic Hours
          </div>
          <p className="text-xl font-bold text-blue-400">
            {stats.highTraffic}
          </p>
        </div>
      </div>
    </div>
  );
}

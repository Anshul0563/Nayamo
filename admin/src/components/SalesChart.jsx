import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const ranges = ["7d", "30d", "90d"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#0d0d0d] border border-white/10 p-3 rounded-lg">
      <p className="text-xs text-gray-400 mb-2">{label}</p>

      {payload.map((item, i) => (
        <div key={i} className="flex justify-between text-sm gap-4">
          <span className="text-gray-400">{item.name}</span>
          <span className="text-[#D4A853] font-semibold">
            {item.name === "Revenue"
              ? `₹${Number(item.value).toLocaleString("en-IN")}`
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function SalesChart({
  data = [],
  loading,
  onRangeChange,
}) {
  const [metric, setMetric] = useState("revenue");
  const [range, setRange] = useState("30d");

  // 🔥 notify parent when range changes
  useEffect(() => {
    if (onRangeChange) onRangeChange(range);
  }, [range]);

  // 🔥 normalize data
  const formatted = (data || []).map((d) => ({
    date: d.date || d.day || "",
    revenue: Number(d.revenue || d.totalRevenue || 0),
    orders: Number(d.orders || d.totalOrders || 0),
  }));

  // 🔥 auto-refresh every 20s
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRangeChange) onRangeChange(range);
    }, 20000);
    return () => clearInterval(interval);
  }, [range]);

  if (loading) {
    return (
      <div className="h-[350px] flex items-center justify-center text-gray-400">
        Loading chart...
      </div>
    );
  }

  if (!formatted.length) {
    return (
      <div className="h-[350px] flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="text-white font-semibold text-lg">
            Sales Overview
          </h3>
          <p className="text-xs text-gray-500">
            Real-time business analytics
          </p>
        </div>

        {/* RANGE FILTER */}
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                range === r
                  ? "bg-[#D4A853] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC TOGGLE */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setMetric("revenue")}
          className={`px-3 py-1 rounded-lg text-xs ${
            metric === "revenue"
              ? "bg-[#D4A853] text-black"
              : "bg-white/5 text-gray-400"
          }`}
        >
          Revenue
        </button>

        <button
          onClick={() => setMetric("orders")}
          className={`px-3 py-1 rounded-lg text-xs ${
            metric === "orders"
              ? "bg-[#D4A853] text-black"
              : "bg-white/5 text-gray-400"
          }`}
        >
          Orders
        </button>
      </div>

      {/* CHART */}
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4A853" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#D4A853" stopOpacity="0" />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey={metric}
              stroke="#D4A853"
              fill="url(#gold)"
              strokeWidth={2}
              name={metric === "revenue" ? "Revenue" : "Orders"}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

function AnimatedCounter({ end, duration = 1200, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  prefix = "",
  suffix = "",
  onClick,
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      className="group relative p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-[#D4A853]/40 shadow-[0_0_20px_rgba(212,168,83,0.05)] hover:shadow-[0_0_35px_rgba(212,168,83,0.15)] transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_top,rgba(212,168,83,0.12),transparent_70%)]" />

      {/* Top Row */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs uppercase tracking-wider text-gray-400">
          {title}
        </p>

        {Icon && (
          <div className="p-2 rounded-lg bg-white/5 group-hover:bg-[#D4A853]/10 transition">
            <Icon size={18} className="text-gray-400 group-hover:text-[#D4A853]" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl md:text-4xl font-bold text-white mb-4">
        <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className="flex items-center gap-2 text-sm font-medium">
          {trend >= 0 ? (
            <TrendingUp size={16} className="text-emerald-400" />
          ) : (
            <TrendingDown size={16} className="text-rose-400" />
          )}

          <span
            className={`${
              trend >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {Math.abs(trend)}%
          </span>

          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
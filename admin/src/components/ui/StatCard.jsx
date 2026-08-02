import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
  const numericTrend =
    typeof trend === "number" ? trend : trend === "down" ? -1 : trend === "up" ? 1 : undefined;
  const isIconElement = React.isValidElement(Icon);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className="group relative overflow-hidden rounded-2xl border border-luxury-border/70 bg-luxury-card/80 p-6 shadow-[0_10px_35px_rgba(0,0,0,0.12)] transition-all duration-500 hover:border-gold-400/40 hover:shadow-[0_18px_45px_rgba(212,168,83,0.16)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,168,83,0.14),transparent_62%)] opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative flex items-center justify-between mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-luxury-muted">
          {title}
        </p>

        {Icon && (
          <div className="rounded-xl border border-luxury-border/60 bg-luxury-surface/70 p-2 transition group-hover:border-gold-400/30 group-hover:bg-gold-500/10">
            {isIconElement
              ? React.cloneElement(Icon, {
                  className: [
                    Icon.props.className,
                    "text-luxury-muted group-hover:text-gold-400",
                  ]
                    .filter(Boolean)
                    .join(" "),
                })
              : (
                <Icon
                  size={18}
                  className="text-luxury-muted group-hover:text-gold-400"
                />
              )}
          </div>
        )}
      </div>

      <div className="relative text-3xl font-semibold text-luxury-text md:text-4xl">
        <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
      </div>

      {numericTrend !== undefined && (
        <div className="relative mt-4 flex items-center gap-2 text-sm font-medium">
          {numericTrend >= 0 ? (
            <TrendingUp size={16} className="text-emerald-400" />
          ) : (
            <TrendingDown size={16} className="text-rose-400" />
          )}

          <span className={numericTrend >= 0 ? "text-emerald-400" : "text-rose-400"}>
            {Math.abs(numericTrend)}%
          </span>

          <span className="text-luxury-dim">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}

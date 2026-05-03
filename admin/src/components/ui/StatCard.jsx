import React, { useEffect, useRef, useState, cloneElement } from "react";
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from "lucide-react";

function AnimatedCounter({ end, duration = 1500, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutCubic * end));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const timer = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
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
  color = "gold",
  trend,
  trendLabel,
  delay = 0,
  prefix = "",
  suffix = "",
  onClick
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const colorClasses = {
    gold: "from-gold-500 to-amber-500 text-gold-400",
    emerald: "from-emerald-500 to-teal-500 text-emerald-400",
    cyan: "from-cyan-500 to-blue-500 text-cyan-400",
    rose: "from-rose-500 to-pink-500 text-rose-400",
    violet: "from-violet-500 to-purple-500 text-violet-400",
    orange: "from-orange-500 to-red-500 text-orange-400"
  };

  const themeColor = colorClasses[color] || colorClasses.gold;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick();
  };

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card p-6 md:p-8 rounded-3xl border-2 border-white/20 hover:border-gold-500/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-gold-glow hover:-translate-y-2 hover:scale-[1.02] group relative overflow-hidden bg-gradient-to-br from-white/5 via-transparent to-black/5 backdrop-blur-xl ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={handleClick}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Premium background glow */}
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10" 
           style={{ background: `linear-gradient(90deg, var(--gold-400), var(--emerald-400))` }} />
      
      {/* Left Column - Icon + Title */}
      <div className="flex items-start">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 border border-white/20 mr-4 flex-shrink-0 mt-1 group-hover:bg-white/20 transition-all">
          {Icon && typeof Icon === 'object' && Icon.props ? (
            cloneElement(Icon, { size: 24, className: `text-${color}-400 group-hover:scale-110 transition-all duration-300` })
          ) : (
            <Icon size={24} className={`text-${color}-400 group-hover:scale-110 transition-all duration-300`} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-luxury-muted uppercase tracking-wide group-hover:text-white/80 transition-colors mb-1">
            {title}
          </p>
        </div>
      </div>

      {/* LARGE CENTRAL VALUE */}
      <div className="mt-4">
        <div className="text-4xl md:text-5xl font-display font-black bg-gradient-to-r from-white via-luxury-text to-gold-400 bg-clip-text text-transparent leading-tight">
          <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
        </div>
      </div>

      {/* CLEAN TREND INDICATOR */}
      {trend !== undefined && (
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
          <div className={`flex-1 h-2 rounded-full overflow-hidden bg-white/10`}>
            <div className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${themeColor} group-hover:shadow-md`} 
                 style={{ width: `${Math.min(100, Math.abs(trend) * 5)}%` }} />
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm font-bold ${
              trend >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{Math.abs(trend)}%</span>
            </div>
            {trendLabel && (
              <span className="text-xs text-luxury-dim block">{trendLabel}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

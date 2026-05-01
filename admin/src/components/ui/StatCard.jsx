import React, { useEffect, useRef, useState, cloneElement } from "react";
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
      
      // Ease out cubic
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
  suffix = ""
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  const colorMap = {
    gold: {
      iconBg: "bg-gold-500/10",
      iconColor: "text-gold-400",
      border: "border-gold-500/20",
      glow: "shadow-gold-sm",
      gradient: "from-gold-500/5 to-transparent",
    },
    emerald: {
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
      gradient: "from-emerald-500/5 to-transparent",
    },
    cyan: {
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
      gradient: "from-cyan-500/5 to-transparent",
    },
    rose: {
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
      border: "border-rose-500/20",
      glow: "shadow-rose-500/10",
      gradient: "from-rose-500/5 to-transparent",
    },
    violet: {
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
      border: "border-violet-500/20",
      glow: "shadow-violet-500/10",
      gradient: "from-violet-500/5 to-transparent",
    },
    orange: {
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      border: "border-orange-500/20",
      glow: "shadow-orange-500/10",
      gradient: "from-orange-500/5 to-transparent",
    },
  };

  const theme = colorMap[color] || colorMap.gold;

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

  return (
    <div
      ref={cardRef}
      className={`glass-card p-5 md:p-6 border-gold-animated transition-all duration-500 ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} pointer-events-none opacity-50`} />
      
<div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm text-luxury-muted font-medium">{title}</p>
          <div className={`p-2.5 rounded-xl ${theme.iconBg} ${theme.border} border`}>
            {/* Handle both component references (Icons) and JSX elements (<Icon />) */}
            {Icon && typeof Icon === 'object' && Icon.props ? (
              cloneElement(Icon, { size: 18, className: `${theme.iconColor} ${Icon.props.className || ''}` })
            ) : (
              <Icon size={18} className={theme.iconColor} />
            )}
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-bold text-luxury-text mt-4">
          <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
        </h2>

        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}>
              {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(trend)}%</span>
            </div>
            {trendLabel && (
              <span className="text-xs text-luxury-dim">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


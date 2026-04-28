import React from "react";
import logoImg from "../../assets/logo.png";

export default function Logo({ size = "sm", showText = true, glow = false, className = "" }) {
  const heightClass = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14 md:h-16",
    xl: "h-16 md:h-20",
    "2xl": "h-20 md:h-24",
    nav: "h-20 sm:h-24 md:h-28",
  }[size] || "h-8";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`shrink-0 ${glow ? "p-1.5 rounded-2xl bg-gradient-to-br from-[#D4A853]/25 to-[#C9963B]/10 border border-[#D4A853]/25 shadow-[0_0_28px_rgba(212,168,83,0.22)]" : ""}`}
      >
        <img
          src={logoImg}
          alt="Nayamo"
          className={`${heightClass} w-auto object-contain drop-shadow-[0_10px_24px_rgba(212,168,83,0.12)]`}
          draggable={false}
        />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white font-serif">
          Nayamo
        </span>
      )}
    </div>
  );
}

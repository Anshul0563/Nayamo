import React from "react";
import logoImg from "../../assets/logo.png";

export default function Logo({ size = "sm", showText = true, glow = false, className = "" }) {
  const heightClass = {
    sm: "h-8",
    md: "h-10",
    lg: "h-14",
    xl: "h-16",
    "2xl": "h-20",
  }[size] || "h-8";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${glow ? "p-1 rounded-xl bg-gradient-to-br from-[#D4A853]/30 to-[#C9963B]/20 border border-[#D4A853]/30 shadow-[0_0_20px_rgba(212,168,83,0.25)]" : ""}`}
      >
        <img
          src={logoImg}
          alt="Nayamo"
          className={`${heightClass} w-auto object-contain`}
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


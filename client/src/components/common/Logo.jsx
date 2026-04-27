import React from "react";
import logoImg from "../../assets/logo.png";

export default function Logo({ size = "sm", showText = true, className = "" }) {
  const heightClass = { sm: "h-8", md: "h-10", lg: "h-14" }[size] || "h-8";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoImg}
        alt="Nayamo"
        className={`${heightClass} w-auto object-contain`}
        draggable={false}
      />
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white font-serif">
          Nayamo
        </span>
      )}
    </div>
  );
}

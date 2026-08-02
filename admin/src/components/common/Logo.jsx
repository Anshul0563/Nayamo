import React from "react";
import logoImg from "../../assets/logo.png";

export default function Logo({ size = "sm", showText = false, className = "" }) {
  const heightClass = { sm: "h-8", md: "h-10", lg: "h-14" }[size] || "h-8";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={logoImg}
        alt="Nayamo"
        className={`${heightClass} aspect-square w-auto rounded-full object-cover ring-1 ring-amber-300/70 shadow-[0_0_14px_rgba(251,191,36,0.3)]`}
        draggable={false}
      />
      {showText && (
        <span className="text-xl font-bold tracking-tight text-white">
          Nayamo
        </span>
      )}
    </div>
  );
}

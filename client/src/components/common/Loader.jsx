import React from "react";

export default function Loader({ size = 32, className = "" }) {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4A853]/30 via-transparent to-[#D4A853]/10 blur-xl opacity-80" />
      <span className="relative flex h-full w-full items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-[3px] border-[#D4A853]/15 border-t-[#D4A853] animate-spin"
          style={{ boxShadow: "0 0 18px rgba(212,168,83,0.35)" }}
        />
        <span className="relative block h-2/5 w-2/5 rounded-full bg-[#070708] shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
      </span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="nayamo-card p-3 animate-pulse border border-white/[0.03]">
      <div className="aspect-[3/4] bg-[#131316] rounded-xl mb-3" />
      <div className="h-4 bg-[#131316] rounded-lg w-3/4 mb-2.5" />
      <div className="h-4 bg-[#131316] rounded-lg w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}


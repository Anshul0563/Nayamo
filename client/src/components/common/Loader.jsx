import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-[#D4A853]"
        style={{ filter: "drop-shadow(0 0 8px rgba(212,168,83,0.3))" }}
      />
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


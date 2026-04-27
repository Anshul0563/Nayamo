import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-[#D4A853]" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="nayamo-card p-3 animate-pulse">
      <div className="aspect-square bg-[#1A1A1C] rounded-xl mb-3" />
      <div className="h-4 bg-[#1A1A1C] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#1A1A1C] rounded w-1/2" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}


import React from "react";
import Loader from "./Loader";

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md pointer-events-auto">
      <div className="relative flex flex-col items-center gap-3 rounded-[32px] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_0_60px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/10 via-transparent to-[#D4A5A5]/10" />
        <div className="relative flex flex-col items-center gap-2">
          <div className="text-sm uppercase tracking-[0.22em] text-[#F8F3DF] opacity-90">Loading...</div>
          <div className="text-xs text-[#D4A853]/80">Please wait while we load your content</div>
        </div>
        <Loader size={52} />
      </div>
    </div>
  );
}

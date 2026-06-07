import React from "react";
import Loader from "./Loader";

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-black/85 p-5 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
        <div className="text-white text-sm tracking-[0.18em] uppercase text-center">Loading...</div>
        <Loader size={44} />
      </div>
    </div>
  );
}

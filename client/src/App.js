import React from "react";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <p className="text-sm tracking-[0.4em] text-zinc-400 mb-4">NAYAMO</p>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Coming Soon</h1>
        <p className="text-zinc-400 text-lg md:text-xl mb-8">
          A premium jewellery shopping experience is launching soon.
        </p>
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
          <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Website under development</span>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Sparkles, Gem, ArrowRight } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white overflow-hidden relative flex items-center justify-center px-6">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-pink-500 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 h-52 w-52 rounded-full bg-indigo-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="text-sm tracking-widest text-zinc-300">NAYAMO LUXURY</span>
        </div>

        <div className="mx-auto h-20 w-20 rounded-3xl bg-white/5 border border-white/10 grid place-items-center mb-6 shadow-2xl">
          <Gem size={34} className="text-amber-400" />
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
          Something <span className="text-amber-400">Beautiful</span>
          <br /> is Coming Soon
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
          Premium earrings, necklaces, payal and timeless jewellery styles crafted for your next shine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-2 transition">
            Launching Soon <ArrowRight size={18} />
          </button>

          <div className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 text-zinc-300">
            Website Under Development
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Collection</p>
            <h3 className="font-semibold mt-1">Elegant Jewellery</h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Quality</p>
            <h3 className="font-semibold mt-1">Premium Finish</h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-zinc-400">Brand</p>
            <h3 className="font-semibold mt-1">Nayamo</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

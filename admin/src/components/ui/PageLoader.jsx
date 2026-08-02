import { Loader2, Sparkles } from "lucide-react";

export default function PageLoader({ label = "Loading admin workspace" }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-luxury-border/70 bg-luxury-card/80 px-8 py-7 shadow-[0_10px_35px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-center rounded-full border border-gold-400/25 bg-gold-500/10 p-3">
          <Loader2 className="h-6 w-6 animate-spin text-gold-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-luxury-text">{label}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-luxury-dim">
            <Sparkles className="h-3.5 w-3.5" />
            Preparing a polished experience
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-4 animate-pulse rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="shimmer h-3 w-24 rounded bg-white/5" />
        <div className="shimmer h-8 w-8 rounded-lg bg-white/5" />
      </div>

      <div className="shimmer h-8 w-32 rounded bg-white/5" />
      <div className="shimmer h-2 w-full rounded bg-white/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 rounded-xl animate-pulse hover:bg-white/[0.02] transition">
      <div className="shimmer h-10 w-10 rounded-xl bg-white/5" />

      <div className="flex-1 space-y-2">
        <div className="shimmer h-3 w-3/4 rounded bg-white/5" />
        <div className="shimmer h-2 w-1/2 rounded bg-white/5" />
      </div>

      <div className="shimmer h-6 w-16 rounded-full bg-white/5" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="glass-card p-2 rounded-2xl space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-card p-6 space-y-4 rounded-2xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="shimmer h-3 w-20 rounded bg-white/5" />
        <div className="shimmer h-10 w-10 rounded-2xl bg-white/5" />
      </div>

      <div className="shimmer h-10 w-28 rounded bg-white/5" />
      <div className="shimmer h-2 w-16 rounded bg-white/5" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6 rounded-2xl h-96 flex flex-col gap-4 animate-pulse">
      <div className="shimmer h-5 w-40 rounded bg-white/5" />

      <div className="flex-1 rounded-xl bg-white/[0.03] p-4 flex items-end gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="shimmer rounded-t-md bg-white/5 w-full"
            style={{
              height: `${30 + (i % 5) * 20}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Banner */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="shimmer h-6 w-52 rounded bg-white/5 mb-4" />
        <div className="shimmer h-3 w-80 max-w-full rounded bg-white/5 mb-3" />
        <div className="shimmer h-3 w-64 max-w-full rounded bg-white/5" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <SkeletonChart />
        </div>

        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable rows={6} />
    </div>
  );
}
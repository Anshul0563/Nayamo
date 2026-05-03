import React from 'react';
import { SkeletonCard, SkeletonChart, SkeletonTable } from '../ui/Skeleton';

export function EnhancedDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero + Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-8 md:p-10 rounded-3xl">
          <div className="shimmer h-8 w-64 rounded bg-white/5 mb-6" />
          <div className="grid md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center p-4">
                <div className="shimmer h-12 w-24 mx-auto rounded bg-white/10 mb-2" />
                <div className="shimmer h-4 w-20 mx-auto rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions Skeleton */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="shimmer h-5 w-32 rounded bg-white/5 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl space-y-2">
                <div className="shimmer h-10 w-10 mx-auto rounded-xl bg-white/10" />
                <div className="shimmer h-3 w-16 mx-auto rounded bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights + Notification Ticker */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="shimmer h-10 w-10 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            <div>
              <div className="shimmer h-6 w-40 rounded bg-white/10" />
              <div className="shimmer h-3 w-32 rounded bg-white/5 mt-1" />
            </div>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl space-y-2">
                <div className="flex items-start gap-4">
                  <div className="shimmer h-10 w-10 rounded-xl bg-white/10" />
                  <div className="space-y-2 flex-1">
                    <div className="shimmer h-4 w-48 rounded bg-white/10" />
                    <div className="shimmer h-3 w-full rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Ticker Skeleton */}
        <div className="glass-card p-4 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="shimmer h-10 w-10 rounded-xl bg-white/10" />
            <div className="shimmer h-4 w-20 rounded bg-white/5" />
            <div className="shimmer h-6 w-12 ml-auto rounded-full bg-white/5" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 flex-1">
                <div className="shimmer h-8 w-8 rounded-lg bg-white/10" />
                <div className="space-y-1 flex-1">
                  <div className="shimmer h-3 w-32 rounded bg-white/10" />
                  <div className="shimmer h-2 w-20 rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>

      {/* Orders Table */}
      <SkeletonTable rows={6} />
    </div>
  );
}

export default EnhancedDashboardSkeleton;

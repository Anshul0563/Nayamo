import React from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

const GROWTH_DATA = [
  { period: 'Today', current: 847, previous: 723, change: 17.1, trend: 'up', color: 'emerald' },
  { period: 'This Week', current: 5240, previous: 4560, change: 14.9, trend: 'up', color: 'blue' },
  { period: 'This Month', current: 24500, previous: 19800, change: 23.7, trend: 'up', color: 'gold' },
  { period: 'This Year', current: 289000, previous: 234000, change: 23.5, trend: 'up', color: 'purple' },
];

export default function GrowthComparison({ data = GROWTH_DATA }) {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
          <BarChart3 size={20} className="text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-luxury-text">Growth Comparison</h3>
          <p className="text-sm text-luxury-dim">vs previous period</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const Icon = item.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = item.trend === 'up' ? 'emerald' : 'rose';
          
          return (
            <div key={item.period} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                  <Calendar size={16} className={`text-${item.color}-400`} />
                </div>
                <div>
                  <p className="font-semibold text-luxury-text">{item.period}</p>
                  <p className="text-xs text-luxury-dim">Current: ₹{item.current.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Icon size={20} className={`text-${trendColor}-400`} />
                <span className={`font-bold text-lg ${item.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.change}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


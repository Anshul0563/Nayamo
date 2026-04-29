import React from 'react';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

export default function GrowthComparison({ data = [] }) {
  const colorMap = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    gold: "bg-gold-500/10 border-gold-500/20 text-gold-400",
    purple: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  };
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
        {data.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-luxury-dim">No growth data yet</div>
        ) : data.map((item) => {
          const Icon = item.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = item.trend === 'up' ? 'emerald' : 'rose';
          
          return (
            <div key={item.period} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.02] transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${colorMap[item.color] || colorMap.gold}`}>
                  <Calendar size={16} />
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

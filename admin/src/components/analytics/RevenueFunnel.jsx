import React from 'react';
import { Funnel } from 'lucide-react';

const colors = ['from-blue-500 to-blue-600', 'from-indigo-500 to-indigo-600', 'from-purple-500 to-purple-600', 'from-emerald-500 to-emerald-600'];

export default function RevenueFunnel({ data = [] }) {
  const totalVisitors = data[0]?.value || 1;
  const conversionRate = ((data[data.length - 1]?.value / totalVisitors) * 100).toFixed(1);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
          <Funnel size={20} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-luxury-text">Sales Funnel</h3>
          <p className="text-sm text-luxury-dim">Conversion rate: <span className="font-bold text-emerald-400">{conversionRate}%</span></p>
        </div>
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-luxury-dim">No funnel data yet</div>
        ) : data.map((item, index) => (
          <div key={item.stage} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-luxury-text">{item.stage}</span>
              <span className="text-sm font-bold text-gold-400">{item.value.toLocaleString()}</span>
            </div>
            <div className="relative h-3 rounded-full bg-white/5 overflow-hidden group-hover:shadow-gold-sm transition-all">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${item.color || colors[index % colors.length]} shadow-lg`}
                style={{ width: `${(item.value / totalVisitors) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

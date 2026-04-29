import React from 'react';
import { Funnel, TrendingUp, ShoppingCart, PackageCheck, CheckCircle } from 'lucide-react';

const FUNNEL_DATA = [
  { stage: 'Visitors', value: 12500, color: 'from-blue-500 to-blue-600' },
  { stage: 'Added to Cart', value: 3240, color: 'from-indigo-500 to-indigo-600' },
  { stage: 'Checkout', value: 1560, color: 'from-purple-500 to-purple-600' },
  { stage: 'Purchased', value: 847, color: 'from-emerald-500 to-emerald-600' },
];

export default function RevenueFunnel({ data = FUNNEL_DATA }) {
  const totalVisitors = data[0]?.value || 12500;
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
        {data.map((item, index) => (
          <div key={item.stage} className="group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-luxury-text">{item.stage}</span>
              <span className="text-sm font-bold text-gold-400">{item.value.toLocaleString()}</span>
            </div>
            <div className="relative h-3 rounded-full bg-white/5 overflow-hidden group-hover:shadow-gold-sm transition-all">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${item.color} shadow-lg`}
                style={{ width: `${(item.value / totalVisitors) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


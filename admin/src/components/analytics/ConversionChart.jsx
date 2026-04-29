import React from 'react';
import { 
  ArrowRight, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle,
  Users 
} from 'lucide-react';

const icons = [Users, ShoppingCart, CreditCard, CheckCircle];
const colors = ['text-blue-400', 'text-indigo-400', 'text-orange-400', 'text-emerald-400'];

export default function ConversionChart({ data = [] }) {
  const firstValue = data[0]?.value || 1;
  const normalized = data.map((item, index) => ({
    ...item,
    rate: item.rate || `${((Number(item.value || 0) / firstValue) * 100).toFixed(1)}%`,
    icon: item.icon || icons[index % icons.length],
    color: item.color || colors[index % colors.length],
  }));

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
          <ArrowRight size={20} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-luxury-text">Conversion Funnel</h3>
          <p className="text-sm text-luxury-dim">End-to-end customer journey</p>
        </div>
      </div>

      <div className="space-y-4">
        {normalized.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-luxury-dim">No conversion data yet</div>
        ) : normalized.map((item, index) => (
          <div key={item.stage} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
            {/* Icon */}
            <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${item.color}`}>
              <item.icon size={16} className={item.color} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-luxury-text text-sm">{item.stage}</span>
                <span className="text-lg font-bold text-luxury-text">{item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 mt-1.5">
                <div 
                  className={`h-1.5 rounded-full ${item.color.replace('text-', 'bg-')} shadow-sm`}
                  style={{ width: item.rate.replace('%', '') }}
                />
              </div>
              <p className="text-xs text-luxury-dim mt-1">{item.rate}</p>
            </div>

            {/* Arrow */}
            <ArrowRight size={16} className="text-luxury-dim flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* Final conversion summary */}
      <div className="mt-6 pt-6 border-t border-luxury-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-luxury-dim">Overall Conversion Rate</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            {normalized[normalized.length - 1]?.rate || "0%"}
          </span>
        </div>
      </div>
    </div>
  );
}

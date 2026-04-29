import React from 'react';
import { 
  ArrowRight, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle,
  Users 
} from 'lucide-react';

const CONVERSION_DATA = [
  { stage: 'Visitors', value: 12500, rate: '100%', icon: Users, color: 'text-blue-400' },
  { stage: 'Product Views', value: 8560, rate: '68.5%', icon: ShoppingCart, color: 'text-indigo-400' },
  { stage: 'Add to Cart', value: 3240, rate: '25.9%', icon: ShoppingCart, color: 'text-purple-400' },
  { stage: 'Initiate Checkout', value: 1560, rate: '12.5%', icon: CreditCard, color: 'text-orange-400' },
  { stage: 'Purchase Complete', value: 847, rate: '6.8%', icon: CheckCircle, color: 'text-emerald-400' },
];

export default function ConversionChart({ data = CONVERSION_DATA }) {
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
        {data.map((item, index) => (
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
            {data[data.length - 1]?.rate}
          </span>
        </div>
      </div>
    </div>
  );
}


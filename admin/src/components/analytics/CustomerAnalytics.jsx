import React, { useMemo } from 'react';
import { Users, UserPlus, UserMinus, Crown, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const colorMap = {
  gold: "text-gold-400 border-gold-500/20 bg-gold-500/10",
  emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
  violet: "text-violet-400 border-violet-500/20 bg-violet-500/10",
};

export default function CustomerAnalytics({ data = {} }) {
  const {
    totalCustomers = 0,
    newCustomers = 0,
    returningCustomers = 0,
    churnRate = 0,
    customerGrowth = 0,
    segments = [],
    topCustomers = [],
    weeklyData = [],
  } = data;

  const segmentData = useMemo(() => {
    if (segments.length > 0) return segments;
    // Default segments if no data
    return [
      { name: 'New', count: newCustomers, color: 'emerald', growth: 12 },
      { name: 'Returning', count: returningCustomers, color: 'blue', growth: 8 },
      { name: 'VIP', count: Math.floor(totalCustomers * 0.1), color: 'gold', growth: 15 },
      { name: 'At Risk', count: Math.floor(totalCustomers * 0.05), color: 'rose', growth: -5 },
    ];
  }, [segments, newCustomers, returningCustomers, totalCustomers]);

  const totalSegmentCount = segmentData.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Customer Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users size={18} className="text-blue-400" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              customerGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {customerGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(customerGrowth)}%</span>
            </div>
          </div>
          <p className="text-sm text-luxury-dim">Total Customers</p>
          <p className="text-2xl font-bold text-luxury-text">{totalCustomers.toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <UserPlus size={18} className="text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400 font-medium">+{newCustomers}</span>
          </div>
          <p className="text-sm text-luxury-dim">New This Week</p>
          <p className="text-2xl font-bold text-luxury-text">{newCustomers.toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Crown size={18} className="text-violet-400" />
            </div>
          </div>
          <p className="text-sm text-luxury-dim">VIP Customers</p>
          <p className="text-2xl font-bold text-luxury-text">{Math.floor(totalCustomers * 0.1).toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <UserMinus size={18} className="text-rose-400" />
            </div>
            <span className={`text-xs font-medium ${churnRate > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {churnRate}%
            </span>
          </div>
          <p className="text-sm text-luxury-dim">Churn Rate</p>
          <p className="text-2xl font-bold text-luxury-text">{churnRate}%</p>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-luxury-text">Customer Segments</h3>
            <p className="text-sm text-luxury-dim">Customer distribution by segment</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {segmentData.map((segment) => (
            <div 
              key={segment.name} 
              className="group p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-luxury-text">{segment.name}</span>
                <div className={`flex items-center gap-1 text-xs ${
                  segment.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {segment.growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{Math.abs(segment.growth)}%</span>
                </div>
              </div>
              
              <div className="flex items-end gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      segment.color === 'gold' ? 'bg-gold-500' :
                      segment.color === 'emerald' ? 'bg-emerald-500' :
                      segment.color === 'blue' ? 'bg-blue-500' :
                      'bg-rose-500'
                    }`}
                    style={{ width: totalSegmentCount > 0 ? `${(segment.count / totalSegmentCount) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-lg font-bold text-luxury-text">{segment.count.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers by Revenue */}
      {topCustomers?.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl flex items-center justify-center">
              <Crown size={20} className="text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-luxury-text">Top Customers</h3>
              <p className="text-sm text-luxury-dim">By total revenue</p>
            </div>
          </div>

          <div className="space-y-3">
            {topCustomers.slice(0, 5).map((customer, index) => (
              <div 
                key={customer._id || customer.id || index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-all"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-gold-500/20 text-gold-400' :
                  index === 1 ? 'bg-slate-400/20 text-slate-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-white/5 text-luxury-dim'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-luxury-text truncate">{customer.name || customer.email}</p>
                  <p className="text-xs text-luxury-dim">{customer.orders} orders</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-gold-400">₹{Number(customer.totalSpent || customer.revenue || 0).toLocaleString()}</p>
                </div>
                
                <ArrowRight size={16} className="text-luxury-dim" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Trend */}
      {weeklyData?.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-luxury-text">Weekly Trend</h3>
              <p className="text-sm text-luxury-dim">New customer growth</p>
            </div>
          </div>

          <div className="flex items-end gap-2 h-32">
            {weeklyData.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg hover:from-blue-500 hover:to-blue-400 transition-all relative group"
                  style={{ height: `${(day.count / Math.max(...weeklyData.map(d => d.count), 1)) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-card border border-luxury-border rounded-lg text-xs text-luxury-text opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.count} customers
                  </div>
                </div>
                <span className="text-[10px] text-luxury-dim">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

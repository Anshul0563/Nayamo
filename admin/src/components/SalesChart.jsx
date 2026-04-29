import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from 'recharts';

// Luxury gradient defs for Recharts
const GRADIENT_ID = 'goldGradient';
const REVENUE_GRADIENT_ID = 'revenueGradient';

// Custom Tooltip for luxury theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 rounded-xl border-gold-500/20 shadow-gold-sm min-w-[180px]">
        <p className="text-sm font-medium text-luxury-text mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className={`w-3 h-3 rounded-full`}
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium text-luxury-text">{entry.name}:</span>
              <span className="ml-auto font-bold text-gold-400">
                {typeof entry.value === 'number' ? `₹${entry.value.toLocaleString()}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data = [], loading = false, height = 350 }) {
  const [defs, setDefs] = useState('');

  useEffect(() => {
    setDefs(`
      <defs>
        <linearGradient id="${GRADIENT_ID}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212, 150, 42, 0.8)" />
          <stop offset="50%" stopColor="rgba(212, 150, 42, 0.3)" />
          <stop offset="100%" stopColor="rgba(212, 150, 42, 0.05)" />
        </linearGradient>
        <linearGradient id="${REVENUE_GRADIENT_ID}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4962a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f5e0b3" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    `);
  }, []);

  if (loading || !data || data.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl h-[350px] flex flex-col gap-4 animate-pulse">
        <div className="shimmer h-5 w-40 rounded bg-white/5" />
        <div className="flex-1 rounded-xl bg-white/[0.03] shimmer" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-luxury-text">Sales Overview</h3>
          <p className="text-sm text-luxury-dim mt-1">Revenue & Orders - Live Data</p>
        </div>
        <div className="text-xs text-gold-400 font-medium bg-gold-500/10 px-3 py-1.5 rounded-full border border-gold-500/20">
          LIVE
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs dangerouslySetInnerHTML={{ __html: defs }} />
            <CartesianGrid 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
              strokeDasharray="3 3"
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500 }}
              tickMargin={12}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tickFormatter={(value) => `₹${value / 1000}K`}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-sm font-medium text-luxury-text">{value}</span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#d4962a" 
              strokeWidth={3}
              fillOpacity={1}
              fill={`url(#${REVENUE_GRADIENT_ID})`}
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="rgba(212,150,42,0.6)"
              strokeWidth={2}
              fill={`url(#${GRADIENT_ID})`}
              name="Orders"
              yAxisId="right"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


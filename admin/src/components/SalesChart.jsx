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
      <div className="bg-white/95 dark:bg-neutral-900/95 p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg min-w-[180px]">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color || '#d4a853' }}
              />
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{entry.name}:</span>
              <span className="ml-auto font-bold text-gold-600">
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

export default function SalesChart({ data = [], loading = false, height = 350, dateRange, onDateChange }) {
  const [defs, setDefs] = useState('');
  const [selectedRange, setSelectedRange] = useState('30d');

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

  useEffect(() => {
    if (onDateChange) onDateChange(selectedRange);
  }, [selectedRange]);

  if (loading || !data || data.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-neutral-900/80 p-8 rounded-2xl h-[350px] flex flex-col gap-6 animate-pulse border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
        <div className="h-6 w-48 bg-neutral-200/50 dark:bg-neutral-700 rounded" />
        <div className="flex-1 bg-neutral-200/30 dark:bg-neutral-800/30 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 p-8 rounded-2xl h-full min-h-[400px] border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Sales Overview</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Revenue and orders trend</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold bg-gold-500/10 text-gold-700 px-3 py-1.5 rounded-lg border border-gold-400/30">
            LIVE
          </div>
          <select 
            className="bg-white dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700 px-4 py-2 rounded-lg text-sm font-medium text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-gold-400 focus:border-gold-400 transition-all"
            onChange={(e) => onDateChange && onDateChange(e.target.value)}
            value={dateRange || '30d'}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="365d">1 Year</option>
          </select>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs dangerouslySetInnerHTML={{ __html: defs }} />
            <CartesianGrid 
              vertical={false} 
              stroke="rgba(0,0,0,0.05)" 
              strokeDasharray="4 4"
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 500 }}
              tickMargin={12}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tickFormatter={(value) => `₹${value / 1000}K`}
              tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '16px' }}
              formatter={(value) => (
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{value}</span>
              )}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#d4962a" 
              strokeWidth={3}
              fillOpacity={0.6}
              fill={`url(#${REVENUE_GRADIENT_ID})`}
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#a68a4e"
              strokeWidth={2}
              fillOpacity={0.4}
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


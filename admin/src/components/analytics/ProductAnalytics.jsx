import React, { useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, Star, ArrowRight, Tag, Eye, Heart, ShoppingCart } from 'lucide-react';

export default function ProductAnalytics({ data = {} }) {
  const {
    totalProducts = 0,
    totalSales = 0,
    totalRevenue = 0,
    avgPrice = 0,
    stockValue = 0,
    lowStockCount = 0,
    topProducts = [],
    categoryData = [],
    recentProducts = [],
    weeklyTrend = [],
  } = data;

  // Normalize category data
  const normalizedCategories = useMemo(() => {
    if (categoryData.length > 0) return categoryData;
    // Default categories with better formatting
    return [
      { name: 'Necklaces', sales: Math.floor(totalSales * 0.3), revenue: Math.floor(totalRevenue * 0.35), color: 'gold' },
      { name: 'Rings', sales: Math.floor(totalSales * 0.25), revenue: Math.floor(totalRevenue * 0.25), color: 'violet' },
      { name: 'Earrings', sales: Math.floor(totalSales * 0.2), revenue: Math.floor(totalRevenue * 0.2), color: 'emerald' },
      { name: 'Bracelets', sales: Math.floor(totalSales * 0.15), revenue: Math.floor(totalRevenue * 0.12), color: 'blue' },
      { name: 'Others', sales: Math.floor(totalSales * 0.1), revenue: Math.floor(totalRevenue * 0.08), color: 'orange' },
    ];
  }, [categoryData, totalSales, totalRevenue]);

  const colorClasses = {
    gold: { bg: 'bg-gold-500', text: 'text-gold-400', border: 'border-gold-500/20', glow: 'shadow-gold-sm' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'shadow-violet-500/10' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-orange-500/10' },
  };

  return (
    <div className="space-y-6">
      {/* Product Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Package size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-luxury-dim">Total Products</p>
          <p className="text-2xl font-bold text-luxury-text">{totalProducts.toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/20">
              <ShoppingCart size={18} className="text-gold-400" />
            </div>
          </div>
          <p className="text-sm text-luxury-dim">Total Sales</p>
          <p className="text-2xl font-bold text-luxury-text">{totalSales.toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Tag size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-luxury-dim">Avg. Price</p>
          <p className="text-2xl font-bold text-luxury-text">₹{avgPrice.toLocaleString()}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Package size={18} className="text-rose-400" />
            </div>
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold">
                {lowStockCount} low
              </span>
            )}
          </div>
          <p className="text-sm text-luxury-dim">Low Stock</p>
          <p className="text-2xl font-bold text-luxury-text">{lowStockCount}</p>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-luxury-dim mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gold-400">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-luxury-dim mb-1">Stock Value</p>
            <p className="text-xl font-bold text-luxury-text">₹{stockValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-xl flex items-center justify-center">
            <Tag size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-luxury-text">Category Performance</h3>
            <p className="text-sm text-luxury-dim">Sales & revenue by category</p>
          </div>
        </div>

        <div className="space-y-4">
          {normalizedCategories.map((category) => {
            const colors = colorClasses[category.color] || colorClasses.gold;
            const revenuePercent = totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
            
            return (
              <div 
                key={category.name}
                className="group p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                    <span className="font-medium text-luxury-text">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-luxury-dim">{category.sales} sales</span>
                    <span className={`font-bold ${colors.text}`}>₹{category.revenue.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${colors.bg} ${colors.glow} transition-all`}
                    style={{ width: `${revenuePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Selling Products */}
      {topProducts?.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-gold-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-luxury-text">Top Selling Products</h3>
              <p className="text-sm text-luxury-dim">Best performers by units sold</p>
            </div>
          </div>

          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div 
                key={product._id || product.id || index}
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
                
                <div className="w-12 h-12 rounded-lg bg-luxury-card border border-luxury-border overflow-hidden">
                  {product.image && (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-luxury-text truncate">{product.name}</p>
                  <p className="text-xs text-luxury-dim">
                    {product.category} • ₹{product.price?.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right flex items-center gap-4">
                  <div className="flex items-center gap-1 text-luxury-dim">
                    <ShoppingCart size={14} />
                    <span>{product.sales}</span>
                  </div>
                  <p className="font-bold text-gold-400">₹{product.revenue?.toLocaleString()}</p>
                </div>
                
                <ArrowRight size={16} className="text-luxury-dim" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Trend */}
      {weeklyTrend?.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <Tag size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-luxury-text">Weekly Sales Trend</h3>
              <p className="text-sm text-luxury-dim">Units sold per day</p>
            </div>
          </div>

          <div className="flex items-end gap-2 h-32">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg hover:from-blue-500 hover:to-blue-400 transition-all relative group"
                  style={{ height: `${(day.sales / Math.max(...weeklyTrend.map(d => d.sales), 1)) * 100}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-luxury-card border border-luxury-border rounded-lg text-xs text-luxury-text opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.sales} units
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

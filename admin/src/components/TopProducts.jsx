import React from 'react';
import { Star, ShoppingBag, Crown } from 'lucide-react';
const imageUrl = (image) => (typeof image === "string" ? image : image?.url);

export default function TopProducts({ products = [], loading = false }) {
if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="shimmer h-6 w-32 rounded bg-white/5" />
            <div className="shimmer h-3 w-64 max-w-full rounded bg-white/5 mt-2" />
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0 shimmer animate-pulse rounded-2xl p-4 bg-white/5">
              <div className="w-full h-32 bg-white/5 rounded-xl mb-3" />
              <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-luxury-text flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold-400" />
            Top Selling Products
          </h3>
          <p className="text-sm text-luxury-dim mt-1">Best performers this week</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {products.length === 0 ? (
          <div className="w-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-luxury-dim">
            No product sales yet
          </div>
        ) : products.map((product, index) => (
          <div 
            key={product._id || product.id || index} 
            className="w-48 flex-shrink-0 group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-gold-lg rounded-2xl p-4 border border-transparent hover:border-gold-500/30 bg-gradient-to-br from-white/[0.02] to-transparent"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-xl mb-4 aspect-video bg-luxury-surface/50 group-hover:shadow-gold-sm">
              <img 
                src={imageUrl(product.image) || imageUrl(product.product?.images?.[0]) || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect width='300' height='180' fill='%23171717'/%3E%3C/svg%3E"}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Sales Badge */}
              <div className="absolute top-2 right-2 bg-gold-500/90 backdrop-blur-sm border border-gold-500/50 px-2 py-1 rounded-full text-black text-xs font-bold flex items-center gap-1 shadow-gold-sm">
                <ShoppingBag size={12} />
                {Number(product.sales || 0).toLocaleString()} sold
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-luxury-text line-clamp-1 group-hover:text-gold-400 transition-colors">
                  {product.name || product.product?.title || "Product"}
              </h4>
              
              <div className="flex items-center gap-1 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.rating || 0) ? '#f5e0b3' : 'none'}
                    className="text-gold-400" 
                  />
                ))}
                <span className="text-xs text-luxury-dim ml-1">({Number(product.rating || 0).toFixed(1)})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-gold-gradient">
                  ₹{Number(product.revenue || product.product?.price || product.price || 0).toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-luxury-dim px-2 py-1 bg-white/5 rounded-full">
                  Live
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

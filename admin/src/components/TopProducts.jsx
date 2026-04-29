import React from 'react';
import { Star, ShoppingBag, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock data - replace with real top products API
const TOP_PRODUCTS = [
  {
    id: 'DP001',
    name: 'Diamond Eternity Necklace',
    image: 'https://images.unsplash.com/photo-1615796157755-9f75c3b12a1f?w=400&h=400&fit=crop&crop=center',
    price: 125000,
    sales: 28,
    rating: 4.9,
    soldIn: '7 days'
  },
  {
    id: 'RG002',
    name: 'Rose Gold Bracelet 18K',
    image: 'https://images.unsplash.com/photo-1588403073877-051e9487a34b?w=400&h=400&fit=crop&crop=center',
    price: 45000,
    sales: 19,
    rating: 4.8,
    soldIn: '7 days'
  },
  {
    id: 'PL003',
    name: 'Platinum Solitaire Ring',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
    price: 285000,
    sales: 12,
    rating: 5.0,
    soldIn: '7 days'
  },
  {
    id: 'GD004',
    name: 'Gold Mangalsutra Set',
    image: 'https://images.unsplash.com/photo-1608043152266-0397796f1d15?w=400&h=400&fit=crop&crop=center',
    price: 98000,
    sales: 35,
    rating: 4.7,
    soldIn: '7 days'
  },
  {
    id: 'EM005',
    name: 'Emerald Earrings',
    image: 'https://images.unsplash.com/photo-1609992531185-6e746117f69e?w=400&h=400&fit=crop&crop=center',
    price: 75000,
    sales: 22,
    rating: 4.9,
    soldIn: '7 days'
  }
];

export default function TopProducts({ products = TOP_PRODUCTS, loading = false }) {
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
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="w-48 flex-shrink-0 group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-gold-lg rounded-2xl p-4 border border-transparent hover:border-gold-500/30 bg-gradient-to-br from-white/[0.02] to-transparent"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden rounded-xl mb-4 aspect-video bg-luxury-surface/50 group-hover:shadow-gold-sm">
              <img 
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Sales Badge */}
              <div className="absolute top-2 right-2 bg-gold-500/90 backdrop-blur-sm border border-gold-500/50 px-2 py-1 rounded-full text-black text-xs font-bold flex items-center gap-1 shadow-gold-sm">
                <ShoppingBag size={12} />
                {product.sales} sold
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h4 className="font-semibold text-luxury-text line-clamp-1 group-hover:text-gold-400 transition-colors">
                {product.name}
              </h4>
              
              <div className="flex items-center gap-1 text-gold-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.rating) ? '#f5e0b3' : 'none'}
                    className="text-gold-400" 
                  />
                ))}
                <span className="text-xs text-luxury-dim ml-1">({product.rating})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-gold-gradient">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-xs text-luxury-dim px-2 py-1 bg-white/5 rounded-full">
                  {product.soldIn}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


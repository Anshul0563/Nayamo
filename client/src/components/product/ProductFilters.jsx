import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, Star, Filter } from 'lucide-react';

const categories = [
  { value: 'party', label: 'Party Wear', icon: '🎭' },
  { value: 'daily', label: 'Daily Wear', icon: '✨' },
  { value: 'traditional', label: 'Traditional', icon: '🪔' },
  { value: 'western', label: 'Western', icon: '💎' },
  { value: 'statement', label: 'Statement', icon: '👑' },
  { value: 'bridal', label: 'Bridal', icon: '💍' },
];

const sortOptions = [
  { value: '', label: 'Sort By' },
  { value: 'newest', label: 'Newest First' },
  { value: 'low', label: 'Price: Low to High' },
  { value: 'high', label: 'Price: High to Low' },
];

export default function ProductFilters({
  showFilters,
  setShowFilters,
  category,
  updateParam,
  search,
  setSearch,
  clearFilters,
  priceRange = [0, 50000],
  setPriceRange,
  rating,
  setRating,
  sortFilter,
  setSortFilter,
}) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handlePriceChange = (update) => {
    const newRange = update(localPriceRange);
    setLocalPriceRange(newRange);
    setPriceRange(newRange);
    if (newRange[0] > 0 || newRange[1] < 50000) {
      updateParam('priceMin', newRange[0].toString());
      updateParam('priceMax', newRange[1].toString());
    } else {
      updateParam('priceMin', '');
      updateParam('priceMax', '');
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    updateParam('rating', newRating > 0 ? newRating.toString() : '');
  };

  const isActiveFilter = (cat) => category === cat.value;
  const activeCount = (category ? 1 : 0) + (rating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 50000 ? 1 : 0);

  return (
    <AnimatePresence>
      {showFilters && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            className="fixed inset-0 z-40 lg:hidden bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFilters(false)}
          />
          
          {/* Filter Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 lg:static lg:translate-x-0 lg:w-80 bg-white/80 backdrop-blur-xl border border-nayamo-border-light shadow-2xl shadow-nayamo-gold/10 lg:shadow-xl"
          >
            {/* Header */}
            <div className="sticky top-0 p-6 pb-4 bg-white/90 backdrop-blur-sm border-b border-nayamo-border-light z-10 lg:border-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-gradient-to-br from-nayamo-gold/20 to-nayamo-rose/20 rounded-xl border border-nayamo-gold/30 shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <Filter className="w-6 h-6 text-nayamo-gold" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-serif font-black text-gray-900 tracking-tight">
                      Refine Collection
                    </h2>
                    <p className="text-sm text-gray-600 font-light">
                      {activeCount} active filter{activeCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 pb-20 lg:pb-6 overflow-y-auto h-[calc(100vh-120px)] lg:h-auto max-h-screen">
              {/* Search */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Jewellery
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. diamond studs"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-nayamo-gold/30 focus:border-nayamo-gold transition-all duration-300 text-lg font-medium"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat, index) => (
                    <motion.button
                      key={cat.value}
                      onClick={() => updateParam('category', category === cat.value ? '' : cat.value)}
                      className={`group relative p-6 rounded-2xl border-2 transition-all duration-500 h-28 flex flex-col items-center justify-center font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 ${
                        isActiveFilter(cat)
                          ? 'bg-gradient-to-br from-nayamo-gold to-amber-500 border-nayamo-gold text-white shadow-nayamo-gold/40'
                          : 'bg-white border-gray-200 hover:border-nayamo-gold/50 hover:bg-nayamo-gold/5 text-gray-900'
                      }`}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <span className={`text-3xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                        isActiveFilter(cat) ? 'scale-110' : ''
                      }`}>
                        {cat.icon}
                      </span>
                      <span className="text-sm font-serif tracking-wide leading-tight">
                        {cat.label}
                      </span>
                      {isActiveFilter(cat) && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl -skew-x-3"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.6 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600 font-mono">
                    <span>₹{localPriceRange[0].toLocaleString()}</span>
                    <span>₹{localPriceRange[1].toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={localPriceRange[0]}
                      onChange={(e) => handlePriceChange(([min]) => [Number(e.target.value), localPriceRange[1]])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold"
                    />
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      value={localPriceRange[1]}
                      onChange={(e) => handlePriceChange(([min, max]) => [localPriceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gold mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <motion.button
                      key={star}
                      onClick={() => handleRatingChange(rating === star ? 0 : star)}
                      className={`flex items-center gap-1 p-3 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                        rating === star
                          ? 'bg-gradient-to-r from-nayamo-gold to-amber-500 text-white shadow-nayamo-gold/40 border border-nayamo-gold/30'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-nayamo-gold/10 hover:border-nayamo-gold/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {Array.from({ length: star }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                      <span className="text-sm"> & Up</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortFilter}
                    onChange={(e) => {
                      setSortFilter(e.target.value);
                      updateParam('sort', e.target.value);
                    }}
                    className="w-full px-4 py-4 pr-12 rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-sm text-gray-900 font-medium focus:ring-4 focus:ring-nayamo-gold/30 focus:border-nayamo-gold appearance-none cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Clear Filters */}
              {(category || search || rating > 0 || priceRange[0] > 0 || priceRange[1] < 50000 || sortFilter) && (
                <motion.button
                  onClick={clearFilters}
                  className="w-full py-4 px-6 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-2xl text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md text-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X className="w-5 h-5" />
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

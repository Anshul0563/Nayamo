import { useState } from "react";

export default function ProductFilters({ filters, onChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleCategoryChange = (category) => {
    const newFilters = { ...localFilters, category: category === localFilters.category ? "" : category };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    const newFilters = value === 0 
      ? { ...localFilters, price: [0, 5000] }
      : { ...localFilters, price: [0, value] };
    setLocalFilters(newFilters);
    onChange(newFilters);
  };

  const categories = [
    "party", "daily", "traditional", 
    "western", "statement", "bridal"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-nayamo-text-primary mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left py-3 px-4 rounded-xl border transition-all ${
                localFilters.category === cat 
                  ? 'bg-nayamo-gold border-nayamo-gold text-black font-medium' 
                  : 'border-nayamo-border-light hover:border-nayamo-gold/50 text-nayamo-text-secondary'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-nayamo-text-primary mb-4">Price</h3>
        <div className="space-y-2">
          {[500, 1000, 2000, 3000, 5000].map(price => (
            <button
              key={price}
              onClick={() => handlePriceChange({ target: { value: price } })}
              className={`w-full text-left py-3 px-4 rounded-xl border transition-all ${
                localFilters.price[1] === price 
                  ? 'bg-nayamo-gold border-nayamo-gold text-black font-medium' 
                  : 'border-nayamo-border-light hover:border-nayamo-gold/50 text-nayamo-text-secondary'
              }`}
            >
              Under ₹{price.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={() => {
          onChange({ category: "", price: [0, 5000], sort: "newest", search: "" });
        }}
        className="w-full py-3 px-4 bg-nayamo-bg-card border border-nayamo-border-light rounded-xl hover:bg-nayamo-hover text-nayamo-text-secondary hover:text-nayamo-gold transition-all text-sm font-medium"
      >
        Clear Filters
      </button>
    </div>
  );
}


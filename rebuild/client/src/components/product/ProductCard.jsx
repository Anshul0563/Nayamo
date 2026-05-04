import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group nayamo-glass rounded-3xl p-6 border hover:border-nayamo-gold/30 transition-all overflow-hidden h-full flex flex-col"
    >
      <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl group-hover:scale-105 transition-transform">
        <img 
          src={product.images?.[0] || '/placeholder.jpg'} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => toggleWishlist(product._id)}
          className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur rounded-xl opacity-0 group-hover:opacity-100 transition-all"
        >
          <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-nayamo-gold text-nayamo-gold' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col">
        <h3 className="font-serif font-semibold text-nayamo-text-primary text-lg mb-2 line-clamp-2 group-hover:text-nayamo-gold">
          {product.title}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.round(product.ratings?.average || 0) ? 'fill-nayamo-gold text-nayamo-gold' : 'text-nayamo-text-muted'}`} 
              />
            ))}
          </div>
          <span className="text-nayamo-text-muted text-sm">
            ({product.ratings?.count || 0})
          </span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-2xl font-bold text-nayamo-gold">
            ₹{product.price}
          </span>
          {product.originalPrice && (
            <span className="text-nayamo-text-muted line-through text-sm">
              ₹{product.originalPrice}
            </span>
          )}
        </div>
        <Link 
          to={`/product/${product._id}`}
          className="nayamo-btn-primary mt-auto"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}


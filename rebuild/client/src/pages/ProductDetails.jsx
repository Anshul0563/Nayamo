import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productAPI, cartAPI, wishlistAPI, reviewAPI } from "@/services/api";
import Loader from "@/components/common/Loader";
import { Star, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { motion } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productAPI.getProduct(id);
        setProduct(res.data.data);
        
        const reviewRes = await reviewAPI.getReviews(id);
        setReviews(reviewRes.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;

  if (!product) return <div>Product not found</div>;

  const handleAddToCart = async () => {
    await addToCart(product._id);
  };

  return (
    <div className="py-12">
      <div className="nayamo-container">
        <Link to="/shop" className="inline-flex items-center gap-2 text-nayamo-text-muted hover:text-nayamo-gold mb-8">
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Product images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border">
              <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {product.images?.slice(1, 4).map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg border cursor-pointer hover:scale-105">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          {/* Product info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < product.ratings.average ? 'fill-nayamo-gold text-nayamo-gold' : 'text-nayamo-text-muted'}`} />
                ))}
              </div>
              <span className="text-nayamo-text-muted">({product.ratings.count} reviews)</span>
            </div>
            
            <h1 className="text-4xl font-serif font-bold text-nayamo-text-primary mb-6">
              {product.title}
            </h1>
            
            <div className="mb-8">
              <span className="text-4xl font-bold text-nayamo-gold block mb-2">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-2xl text-nayamo-text-muted line-through">
                  ₹{product.originalPrice}
                </span>
              )}
              <p className="text-nayamo-text-secondary mt-2">
                {product.stock === 0 ? "Out of stock" : `${product.stock} available`}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-nayamo-text-primary mb-4">Quantity</h3>
              <div className="flex items-center bg-nayamo-bg-card px-6 py-4 rounded-2xl border">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border hover:bg-nayamo-hover flex items-center justify-center"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-20 text-center text-2xl font-bold mx-6">
                  {quantity}
                </span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-12 h-12 rounded-xl border hover:bg-nayamo-hover flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 nayamo-btn-primary py-5 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
              <button 
                onClick={() => toggleWishlist(product._id)}
                className="px-8 py-5 bg-nayamo-bg-card border border-nayamo-border-light rounded-2xl hover:border-nayamo-gold/50 hover:text-nayamo-gold transition-all text-nayamo-text-secondary"
              >
                <Heart className={`w-6 h-6 ${isInWishlist(product._id) ? 'fill-nayamo-gold text-nayamo-gold' : ''}`} />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-serif font-semibold text-nayamo-text-primary mb-6">
                Description
              </h3>
              <p className="text-nayamo-text-secondary whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-20">
          <h2 className="text-3xl font-serif font-bold text-nayamo-text-primary mb-10">
            Reviews ({reviews.length})
          </h2>
          {reviews.map((review) => (
            <div key={review._id} className="nayamo-glass p-8 rounded-2xl mb-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 fill-nayamo-gold text-nayamo-gold`} />
                  ))}
                </div>
                <span className="text-sm text-nayamo-text-muted">({review.rating})</span>
              </div>
              <h4 className="font-semibold text-nayamo-text-primary mb-2">{review.user.name}</h4>
              <p className="text-nayamo-text-secondary">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


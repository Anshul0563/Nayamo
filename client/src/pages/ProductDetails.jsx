import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronLeft, Weight, Ruler, Lock, CheckCircle, Star } from "lucide-react";
import { productAPI } from "../services/api";
import Loader from "../components/common/Loader";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProductById(id);
        setProduct(res.data?.data);
        setSelectedImage(0);
        setQty(1);
        const relRes = await productAPI.getProducts({ category: res.data?.data?.category, page: 1 });
        setRelated((relRes.data?.data?.products || []).filter((p) => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error("Product detail error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const liked = product ? isInWishlist(product._id) : false;

  const handleWishlist = () => {
    if (!product) return;
    liked ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product._id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getImageUrl = (p, idx = 0) => {
    if (!p) return "";
    const img = p.images?.[idx];
    return img?.url || img || "https://placehold.co/600x600/1A1A1C/D4A853?text=Nayamo+Earrings";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Earring Not Found</h2>
          <Link to="/shop" className="text-[#D4A853] hover:underline">Browse all earrings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-white mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#141414] border border-white/[0.06] mb-4">
              <img src={getImageUrl(product, selectedImage)} alt={product.title} className="w-full h-full object-cover" />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-[#D4A853]" : "border-transparent"}`}>
                    <img src={img?.url || img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <span className="px-3 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs font-medium rounded-full uppercase tracking-wide border border-[#D4A853]/20">{product.category} Earrings</span>
              <button onClick={handleWishlist} className={`p-2 rounded-full transition-colors ${liked ? "bg-[#D4A5A5]/20 text-[#D4A5A5]" : "bg-[#1A1A1C] text-[#6B7280] hover:text-[#D4A5A5]"}`}>
                <Heart className={`w-5 h-5 ${liked ? "fill-[#D4A5A5]" : ""}`} />
              </button>
            </div>

            <h1 className="text-3xl font-serif font-bold text-white mb-3">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />)}
              </div>
              <span className="text-sm text-[#9CA3AF]">(4.8)</span>
            </div>

            <p className="text-3xl font-semibold nayamo-text-gold mb-4">{product.price ? `Rs ${product.price.toLocaleString("en-IN")}` : ""}</p>
            <p className="text-[#9CA3AF] leading-relaxed mb-6">{product.description}</p>

            {/* Earring Specs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="nayamo-card p-3 text-center">
                <Weight className="w-4 h-4 text-[#6B7280] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">Weight</p>
                <p className="text-sm font-medium text-white">{product.weight || "2-4g"}</p>
              </div>
              <div className="nayamo-card p-3 text-center">
                <Ruler className="w-4 h-4 text-[#6B7280] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">Dimensions</p>
                <p className="text-sm font-medium text-white">{product.dimensions || "25 x 15mm"}</p>
              </div>
              <div className="nayamo-card p-3 text-center">
                <Lock className="w-4 h-4 text-[#6B7280] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">Closure</p>
                <p className="text-sm font-medium text-white">{product.closure || "Push Back"}</p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm text-[#9CA3AF]">Quantity:</span>
              <div className="flex items-center border border-white/[0.08] rounded-lg bg-[#1A1A1C]">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-[#242428] text-white text-lg transition-colors">-</button>
                <span className="w-10 text-center text-sm font-medium text-white">{qty}</span>
                <button onClick={() => setQty(qty + 1)} disabled={qty >= product.stock} className="w-10 h-10 flex items-center justify-center hover:bg-[#242428] text-white text-lg transition-colors disabled:opacity-30">+</button>
              </div>
            </div>

            {/* Stock */}
            {product.stock === 0 ? (
              <p className="text-[#D4A5A5] font-medium mb-4">Out of Stock</p>
            ) : (
              <p className="text-green-400 text-sm font-medium mb-4 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> In Stock ({product.stock} pairs available)
              </p>
            )}

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={product.stock === 0 || added} className="w-full nayamo-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mb-6">
              {added ? <><CheckCircle className="w-5 h-5" /> Added to Cart</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
            </button>

            {/* Trust Badges - Earring Specific */}
            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <div className="nayamo-card p-3">
                <Shield className="w-5 h-5 text-[#D4A853] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">Skin Friendly</p>
              </div>
              <div className="nayamo-card p-3">
                <CheckCircle className="w-5 h-5 text-[#D4A853] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">Premium Finish</p>
              </div>
              <div className="nayamo-card p-3">
                <RotateCcw className="w-5 h-5 text-[#D4A853] mx-auto mb-1" />
                <p className="text-xs text-[#9CA3AF]">7-Day Returns</p>
              </div>
            </div>

            {/* Shipping */}
            <div className="nayamo-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-[#D4A853]" />
                <p className="font-medium text-sm text-white">Free Shipping</p>
              </div>
              <p className="text-xs text-[#9CA3AF]">Free delivery on orders above Rs 999. Ships within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-white mb-6">Complete Your Look</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


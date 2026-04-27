import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Truck, Shield, RotateCcw, ChevronLeft, Weight, Ruler, Lock, CheckCircle } from "lucide-react";
import { productAPI } from "../services/api";
import Loader from "../components/common/Loader";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await productAPI.getProductById(id);
        setProduct(res.data?.data);
        setSelectedImage(0);
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
    addToCart(product._id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getImageUrl = (p, idx = 0) => {
    if (!p) return "";
    const img = p.images?.[idx];
    return img?.url || img || "https://placehold.co/600x600/FDF8F0/D4A853?text=Nayamo+Earrings";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Earring Not Found</h2>
          <Link to="/shop" className="text-[#D4A853] hover:underline">Browse all earrings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="nayamo-container py-8">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-4">
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
              <span className="px-3 py-1 bg-amber-50 text-[#D4A853] text-xs font-medium rounded-full uppercase tracking-wide">{product.category} Earrings</span>
              <button onClick={handleWishlist} className={`p-2 rounded-full transition-colors ${liked ? "bg-red-50 text-red-500" : "bg-stone-100 text-stone-400 hover:text-red-500"}`}>
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
              </button>
            </div>

            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-3">{product.title}</h1>
            <p className="text-3xl font-semibold text-[#D4A853] mb-4">{product.price ? `Rs ${product.price.toLocaleString("en-IN")}` : ""}</p>
            <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>

            {/* Earring Specs */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-3 text-center border border-stone-100">
                <Weight className="w-4 h-4 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Weight</p>
                <p className="text-sm font-medium">{product.weight || "2-4g"}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-stone-100">
                <Ruler className="w-4 h-4 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Dimensions</p>
                <p className="text-sm font-medium">{product.dimensions || "25 x 15mm"}</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-stone-100">
                <Lock className="w-4 h-4 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Closure</p>
                <p className="text-sm font-medium">{product.closure || "Push Back"}</p>
              </div>
            </div>

            {/* Stock */}
            {product.stock === 0 ? (
              <p className="text-red-500 font-medium mb-4">Out of Stock</p>
            ) : (
              <p className="text-green-600 text-sm font-medium mb-4 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> In Stock ({product.stock} pairs available)
              </p>
            )}

            {/* Add to Cart */}
            <button onClick={handleAddToCart} disabled={product.stock === 0 || added} className="w-full nayamo-btn-primary flex items-center justify-center gap-2 disabled:opacity-50 mb-6">
              {added ? <><CheckCircle className="w-5 h-5" /> Added to Cart</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
            </button>

            {/* Trust Badges - Earring Specific */}
            <div className="grid grid-cols-3 gap-4 text-center mb-8">
              <div>
                <Shield className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Skin Friendly</p>
              </div>
              <div>
                <CheckCircle className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">Premium Finish</p>
              </div>
              <div>
                <RotateCcw className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-500">7-Day Returns</p>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-[#D4A853]" />
                <p className="font-medium text-sm">Free Shipping</p>
              </div>
              <p className="text-xs text-stone-500">Free delivery on orders above Rs 999. Ships within 24 hours.</p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Complete Your Look</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <div key={p._id} className="nayamo-card overflow-hidden">
                  <Link to={`/product/${p._id}`} className="block relative aspect-square overflow-hidden">
<img src={p.images?.[0]?.url || p.images?.[0] || "https://placehold.co/400x400/FDF8F0/D4A853?text=Nayamo"} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${p._id}`}>
                      <h3 className="font-medium text-stone-800 hover:text-[#D4A853] transition-colors truncate">{p.title}</h3>
                    </Link>
                    <p className="text-[#D4A853] font-semibold mt-1">Rs {p.price?.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

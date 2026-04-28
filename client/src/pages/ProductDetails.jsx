import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Weight,
  Ruler,
  Lock,
  CheckCircle,
  Star,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
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
        const relRes = await productAPI.getProducts({
          category: res.data?.data?.category,
          page: 1,
        });
        setRelated(
          (relRes.data?.data?.products || [])
            .filter((p) => p._id !== id)
            .slice(0, 4)
        );
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
    return (
      img?.url ||
      img ||
      "https://placehold.co/600x600/131316/D4A853?text=Nayamo+Earrings"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Earring Not Found
          </h2>
          <Link to="/shop" className="text-[#D4A853] hover:underline">
            Browse all earrings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-8">
        {/* Breadcrumb */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-[#0E0E10] border border-white/[0.06] mb-5 shadow-2xl">
              <img
                src={getImageUrl(product, selectedImage)}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === i
                        ? "border-[#D4A853] shadow-[0_0_16px_rgba(212,168,83,0.25)]"
                        : "border-transparent hover:border-white/[0.1]"
                    }`}
                  >
                    <img
                      src={img?.url || img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-3.5 py-1.5 bg-[#D4A853]/8 text-[#D4A853] text-xs font-semibold rounded-full uppercase tracking-wider border border-[#D4A853]/15">
                {product.category} Earrings
              </span>
              <button
                onClick={handleWishlist}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  liked
                    ? "bg-[#D4A5A5]/15 text-[#D4A5A5] border border-[#D4A5A5]/20"
                    : "bg-[#131316] text-[#71717A] hover:text-[#D4A5A5] border border-white/[0.06]"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-[#D4A5A5]" : ""}`} />
              </button>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 tracking-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-[#D4A853] text-[#D4A853]"
                  />
                ))}
              </div>
              <span className="text-sm text-[#A1A1AA]">(4.8)</span>
              <span className="w-1 h-1 rounded-full bg-[#52525B]" />
              <span className="text-sm text-[#71717A]">128 reviews</span>
            </div>

            <p className="text-3xl font-bold nayamo-text-gold mb-5">
              {product.price
                ? `Rs ${product.price.toLocaleString("en-IN")}`
                : ""}
            </p>
            <p className="text-[#A1A1AA] leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Weight, label: "Weight", value: product.weight || "2-4g" },
                { icon: Ruler, label: "Dimensions", value: product.dimensions || "25 x 15mm" },
                { icon: Lock, label: "Closure", value: product.closure || "Push Back" },
              ].map((spec) => (
                <div
                  key={spec.label}
                  className="nayamo-card p-4 text-center border border-white/[0.04]"
                >
                  <spec.icon className="w-4 h-4 text-[#71717A] mx-auto mb-2" />
                  <p className="text-[11px] text-[#71717A] uppercase tracking-wider mb-1">
                    {spec.label}
                  </p>
                  <p className="text-sm font-semibold text-white">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-5 mb-6">
              <span className="text-sm text-[#A1A1AA]">Quantity</span>
              <div className="flex items-center border border-white/[0.07] rounded-xl bg-[#131316] overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[#1E1E24] text-white transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-11 text-center text-sm font-semibold text-white">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  disabled={qty >= product.stock}
                  className="w-11 h-11 flex items-center justify-center hover:bg-[#1E1E24] text-white transition-colors disabled:opacity-25"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Stock */}
            {product.stock === 0 ? (
              <p className="text-[#D4A5A5] font-medium mb-6">Out of Stock</p>
            ) : (
              <p className="text-green-400 text-sm font-medium mb-6 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                In Stock ({product.stock} pairs available)
              </p>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || added}
              className="w-full nayamo-btn-primary flex items-center justify-center gap-2.5 disabled:opacity-40 mb-8"
            >
              {added ? (
                <>
                  <CheckCircle className="w-5 h-5" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add to Cart
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 text-center mb-8">
              {[
                { icon: Shield, label: "Skin Friendly" },
                { icon: CheckCircle, label: "Premium Finish" },
                { icon: RotateCcw, label: "7-Day Returns" },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="nayamo-card p-4 border border-white/[0.04]"
                >
                  <badge.icon className="w-5 h-5 text-[#D4A853] mx-auto mb-2" />
                  <p className="text-xs text-[#A1A1AA]">{badge.label}</p>
                </div>
              ))}
            </div>

            {/* Shipping */}
            <div className="nayamo-card p-5 border border-white/[0.04]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-[#D4A853]/8 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-[#D4A853]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">
                    Free Shipping
                  </p>
                  <p className="text-xs text-[#71717A]">
                    Free delivery on orders above Rs 999. Ships within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-[0.2em]">
                  You May Also Like
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mt-2">
                  Complete Your Look
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
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

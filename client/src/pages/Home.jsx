import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Star, Truck, Shield, Gem, Heart, Sparkles } from "lucide-react";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import Loader, { SkeletonGrid } from "../components/common/Loader";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productAPI.getProducts({ page: 1 }),
          productAPI.getProducts({ sort: "newest", page: 1 }),
        ]);
        setFeatured(featRes.data?.data?.products?.slice(0, 4) || []);
        setNewArrivals(newRes.data?.data?.products?.slice(0, 4) || []);
      } catch (err) {
        console.error("Home products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#1A1A1A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#D4A853] blur-[120px]" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-amber-700 blur-[120px]" />
        </div>
        <div className="nayamo-container relative z-10 py-20 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#D4A853] text-sm font-medium mb-6">
                New Earring Collection 2025
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
                Handcrafted <br />
                <span className="text-[#D4A853]">Earrings</span>
              </h1>
              <p className="text-stone-300 text-lg md:text-xl mb-8 max-w-lg">
                Discover exquisite handcrafted earrings designed to elevate your style. From delicate studs to statement danglers, each pair is made with love.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="nayamo-btn-primary inline-flex items-center gap-2">
                  Shop Earrings <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/shop?category=gold" className="nayamo-btn-secondary inline-flex">
                  Gold Earrings
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-white border-b border-stone-100">
        <div className="nayamo-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Hypoallergenic", desc: "Skin-safe materials" },
              { icon: Sparkles, title: "925 Sterling Silver", desc: "Premium quality" },
              { icon: Heart, title: "Nickel-Free", desc: "No irritation" },
              { icon: Truck, title: "Free Shipping", desc: "On orders above Rs 999" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <badge.icon className="w-6 h-6 text-[#D4A853] flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-stone-800">{badge.title}</p>
                  <p className="text-xs text-stone-500">{badge.desc}</p>
                </div>
            ))}
          </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="nayamo-container">
          <div className="text-center mb-12">
            <h2 className="nayamo-section-title">Shop by Collection</h2>
            <p className="nayamo-section-subtitle">Find your perfect pair</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Gold", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop", desc: "Timeless elegance" },
              { name: "Silver", image: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=500&h=500&fit=crop", desc: "Modern sophistication" },
              { name: "Diamond", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop", desc: "Pure brilliance" },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/shop?category=${cat.name.toLowerCase()}`} className="group relative block aspect-[4/5] rounded-2xl overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Gem className="w-8 h-8 mb-3 text-[#D4A853]" />
                    <h3 className="text-2xl font-serif font-semibold">{cat.name} Earrings</h3>
                    <p className="text-sm text-white/80 mt-1">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-[#FDF8F0]">
        <div className="nayamo-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="nayamo-section-title">Featured Earrings</h2>
              <p className="nayamo-section-subtitle">Handpicked favourites just for you</p>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-[#D4A853] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-white">
        <div className="nayamo-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="nayamo-section-title">New Arrivals</h2>
              <p className="nayamo-section-subtitle">Latest earring designs</p>
            </div>
            <Link to="/shop?sort=newest" className="hidden md:inline-flex items-center gap-1 text-[#D4A853] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#1A1A1A] text-white">
        <div className="nayamo-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-2">What Our Customers Say</h2>
            <p className="text-stone-400">Real stories from earring lovers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                text: "The gold hoop earrings I ordered are absolutely stunning. They are so lightweight and comfortable, I wear them every day!",
                rating: 5,
              },
              {
                name: "Ananya Patel",
                text: "Best online earring shopping experience. The silver studs are so elegant and hypoallergenic - no irritation at all!",
                rating: 5,
              },
              {
                name: "Meera Gupta",
                text: "I gifted diamond drop earrings to my sister and she was overjoyed. The craftsmanship is exceptional. Thank you Nayamo!",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                  ))}
                </div>
                <p className="text-stone-300 text-sm leading-relaxed mb-4">{t.text}</p>
                <p className="font-medium text-sm">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#FDF8F0]">
        <div className="nayamo-container">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-stone-100">
            <Heart className="w-10 h-10 text-[#D4A853] mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-3">Join the Nayamo Earring Club</h2>
            <p className="text-stone-500 max-w-md mx-auto mb-6">
              Subscribe for exclusive earring collections, styling tips, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="nayamo-input flex-1"
              />
              <button type="submit" className="nayamo-btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}


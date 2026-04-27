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
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, newRes, bestRes] = await Promise.all([
          productAPI.getProducts({ page: 1 }),
          productAPI.getProducts({ sort: "newest", page: 1 }),
          productAPI.getProducts({ sort: "popular", page: 1 }),
        ]);
        setFeatured(featRes.data?.data?.products?.slice(0, 4) || []);
        setNewArrivals(newRes.data?.data?.products?.slice(0, 4) || []);
        setBestSellers(bestRes.data?.data?.products?.slice(0, 4) || []);
      } catch (err) {
        console.error("Home products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.6 },
  };

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FFFAF7]">
        {/* Soft gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D4A853]/10 to-[#D4A5A5]/10 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F7E7CE]/20 to-[#D4A5A5]/10 blur-3xl" />
        </div>

        <div className="nayamo-container relative z-10 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F3] border border-[#F0D4D8] text-[#D4A5A5] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                New Earring Collection 2025
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-6 text-[#2C2C2C]">
                Elegant <br />
                <span className="text-[#D4A853]">Artificial</span> <br />
                <span className="text-[#D4A5A5]">Jewellery</span>
              </h1>

              <p className="text-[#8C7B73] text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Discover handcrafted artificial jewellery designed for the modern woman. 
                Exquisite earrings that elevate your style without breaking the bank.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/shop" className="nayamo-btn-primary inline-flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/shop?category=gold" className="nayamo-btn-secondary inline-flex">
                  Gold Collection
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10">
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "Secure Payments" },
                  { icon: Heart, text: "Handcrafted" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#8C7B73]">
                    <item.icon className="w-5 h-5 text-[#D4A853]" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop&q=80"
                  alt="Beautiful gold earrings"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/30 to-transparent" />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg"
              >
                <p className="text-xs text-[#8C7B73 uppercase tracking-wider">Starting from</p>
                <p className="text-xl font-bold text-[#D4A853]">Rs 299</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES STRIP ===== */}
      <section className="py-10 bg-white border-y border-[#F0E6E0]">
        <div className="nayamo-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Premium Quality", desc: "Crafted with care" },
              { icon: Sparkles, title: "Trendy Designs", desc: "Latest styles" },
              { icon: Heart, title: "Hypoallergenic", desc: "Skin-safe materials" },
              { icon: Truck, title: "Fast Delivery", desc: "Ships in 24 hours" },
            ].map((badge, i) => (
              <motion.div key={i} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FFF0F3] flex items-center justify-center flex-shrink-0">
                  <badge.icon className="w-5 h-5 text-[#D4A5A5]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#2C2C2C]">{badge.title}</p>
                  <p className="text-xs text-[#B8A99A]">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-20 bg-[#FFFAF7]">
        <div className="nayamo-container">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-widest">Collections</span>
            <h2 className="nayamo-section-title mt-2">Shop by Collection</h2>
            <p className="nayamo-section-subtitle">Find your perfect pair of earrings</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Gold", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop&q=80", desc: "Timeless elegance" },
              { name: "Silver", image: "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=500&h=600&fit=crop&q=80", desc: "Modern sophistication" },
              { name: "Diamond", image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=600&fit=crop&q=80", desc: "Sparkling brilliance" },
            ].map((cat, i) => (
              <motion.div key={cat.name} {...fadeInUp} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <Link
                  to={`/shop?category=${cat.name.toLowerCase()}`}
                  className="group relative block aspect-[3/4] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-500"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/70 via-[#2C2C2C]/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 text-white">
                    <Gem className="w-8 h-8 mb-3 text-[#D4A853]" />
                    <h3 className="text-2xl font-serif font-semibold">{cat.name} Earrings</h3>
                    <p className="text-sm text-white/70 mt-1">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-20 bg-white">
        <div className="nayamo-container">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-widest">Featured</span>
              <h2 className="nayamo-section-title mt-2">Featured Earrings</h2>
              <p className="nayamo-section-subtitle">Handpicked favourites for you</p>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-[#D4A853] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="py-20 bg-[#FFF0F3]/30">
        <div className="nayamo-container">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-widest">Popular</span>
              <h2 className="nayamo-section-title mt-2">Best Sellers</h2>
              <p className="nayamo-section-subtitle">Our most loved pieces</p>
            </div>
            <Link to="/shop?sort=popular" className="hidden md:inline-flex items-center gap-1 text-[#D4A5A5] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-20 bg-white">
        <div className="nayamo-container">
          <motion.div {...fadeInUp} className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-widest">New</span>
              <h2 className="nayamo-section-title mt-2">New Arrivals</h2>
              <p className="nayamo-section-subtitle">Latest earring designs</p>
            </div>
            <Link to="/shop?sort=newest" className="hidden md:inline-flex items-center gap-1 text-[#D4A853] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? <SkeletonGrid count={4} /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 bg-[#2C2C2C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-[#D4A853] blur-[120px]" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-[#D4A5A5] blur-[120px]" />
        </div>

        <div className="nayamo-container relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mt-2">What Our Customers Say</h2>
            <p className="text-[#A09088] mt-2">Real stories from jewellery lovers</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                text: "The gold hoop earrings are absolutely stunning. Lightweight and so comfortable - I wear them every day!",
                rating: 5,
              },
              {
                name: "Ananya Patel",
                text: "Best online jewellery shopping experience. The silver studs are so elegant and perfect for daily wear.",
                rating: 5,
              },
              {
                name: "Meera Gupta",
                text: "I gifted diamond drop earrings to my sister and she was overjoyed. The craftsmanship is beautiful. Thank you Nayamo!",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#D4A853] text-[#D4A853]" />
                  ))}
                </div>
                <p className="text-[#D8CCC5] text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="font-medium text-sm">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-20 bg-[#FFFAF7]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="bg-white rounded-3xl p-10 md:p-14 text-center shadow-lg border border-[#F0E6E0] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4A853]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#D4A5A5]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] flex items-center justify-center mx-auto mb-5">
                <Heart className="w-7 h-7 text-[#D4A5A5]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-[#2C2C2C] mb-3">
                Join the Nayamo Club
              </h2>
              <p className="text-[#8C7B73] mb-8 max-w-md mx-auto">
                Subscribe for exclusive collections, styling tips, and special offers.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="nayamo-input flex-1"
                />
                <button type="submit" className="nayamo-btn-rose whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


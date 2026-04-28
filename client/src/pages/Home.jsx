import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Gem,
  Heart,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { productAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { SkeletonGrid } from "../components/common/Loader";

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
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div className="bg-[#070708]">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Rich background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#D4A853]/6 to-[#D4A5A5]/3 blur-[100px]" />
          <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#D4A853]/4 to-[#D4A5A5]/6 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#D4A853]/2 blur-[160px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="nayamo-container relative z-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A853]/8 border border-[#D4A853]/15 text-[#D4A853] text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                New Collection 2025
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.05] mb-7 text-white">
                Trendy <br />
                <span className="nayamo-text-gold">Fashion</span> <br />
                <span className="nayamo-text-rose">Jewellery</span>
              </h1>
              <p className="text-[#A1A1AA] text-lg md:text-xl mb-10 max-w-md leading-relaxed">
                Discover stylish artificial jewellery designed for every
                occasion. From statement earrings to daily wear — elevate your
                style affordably.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="nayamo-btn-primary inline-flex items-center gap-2"
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?category=party"
                  className="nayamo-btn-secondary inline-flex items-center gap-2"
                >
                  Party Collection <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { icon: Truck, text: "Free Shipping" },
                  { icon: Shield, text: "Secure Payments" },
                  { icon: Heart, text: "Trendy Designs" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 text-[#A1A1AA]"
                  >
                    <item.icon className="w-5 h-5 text-[#D4A853]" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-[2rem] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)] border border-white/[0.06]">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop&q=80"
                  alt="Fashion earrings collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/50 via-transparent to-transparent" />
              </div>
              {/* Floating price card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute bottom-10 left-6 md:left-10 nayamo-glass rounded-2xl px-6 py-4 shadow-2xl border border-white/[0.08]"
              >
                <p className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-1">
                  Starting from
                </p>
                <p className="text-2xl font-bold nayamo-text-gold">Rs 199</p>
              </motion.div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute top-10 right-6 md:right-4 nayamo-glass rounded-xl px-4 py-3 shadow-xl border border-white/[0.08]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <span className="text-xs text-white font-medium">In Stock</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#52525B]">
            Scroll
          </span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#52525B] to-transparent" />
        </motion.div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="py-12 bg-[#0A0A0C] border-y border-white/[0.04]">
        <div className="nayamo-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "Quality Finish", desc: "Premium look & feel" },
              { icon: Sparkles, title: "Trendy Designs", desc: "Latest styles" },
              { icon: Heart, title: "Lightweight", desc: "Comfortable all day" },
              { icon: Truck, title: "Fast Delivery", desc: "Ships in 24 hours" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4A853]/8 border border-[#D4A853]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A853]/15 transition-colors duration-300">
                  <badge.icon className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">
                    {badge.title}
                  </p>
                  <p className="text-xs text-[#71717A]">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-24 bg-[#070708]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-16"
          >
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
              Collections
            </span>
            <h2 className="nayamo-section-title mt-3">Shop by Style</h2>
            <p className="nayamo-section-subtitle mx-auto">
              Find earrings for every occasion
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Party Wear",
                image:
                  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop&q=80",
                desc: "Glamorous & bold",
              },
              {
                name: "Daily Wear",
                image:
                  "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=500&h=600&fit=crop&q=80",
                desc: "Simple & elegant",
              },
              {
                name: "Traditional",
                image:
                  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=600&fit=crop&q=80",
                desc: "Ethnic & festive",
              },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                {...fadeInUp}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  to={`/shop?category=${cat.name
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  className="group relative block aspect-[3/4] rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-700 border border-white/[0.06]"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/90 via-[#070708]/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 text-white">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#D4A853]/20 group-hover:border-[#D4A853]/30 transition-all duration-500">
                      <Gem className="w-6 h-6 text-[#D4A853]" />
                    </div>
                    <h3 className="text-2xl font-serif font-semibold tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/50 mt-1.5">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED ===== */}
      <section className="py-24 bg-[#0A0A0C]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-[0.2em]">
                Featured
              </span>
              <h2 className="nayamo-section-title mt-3">
                Featured Earrings
              </h2>
              <p className="nayamo-section-subtitle">
                Handpicked favourites for you
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-1.5 text-[#D4A853] font-medium hover:underline group"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {featured.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== BEST SELLERS ===== */}
      <section className="py-24 bg-[#070708]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
                Popular
              </span>
              <h2 className="nayamo-section-title mt-3">Best Sellers</h2>
              <p className="nayamo-section-subtitle">
                Our most loved pieces
              </p>
            </div>
            <Link
              to="/shop?sort=popular"
              className="hidden md:inline-flex items-center gap-1.5 text-[#D4A5A5] font-medium hover:underline group"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {bestSellers.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="py-24 bg-[#0A0A0C]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-[0.2em]">
                New
              </span>
              <h2 className="nayamo-section-title mt-2">New Arrivals</h2>
              <p className="nayamo-section-subtitle">
                Latest earring designs
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="hidden md:inline-flex items-center gap-1.5 text-[#D4A853] font-medium hover:underline group"
            >
              View All{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          {loading ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {newArrivals.map((product, i) => (
                <ProductCard key={product._id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 bg-[#070708] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#D4A853] blur-[130px]" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#D4A5A5] blur-[130px]" />
        </div>
        <div className="nayamo-container relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-3 text-white">
              What Our Customers Say
            </h2>
            <p className="text-[#A1A1AA] mt-3">
              Real stories from fashion jewellery lovers
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[
              {
                name: "Priya Sharma",
                text: "These earrings look so premium! Everyone asks where I got them. Such great quality for the price.",
                rating: 5,
              },
              {
                name: "Ananya Patel",
                text: "Best fashion jewellery store online. The daily wear collection is perfect for office and college.",
                rating: 5,
              },
              {
                name: "Meera Gupta",
                text: "I gifted statement earrings to my sister and she loved them! Beautiful designs at affordable prices.",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                transition={{
                  duration: 0.55,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="nayamo-card p-8 hover:bg-[#1E1E24] transition-colors border border-white/[0.04] hover:border-[#D4A853]/10"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-[#D4A853] text-[#D4A853]"
                    />
                  ))}
                </div>
                <p className="text-[#E4E4E7] text-sm leading-relaxed mb-8">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <p className="font-medium text-sm text-white">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-24 bg-[#0A0A0C]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="nayamo-card p-10 md:p-16 text-center relative overflow-hidden border border-white/[0.05]"
          >
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#D4A853]/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-[#D4A5A5]/8 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#D4A853]/10 border border-[#D4A853]/15 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7 text-[#D4A5A5]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-4">
                Join the Nayamo Club
              </h2>
              <p className="text-[#A1A1AA] mb-10 max-w-md mx-auto leading-relaxed">
                Subscribe for exclusive collections, styling tips, and special
                offers delivered to your inbox.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
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

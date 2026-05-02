import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Gem,
  Heart,
  Sparkles,
  ArrowUpRight,
  Crown,
  Zap,
  Award,
  Users,
} from "lucide-react";
import { productAPI } from "../services/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productAPI.getProducts({ page: 1 });
        setProducts(res.data?.data?.products?.slice(0, 6) || []);
      } catch (err) {
        console.error("Home products error:", err);
      }
    };
    fetchProducts();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {},
    viewport: { once: true },
    transition: { staggerChildren: 0.15 },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div className="bg-[#070708] overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Enhanced background effects */}
        <motion.div
          style={{ y: parallaxY }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute top-[-20%] right-[-15%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-[#D4A853]/8 to-[#D4A5A5]/4 blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-[#D4A853]/6 to-[#D4A5A5]/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-[#D4A853]/3 blur-[180px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#D4A5A5]/5 blur-[80px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-[#D4A853]/4 blur-[60px] animate-pulse" style={{ animationDelay: '2s' }} />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </motion.div>

        <div className="nayamo-container relative z-10 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#D4A853]/10 to-[#D4A5A5]/10 border border-[#D4A853]/20 text-[#D4A853] text-sm font-medium mb-8 shadow-lg backdrop-blur-sm"
              >
                <Crown className="w-4 h-4" />
                Luxury Collection 2026
              </motion.div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.95] mb-8 text-white">
                Timeless <br />
                <span className="nayamo-text-gold bg-gradient-to-r from-[#D4A853] to-[#FFD700] bg-clip-text text-transparent">Elegance</span> <br />
                <span className="nayamo-text-rose bg-gradient-to-r from-[#D4A5A5] to-[#FF6B9D] bg-clip-text text-transparent">Redefined</span>
              </h1>
              <p className="text-[#A1A1AA] text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
                Discover exquisite artificial jewellery crafted for the discerning. From sophisticated statement pieces to everyday luxury — elevate your style with unparalleled craftsmanship.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/shop"
                    className="nayamo-btn-primary inline-flex items-center gap-2 shadow-2xl hover:shadow-[#D4A853]/25 transition-shadow duration-300"
                  >
                    Explore Luxury <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/shop?category=party"
                    className="nayamo-btn-secondary inline-flex items-center gap-2 shadow-xl hover:shadow-[#D4A5A5]/25 transition-shadow duration-300"
                  >
                    Signature Collection <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
              <div className="flex flex-wrap gap-8 mt-14">
                {[
                  { icon: Crown, text: "Premium Quality" },
                  { icon: Shield, text: "Lifetime Warranty" },
                  { icon: Truck, text: "Express Shipping" },
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    className="flex items-center gap-3 text-[#A1A1AA] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A853]/10 to-[#D4A5A5]/10 border border-[#D4A853]/15 flex items-center justify-center group-hover:border-[#D4A853]/30 transition-all duration-300">
                      <item.icon className="w-5 h-5 text-[#D4A853]" />
                    </div>
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative aspect-[4/5] max-w-lg mx-auto rounded-[2.5rem] overflow-hidden shadow-[0_32px_100px_rgba(0,0,0,0.9)] border border-white/[0.08] group">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=750&fit=crop&q=80"
                  alt="Luxury earrings collection"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/60 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/5 via-transparent to-[#D4A5A5]/5" />
              </div>
              {/* Floating price card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="absolute bottom-12 left-6 md:left-10 nayamo-glass rounded-2xl px-6 py-4 shadow-2xl border border-white/[0.1] backdrop-blur-xl"
              >
                <p className="text-xs text-[#A1A1AA] uppercase tracking-widest mb-1">
                  Starting from
                </p>
                <p className="text-3xl font-bold nayamo-text-gold bg-gradient-to-r from-[#D4A853] to-[#FFD700] bg-clip-text text-transparent">Rs 299</p>
              </motion.div>
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
                className="absolute top-12 right-6 md:right-4 nayamo-glass rounded-xl px-4 py-3 shadow-xl border border-white/[0.1] backdrop-blur-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)] animate-pulse" />
                  <span className="text-xs text-white font-medium">Limited Edition</span>
                </div>
              </motion.div>
              {/* Floating sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-8 w-6 h-6 text-[#D4A853] opacity-60"
              >
                <Sparkles className="w-full h-full" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#52525B]">
            Discover More
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-[1px] h-10 bg-gradient-to-b from-[#D4A853] to-transparent"
          />
        </motion.div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section className="py-16 bg-[#0A0A0C] border-y border-white/[0.06]">
        <div className="nayamo-container">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Crown, title: "Luxury Crafted", desc: "Premium materials" },
              { icon: Sparkles, title: "Designer Inspired", desc: "Latest trends" },
              { icon: Heart, title: "Comfort First", desc: "All-day wear" },
              { icon: Truck, title: "Swift Delivery", desc: "24hr dispatch" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A853]/10 to-[#D4A5A5]/10 border border-[#D4A853]/15 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A853]/20 group-hover:border-[#D4A853]/30 transition-all duration-300 shadow-lg"
                >
                  <badge.icon className="w-6 h-6 text-[#D4A853]" />
                </motion.div>
                <div>
                  <p className="font-semibold text-sm text-white group-hover:text-[#D4A853] transition-colors">
                    {badge.title}
                  </p>
                  <p className="text-xs text-[#71717A]">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-28 bg-[#070708]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
              Curated Collections
            </span>
            <h2 className="nayamo-section-title mt-4">Choose Your Style</h2>
            <p className="nayamo-section-subtitle mx-auto">
              Handcrafted jewellery for every moment
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              {
                name: "Evening Glamour",
                image:
                  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop&q=80",
                desc: "Bold & sophisticated",
                color: "from-[#D4A853] to-[#FFD700]",
              },
              {
                name: "Everyday Chic",
                image:
                  "https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=500&h=600&fit=crop&q=80",
                desc: "Subtle & elegant",
                color: "from-[#D4A5A5] to-[#FF6B9D]",
              },
              {
                name: "Cultural Heritage",
                image:
                  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=600&fit=crop&q=80",
                desc: "Traditional & festive",
                color: "from-[#D4A853] to-[#D4A5A5]",
              },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to={`/shop?category=${cat.name
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  className="group relative block aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 border border-white/[0.08] hover:border-[#D4A853]/20"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/95 via-[#070708]/50 to-transparent group-hover:from-[#070708]/85" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 text-white">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-5 shadow-xl border border-white/20 backdrop-blur-sm`}
                    >
                      <Gem className="w-7 h-7 text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-serif font-semibold tracking-tight">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/60">{cat.desc}</p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#D4A853]/10 to-transparent" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PREMIUM SHOWCASE ===== */}
      <section className="py-28 bg-[#0A0A0C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-[#D4A853] blur-[150px]" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#D4A5A5] blur-[150px]" />
        </div>
        <div className="nayamo-container relative z-10">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-[0.2em]">
              Exclusive Selection
            </span>
            <h2 className="nayamo-section-title mt-4">Luxury Highlights</h2>
            <p className="nayamo-section-subtitle mx-auto">
              Bespoke pieces that define elegance
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.slice(0, 6).map((product, i) => (
              <motion.div
                key={product._id}
                variants={staggerItem}
                whileHover={{ y: -15, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative nayamo-glass rounded-3xl p-6 shadow-2xl border border-white/[0.08] hover:border-[#D4A853]/20 transition-all duration-500 backdrop-blur-xl"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 shadow-xl">
                  <img
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&q=80"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.div
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Heart className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-semibold text-white group-hover:text-[#D4A853] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[#A1A1AA] text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold nayamo-text-gold">
                      Rs {product.price}
                    </span>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Link
                        to={`/product/${product._id}`}
                        className="inline-flex items-center gap-1.5 text-[#D4A853] font-medium hover:text-[#FFD700] transition-colors"
                      >
                        View <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4A853] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white m-1" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== ELEGANT BANNER ===== */}
      <section className="py-20 bg-gradient-to-r from-[#0A0A0C] via-[#070708] to-[#0A0A0C] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#D4A5A5]/5 rounded-full blur-[100px]" />
        </div>
        <div className="nayamo-container relative z-10">
          <motion.div
            {...fadeInUp}
            className="nayamo-glass rounded-[3rem] p-12 md:p-16 text-center border border-white/[0.08] backdrop-blur-xl shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center mx-auto mb-8 shadow-xl"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Experience <span className="nayamo-text-gold">Unparalleled</span> Luxury
            </h2>
            <p className="text-[#A1A1AA] text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of discerning customers who trust Nayamo for their most precious moments. Every piece tells a story of craftsmanship and elegance.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-3 nayamo-btn-primary text-lg px-8 py-4 shadow-2xl hover:shadow-[#D4A853]/30 transition-shadow duration-300"
              >
                <Zap className="w-5 h-5" />
                Shop Premium Collection
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="py-28 bg-[#070708]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-20"
          >
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
              Why Nayamo
            </span>
            <h2 className="nayamo-section-title mt-4">Crafted for Excellence</h2>
            <p className="nayamo-section-subtitle mx-auto">
              Discover what makes our jewellery truly exceptional
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Award,
                title: "Master Craftsmanship",
                desc: "Each piece is meticulously crafted by skilled artisans using premium materials and traditional techniques.",
                gradient: "from-[#D4A853] to-[#FFD700]",
              },
              {
                icon: Users,
                title: "Personalized Service",
                desc: "Our expert stylists provide personalized recommendations to help you find the perfect piece for any occasion.",
                gradient: "from-[#D4A5A5] to-[#FF6B9D]",
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                desc: "We stand behind every piece with our comprehensive warranty and satisfaction guarantee.",
                gradient: "from-[#D4A853] to-[#D4A5A5]",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -10 }}
                className="group relative nayamo-glass rounded-3xl p-8 border border-white/[0.06] hover:border-[#D4A853]/15 transition-all duration-500 backdrop-blur-xl"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-4 group-hover:text-[#D4A853] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  {feature.desc}
                </p>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4A853]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-28 bg-[#0A0A0C] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-[#D4A853] blur-[130px]" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-[#D4A5A5] blur-[130px]" />
        </div>
        <div className="nayamo-container relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-20">
            <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
              Client Love
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-4 text-white">
              Stories of Elegance
            </h2>
            <p className="text-[#A1A1AA] mt-4 text-lg">
              Hear from our discerning clientele
            </p>
          </motion.div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                name: "Priya Sharma",
                text: "These earrings transcend fashion—they're works of art. The craftsmanship is absolutely breathtaking.",
                rating: 5,
              },
              {
                name: "Ananya Patel",
                text: "Nayamo has redefined luxury jewellery. Every piece tells a story of unparalleled elegance and sophistication.",
                rating: 5,
              },
              {
                name: "Meera Gupta",
                text: "The attention to detail is extraordinary. These aren't just earrings; they're heirlooms for the modern woman.",
                rating: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -10, scale: 1.02 }}
                className="nayamo-card p-8 hover:bg-[#1E1E24] transition-all duration-500 border border-white/[0.06] hover:border-[#D4A853]/15 backdrop-blur-sm"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="w-5 h-5 fill-[#D4A853] text-[#D4A853]"
                    />
                  ))}
                </div>
                <p className="text-[#E4E4E7] text-base leading-relaxed mb-8 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center text-white font-bold text-sm shadow-xl">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-[#A1A1AA]">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="py-28 bg-[#070708]">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="nayamo-card p-12 md:p-16 text-center relative overflow-hidden border border-white/[0.08] backdrop-blur-xl"
          >
            {/* Enhanced background glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#D4A853]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#D4A5A5]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#D4A853]/5 rounded-full blur-[60px]" />

            <div className="relative z-10 max-w-lg mx-auto">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A853]/15 to-[#D4A5A5]/15 border border-[#D4A853]/20 flex items-center justify-center mx-auto mb-8 shadow-xl"
              >
                <Heart className="w-8 h-8 text-[#D4A5A5]" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-6">
                Join the <span className="nayamo-text-gold">Elite Circle</span>
              </h2>
              <p className="text-[#A1A1AA] mb-10 max-w-md mx-auto leading-relaxed text-lg">
                Be the first to discover our exclusive collections, styling secrets, and VIP offers. Luxury awaits.
              </p>
              <form
                className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="nayamo-input flex-1 text-center sm:text-left"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="nayamo-btn-rose whitespace-nowrap shadow-xl hover:shadow-[#D4A5A5]/30 transition-shadow duration-300"
                >
                  Join Now
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

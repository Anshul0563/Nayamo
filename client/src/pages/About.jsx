import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, Gem, Shield, Truck, Users } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const values = [
  {
    icon: Gem,
    title: "Premium Quality",
    desc: "Each piece is crafted with attention to detail, using high-grade materials that ensure durability and a luxurious finish.",
  },
  {
    icon: Heart,
    title: "Designed with Love",
    desc: "Our designs are inspired by the latest trends and timeless elegance, created to make every woman feel special.",
  },
  {
    icon: Shield,
    title: "Skin Friendly",
    desc: "All our earrings are hypoallergenic and nickel-free, making them safe for sensitive skin and comfortable for all-day wear.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "We process and ship orders within 24 hours, ensuring your favourite pieces reach you as quickly as possible.",
  },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "500+", label: "Unique Designs" },
  { value: "4.8", label: "Average Rating" },
  { value: "24h", label: "Fast Shipping" },
];

export default function About() {
  return (
    <div className="bg-[#070708]">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D4A853]/5 to-transparent blur-[100px]" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#D4A5A5]/5 to-transparent blur-[100px]" />
        </div>

        <div className="nayamo-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4A853]/8 border border-[#D4A853]/15 text-[#D4A853] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Crafting Elegance, <br />
              <span className="nayamo-text-gold">One Piece at a Time</span>
            </h1>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              Nayamo was born from a passion for beautiful, affordable jewellery.
              We believe every woman deserves to accessorize with confidence and
              style, without breaking the bank.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-[#0A0A0C] border-y border-white/[0.04]">
        <div className="nayamo-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold nayamo-text-gold mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-[#A1A1AA]">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="nayamo-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeInUp}>
              <span className="text-[#D4A5A5] text-sm font-semibold uppercase tracking-[0.2em]">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-3 mb-6">
                Making Fashion Accessible to Everyone
              </h2>
              <p className="text-[#A1A1AA] leading-relaxed mb-5">
                At Nayamo, our mission is simple: to bring high-quality, trendy
                fashion jewellery to every woman in India. We curate collections
                that blend traditional craftsmanship with modern aesthetics.
              </p>
              <p className="text-[#A1A1AA] leading-relaxed mb-8">
                From delicate daily wear studs to bold statement pieces for special
                occasions, every item in our store is chosen with care and
                designed to help you express your unique style.
              </p>
              <Link to="/shop" className="nayamo-btn-primary inline-flex items-center gap-2">
                Explore Collection
              </Link>
            </motion.div>
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/[0.06] shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=600&fit=crop&q=80"
                  alt="Jewellery craftsmanship"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070708]/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#0A0A0C]">
        <div className="nayamo-container">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-[#D4A853] text-sm font-semibold uppercase tracking-[0.2em]">
              What We Stand For
            </span>
            <h2 className="nayamo-section-title mt-3">Our Values</h2>
            <p className="nayamo-section-subtitle mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="nayamo-card p-8 border border-white/[0.04] hover:border-[#D4A853]/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-[#D4A853]/8 border border-[#D4A853]/10 flex items-center justify-center mb-5">
                  <value.icon className="w-6 h-6 text-[#D4A853]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-[#A1A1AA] leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Brand Promise */}
      <section className="py-24">
        <div className="nayamo-container">
          <motion.div
            {...fadeInUp}
            className="nayamo-card p-10 md:p-16 text-center relative overflow-hidden border border-white/[0.05]"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#D4A853]/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-[#D4A5A5]/8 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#D4A853]/10 border border-[#D4A853]/15 flex items-center justify-center mx-auto mb-6">
                <Users className="w-7 h-7 text-[#D4A853]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-4">
                Join the Nayamo Family
              </h2>
              <p className="text-[#A1A1AA] mb-8 leading-relaxed">
                Thousands of women across India trust Nayamo for their everyday
                and special occasion jewellery. We are committed to delivering
                exceptional products and an unforgettable shopping experience.
              </p>
              <Link to="/shop" className="nayamo-btn-primary inline-flex items-center gap-2">
                Start Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


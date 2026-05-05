import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
  ArrowUpRight,
  Crown,
  Sparkles,
  Heart,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0A0A0C] via-[#070708] to-[#0A0A0C] text-white border-t border-white/[0.08] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,168,83,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,165,165,0.03),transparent_50%)] pointer-events-none" />

      {/* Trust badges */}
      <motion.div
        className="relative border-b border-white/[0.08] backdrop-blur-sm"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="nayamo-container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above Rs 999" },
              { icon: Shield, title: "Hypoallergenic", desc: "Skin-safe materials" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: CreditCard, title: "COD Available", desc: "Pay on delivery" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl hover:bg-white/[0.06] hover:border-[#D4A853]/30 transition-all duration-500 group-hover:shadow-[0_8px_32px_rgba(212,168,83,0.2)]">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500"
                    whileHover={{ rotate: 5 }}
                  >
                    <badge.icon className="w-6 h-6 text-[#D4A853]" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-sm text-white mb-1">{badge.title}</p>
                    <p className="text-xs text-zinc-400 leading-tight">{badge.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main footer */}
      <motion.div
        className="relative nayamo-container py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Social */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <motion.div
              className="mb-6 flex items-center gap-4 group"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A853] via-[#FFD700] to-[#D4A853] shadow-[0_12px_40px_rgba(212,168,83,0.4)] ring-2 ring-white/20"
                whileHover={{ rotate: 5 }}
              >
                <Crown className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.p
                  className="text-white font-bold tracking-[0.3em] text-lg bg-gradient-to-r from-white to-[#D4A853] bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                >
                  NAYAMO
                </motion.p>
                <motion.p
                  className="text-[11px] uppercase tracking-[0.4em] text-[#D4A853] font-medium"
                  whileHover={{ x: 2 }}
                >
                  Luxury Jewellery
                </motion.p>
              </div>
            </motion.div>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs">
              India's finest destination for handcrafted earrings. From delicate
              studs to statement danglers, each pair is designed to make you
              shine with unparalleled elegance.
            </p>
            <div className="flex gap-4">
              {[
                { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/" },
                { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/" },
                { icon: FaWhatsapp, label: "WhatsApp", href: "https://wa.me/919718176159" },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-gradient-to-r hover:from-[#D4A853] hover:to-[#D4A5A5] hover:border-transparent hover:text-white transition-all duration-500 group hover:shadow-[0_8px_32px_rgba(212,168,83,0.3)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <social.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Collections */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A853]" />
              Collections
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { to: "/shop?category=party", label: "Party Wear" },
                { to: "/shop?category=daily", label: "Daily Wear" },
                { to: "/shop?category=traditional", label: "Traditional" },
                { to: "/shop?sort=newest", label: "New Arrivals" },
                { to: "/shop?sort=popular", label: "Best Sellers" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className="text-zinc-400 hover:text-[#D4A853] transition-all duration-300 inline-flex items-center gap-2 group relative"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4A853]/0 to-[#D4A853]/0 group-hover:from-[#D4A853]/10 group-hover:to-transparent rounded-lg transition-all duration-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#D4A5A5]" />
              Support
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { to: "/track-order", label: "Track Order" },
                { to: "/contact", label: "Contact Us" },
                { to: "/about", label: "About Us" },
                { to: "#", label: "Shipping Info" },
                { to: "#", label: "Returns Policy" },
                { to: "#", label: "FAQ" },
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Link
                    to={link.to}
                    className="text-zinc-400 hover:text-[#D4A5A5] transition-all duration-300 inline-flex items-center gap-2 group relative"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4A5A5]/0 to-[#D4A5A5]/0 group-hover:from-[#D4A5A5]/10 group-hover:to-transparent rounded-lg transition-all duration-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-6 text-sm uppercase tracking-[0.2em] text-zinc-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4A853]" />
              Contact Us
            </h4>
            <ul className="space-y-5 text-sm text-zinc-400">
              <motion.li
                className="flex items-start gap-4 group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-all duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <MapPin className="w-4 h-4 text-[#D4A853]" />
                </motion.div>
                <span className="leading-relaxed group-hover:text-zinc-300 transition-colors">Nayamo Earrings, Delhi, India</span>
              </motion.li>
              <motion.li
                className="flex items-center gap-4 group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <Phone className="w-4 h-4 text-[#D4A853]" />
                </motion.div>
                <span className="group-hover:text-zinc-300 transition-colors">+91 9718176159</span>
              </motion.li>
              <motion.li
                className="flex items-center gap-4 group"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  <Mail className="w-4 h-4 text-[#D4A853]" />
                </motion.div>
                <span className="group-hover:text-zinc-300 transition-colors">support@nayamo.com</span>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        className="relative border-t border-white/[0.08] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="nayamo-container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.p
            className="text-xs text-zinc-500"
            whileHover={{ scale: 1.02 }}
          >
            &copy; 2026 Nayamo. All rights reserved. Made with <Heart className="inline w-3 h-3 text-red-400 mx-1" /> for luxury.
          </motion.p>
          <div className="flex gap-8 text-xs text-zinc-500">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/privacy-policy" className="hover:text-zinc-300 transition-colors relative group">
                Privacy Policy
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4A853] group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link to="/terms-of-service" className="hover:text-zinc-300 transition-colors relative group">
                Terms of Service
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-[#D4A853] group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

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
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0C] text-white border-t border-white/[0.05]">
      {/* Trust badges */}
      <div className="border-b border-white/[0.05]">
        <div className="nayamo-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above Rs 999" },
              { icon: Shield, title: "Hypoallergenic", desc: "Skin-safe materials" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: CreditCard, title: "COD Available", desc: "Pay on delivery" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-xl bg-[#D4A853]/8 border border-[#D4A853]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A853]/15 transition-colors duration-300">
                  <badge.icon className="w-5 h-5 text-[#D4A853]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{badge.title}</p>
                  <p className="text-xs text-[#71717A]">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="nayamo-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & Social */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C9963B] flex items-center justify-center shadow-[0_4px_16px_rgba(212,168,83,0.25)]">
                <Sparkles className="w-4 h-4 text-[#070708]" />
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                Nayamo
              </span>
            </div>
            <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6 max-w-xs">
              India's finest destination for handcrafted earrings. From delicate
              studs to statement danglers, each pair is designed to make you
              shine.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaInstagram, label: "Instagram" },
                { icon: FaFacebookF, label: "Facebook" },
                { icon: FaWhatsapp, label: "WhatsApp" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-[#D4A853] hover:border-[#D4A853] hover:text-[#070708] transition-all duration-300 group"
                >
                  <social.icon className="w-4 h-4 text-[#A1A1AA] group-hover:text-[#070708] transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-medium mb-5 text-sm uppercase tracking-widest text-[#71717A]">
              Collections
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/shop?category=party", label: "Party Wear" },
                { to: "/shop?category=daily", label: "Daily Wear" },
                { to: "/shop?category=traditional", label: "Traditional" },
                { to: "/shop?sort=newest", label: "New Arrivals" },
                { to: "/shop?sort=popular", label: "Best Sellers" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[#A1A1AA] hover:text-[#D4A853] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-5 text-sm uppercase tracking-widest text-[#71717A]">
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/track-order", label: "Track Order" },
                { to: "/contact", label: "Contact Us" },
                { to: "/about", label: "About Us" },
                { to: "#", label: "Shipping Info" },
                { to: "#", label: "Returns Policy" },
                { to: "#", label: "FAQ" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-[#A1A1AA] hover:text-[#D4A853] transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-5 text-sm uppercase tracking-widest text-[#71717A]">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm text-[#A1A1AA]">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4A853]" />
                </div>
                <span className="leading-relaxed">Nayamo Earrings, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#D4A853]" />
                </div>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#D4A853]" />
                </div>
                <span>support@nayamo.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05]">
        <div className="nayamo-container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#52525B]">
            &copy; 2025 Nayamo. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[#52525B]">
            <Link to="#" className="hover:text-[#A1A1AA] transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-[#A1A1AA] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


import React from "react";
import { Link } from "react-router-dom";
import {
  MessageCircle,
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Trust badges */}
      <div className="border-b border-white/10">
        <div className="nayamo-container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#D4A853]" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-stone-400">On orders above Rs 999</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#D4A853]" />
              <div>
                <p className="font-medium text-sm">Hypoallergenic</p>
                <p className="text-xs text-stone-400">Skin-safe materials</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-[#D4A853]" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-stone-400">7-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#D4A853]" />
              <div>
                <p className="font-medium text-sm">COD Available</p>
                <p className="text-xs text-stone-400">Pay on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="nayamo-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Social */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
                <span className="text-white font-bold text-sm font-serif">N</span>
              </div>
              <span className="text-xl font-serif font-semibold">Nayamo</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-4">
              India's finest destination for handcrafted earrings. From delicate
              studs to statement danglers, each pair is designed to make you
              shine.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4A853] transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4A853] transition-colors"
              >
                <FaFacebookF className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4A853] transition-colors"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              Collections
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  to="/shop?category=gold"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Gold Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=silver"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Silver Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/shop?category=diamond"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Diamond Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link
                  to="/track-order"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-[#D4A853] transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-[#D4A853]" />
                <span>Nayamo Earrings, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A853]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A853]" />
                <span>support@nayamo.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="nayamo-container py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-stone-500">
            &copy; 2025 Nayamo. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-stone-500">
            <Link to="/" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


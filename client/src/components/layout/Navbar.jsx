import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const navLinkClass =
    "relative text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors duration-300 py-2 group";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="nayamo-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#C9963B] flex items-center justify-center shadow-[0_4px_16px_rgba(212,168,83,0.3)] group-hover:shadow-[0_6px_24px_rgba(212,168,83,0.5)] transition-shadow duration-300">
                <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Nayamo
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className={navLinkClass}>
                Home
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/shop" className={navLinkClass}>
                Shop All
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/shop?category=party" className={navLinkClass}>
                Party Wear
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/shop?category=daily" className={navLinkClass}>
                Daily Wear
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link to="/shop?category=traditional" className={navLinkClass}>
                Traditional
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earrings..."
                  className="w-44 lg:w-56 pl-10 pr-4 py-2 rounded-full text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#6B7280] outline-none focus:border-[#D4A853]/40 focus:bg-white/[0.08] transition-all duration-300"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
              </form>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-white/[0.06] transition-colors group"
              >
                <Heart className="w-[18px] h-[18px] text-[#9CA3AF] group-hover:text-[#D4A5A5] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-gradient-to-br from-[#D4A5A5] to-[#C48888] text-[10px] font-bold text-[#0A0A0A] flex items-center justify-center shadow-lg">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full hover:bg-white/[0.06] transition-colors group"
              >
                <ShoppingBag className="w-[18px] h-[18px] text-[#9CA3AF] group-hover:text-[#D4A853] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9963B] text-[10px] font-bold text-[#0A0A0A] flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="p-2.5 rounded-full hover:bg-white/[0.06] transition-colors group"
                  >
                    <User className="w-[18px] h-[18px] text-[#9CA3AF] group-hover:text-white transition-colors" />
                  </Link>
                  <button
                    onClick={() => { logout(); navigate("/"); }}
                    className="p-2.5 rounded-full hover:bg-white/[0.06] transition-colors group"
                  >
                    <LogOut className="w-[18px] h-[18px] text-[#9CA3AF] group-hover:text-[#D4A5A5] transition-colors" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:inline-flex nayamo-btn-primary text-xs px-5 py-2"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#0F0F0F] border-l border-white/[0.06] p-6 pt-20 shadow-2xl"
            >
              <form onSubmit={handleSearch} className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earrings..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#6B7280] outline-none focus:border-[#D4A853]/40"
                />
              </form>

              <nav className="flex flex-col gap-1">
                {[
                  { to: "/", label: "Home" },
                  { to: "/shop", label: "Shop All" },
                  { to: "/shop?category=party", label: "Party Wear" },
                  { to: "/shop?category=daily", label: "Daily Wear" },
                  { to: "/shop?category=traditional", label: "Traditional" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.05] font-medium transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-white hover:bg-white/[0.05] font-medium transition-all"
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}
                      className="px-4 py-3 rounded-xl text-[#9CA3AF] hover:text-[#D4A5A5] hover:bg-white/[0.05] font-medium text-left transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="nayamo-btn-primary text-center"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

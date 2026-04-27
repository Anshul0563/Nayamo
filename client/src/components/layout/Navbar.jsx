import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#070708]/85 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
        }`}
      >
        <div className="nayamo-container">
          <div className="flex items-center justify-between h-18 md:h-20">
            {/* Logo */}
            <Link to="/" className="z-10">
              <Logo size="sm" showText={true} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`relative text-sm font-medium transition-colors duration-300 py-2 group ${
                      isActive
                        ? "text-white"
                        : "text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] transition-all duration-300 ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 240, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      onSubmit={handleSearch}
                      className="absolute right-10 top-1/2 -translate-y-1/2 overflow-hidden"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        autoFocus
                        className="w-full pl-4 pr-4 py-2 rounded-full text-sm bg-[#131316] border border-white/[0.08] text-white placeholder-[#71717A] outline-none focus:border-[#D4A853]/40 transition-all"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors group"
                >
                  {searchOpen ? (
                    <X className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-white transition-colors" />
                  ) : (
                    <Search className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-white transition-colors" />
                  )}
                </button>
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2.5 rounded-full hover:bg-white/[0.05] transition-colors group"
              >
                <Heart className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-[#D4A5A5] transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#D4A5A5] to-[#C48888] text-[10px] font-bold text-[#070708] flex items-center justify-center shadow-lg px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full hover:bg-white/[0.05] transition-colors group"
              >
                <ShoppingBag className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-[#D4A853] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9963B] text-[10px] font-bold text-[#070708] flex items-center justify-center shadow-lg px-1">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="p-2.5 rounded-full hover:bg-white/[0.05] transition-colors group"
                  >
                    <User className="w-[18px] h-[18px] text-[#A1A1AA] group-hover:text-white transition-colors" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-3 w-52 nayamo-glass rounded-2xl p-2 shadow-2xl border border-white/[0.08]"
                      >
                        <div className="px-3 py-2 mb-1 border-b border-white/[0.06]">
                          <p className="text-sm font-medium text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-[#71717A] truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        <div className="border-t border-white/[0.06] mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              navigate("/");
                            }}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#D4A5A5] hover:text-[#ECC5C5] hover:bg-[#D4A5A5]/10 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                className="md:hidden p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 text-white" />
                ) : (
                  <Menu className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-[#0A0A0C] border-l border-white/[0.06] p-6 pt-24 shadow-2xl"
            >
              <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earrings..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-[#131316] border border-white/[0.08] text-white placeholder-[#71717A] outline-none focus:border-[#D4A853]/40 transition-all"
                />
              </form>

              <nav className="flex flex-col gap-1">
                {navLinks.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 + 0.1 }}
                  >
                    <Link
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] font-medium transition-all"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] font-medium transition-all"
                    >
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] font-medium transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#D4A5A5] hover:text-[#ECC5C5] hover:bg-[#D4A5A5]/10 font-medium text-left transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
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

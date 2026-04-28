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

const actionButtonClass =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-[#B9B9C2] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4A853]/30 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_10px_28px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/45";

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

  const handleSearchToggle = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(true);
      return;
    }
    setSearchOpen((open) => !open);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#070708]/88 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_14px_45px_rgba(0,0,0,0.48)]"
            : "bg-gradient-to-b from-[#070708]/78 via-[#070708]/35 to-transparent"
        }`}
      >
        <div className="nayamo-container">
          <div className="grid h-20 grid-cols-[auto_1fr_auto] items-center gap-4 md:h-24 md:gap-8">
            {/* Logo */}
            <Link
              to="/"
              aria-label="Nayamo home"
              className="z-10 -ml-2 inline-flex min-w-0 items-center rounded-2xl px-2 py-1 transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853]/45"
            >
              <Logo size="nav" showText={false} glow={false} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden items-center justify-center md:flex">
              <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(link.to);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`relative rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 group ${
                      isActive
                        ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                        : "text-[#B5B5BE] hover:bg-white/[0.045] hover:text-white"
                    }`}
                  >
                    {link.label}
                    <span
                      className={`absolute bottom-1.5 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#D4A853] to-[#D4A5A5] transition-all duration-300 ${
                        isActive ? "w-6" : "w-0 group-hover:w-6"
                      }`}
                    />
                  </Link>
                );
              })}
              </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center justify-end gap-2 md:gap-2.5">
              {/* Search */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      onSubmit={handleSearch}
                      className="absolute right-12 top-1/2 hidden -translate-y-1/2 overflow-hidden md:block"
                    >
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        autoFocus
                        className="w-full rounded-full border border-white/[0.09] bg-[#101012]/95 py-3 pl-5 pr-4 text-sm text-white shadow-[0_16px_34px_rgba(0,0,0,0.34)] outline-none transition-all placeholder:text-[#71717A] focus:border-[#D4A853]/45"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button
                  onClick={handleSearchToggle}
                  aria-label={searchOpen ? "Close search" : "Open search"}
                  className={actionButtonClass}
                >
                  {searchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className={`${actionButtonClass} hover:text-[#D4A5A5]`}
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br from-[#D4A5A5] to-[#C48888] px-1 text-[10px] font-bold text-[#070708] shadow-lg ring-2 ring-[#070708]">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                aria-label="Cart"
                className={`${actionButtonClass} hover:text-[#D4A853]`}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9963B] px-1 text-[10px] font-bold text-[#070708] shadow-lg ring-2 ring-[#070708]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Open account menu"
                    className={actionButtonClass}
                  >
                    <User className="h-5 w-5" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="nayamo-glass absolute right-0 top-full mt-4 w-56 rounded-2xl border border-white/[0.08] p-2 shadow-2xl"
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
                  className="nayamo-btn-primary hidden px-5 py-2.5 text-xs md:inline-flex"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white transition-all duration-300 hover:bg-white/[0.08] md:hidden"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
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
              className="absolute bottom-0 right-0 top-0 flex w-[min(88vw,360px)] flex-col border-l border-white/[0.08] bg-[#0A0A0C]/96 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Nayamo home"
                  className="-ml-2 inline-flex rounded-2xl px-2 py-1"
                >
                  <Logo size="nav" showText={false} glow={false} />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative mb-7">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8B94]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search earrings..."
                  className="w-full rounded-2xl border border-white/[0.09] bg-[#131316] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-[#71717A] focus:border-[#D4A853]/45 focus:shadow-[0_0_0_3px_rgba(212,168,83,0.08)]"
                />
              </form>

              <nav className="flex flex-col gap-2">
                {navLinks.map((item, i) => {
                  const isActive =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to);

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 + 0.1 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-4 font-medium transition-all ${
                          isActive
                            ? "border border-[#D4A853]/20 bg-[#D4A853]/10 text-white"
                            : "text-[#B5B5BE] hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {item.label}
                        <ChevronRight
                          className={`h-4 w-4 ${isActive ? "text-[#D4A853]" : "text-[#71717A]"}`}
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-2 border-t border-white/[0.08] pt-6">
                <div className="mb-3 grid grid-cols-2 gap-3">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm font-medium text-[#E4E4E7]"
                  >
                    <Heart className="h-4 w-4 text-[#D4A5A5]" />
                    Wishlist
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 text-sm font-medium text-[#E4E4E7]"
                  >
                    <ShoppingBag className="h-4 w-4 text-[#D4A853]" />
                    Cart
                  </Link>
                </div>
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[#B5B5BE] transition-all hover:bg-white/[0.05] hover:text-white"
                    >
                      <User className="h-4 w-4" /> My Account
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[#B5B5BE] transition-all hover:bg-white/[0.05] hover:text-white"
                    >
                      <ShoppingBag className="h-4 w-4" /> My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-medium text-[#D4A5A5] transition-all hover:bg-[#D4A5A5]/10 hover:text-[#ECC5C5]"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
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

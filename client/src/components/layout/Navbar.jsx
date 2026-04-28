import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  LogOut,
  ChevronDown,
  Package,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../common/Logo";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const links = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
  };

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  // ── Premium icon button base ───────────────────────────────────────────
  const iconBtn =
    "relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4A853]/30 hover:bg-white/[0.07] hover:text-white hover:shadow-[0_8px_24px_rgba(212,168,83,0.12)]";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-[#090909]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
      >
        <div className="nayamo-container">
          {/* Desktop: h-24 (96px) | Mobile: h-20 (80px) */}
          <div className="flex h-20 lg:h-24 items-center justify-between gap-4 lg:gap-6">
            {/* ── LOGO ────────────────────────────────────────────────────── */}
            <Link
              to="/"
              className="shrink-0 group flex items-center gap-3 lg:gap-4 rounded-2xl px-2 py-1.5 hover:bg-white/[0.04] transition-all duration-300"
            >
              {/* Logo container: larger, no overflow clipping */}
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 lg:h-[72px] lg:w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] via-[#f0cf88] to-[#8a6424] shadow-[0_12px_36px_rgba(212,168,83,0.28)] ring-1 ring-white/10 group-hover:scale-[1.04] group-hover:shadow-[0_16px_44px_rgba(212,168,83,0.35)] transition-all duration-400">
                <Logo size="2xl" showText={false} glow={false} />
              </div>
              {/* Brand text */}
              <div className="hidden sm:block leading-none">
                <p className="text-white font-bold tracking-[0.28em] text-[13px] lg:text-[15px]">
                  NAYAMO
                </p>
                <p className="text-[10px] lg:text-[11px] uppercase tracking-[0.42em] text-[#D4A853] mt-1 font-medium">
                  Luxury Jewellery
                </p>
              </div>
            </Link>

            {/* ── NAV LINKS ───────────────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-2 backdrop-blur-xl">
              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-5 py-2.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-300 group ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.name}
                  {/* Active pill background */}
                  {isActive(item.path) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] border border-[#D4A853]/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {/* Hover underline */}
                  <span
                    className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#D4A853] to-transparent transition-all duration-300 ${
                      isActive(item.path)
                        ? "w-4 opacity-60"
                        : "w-0 opacity-0 group-hover:w-6 group-hover:opacity-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* ── RIGHT ICONS ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search */}
              <div className="relative hidden md:block" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      onSubmit={submitSearch}
                      initial={{ opacity: 0, width: 0, x: 20 }}
                      animate={{ opacity: 1, width: 220, x: 0 }}
                      exit={{ opacity: 0, width: 0, x: 20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 overflow-hidden"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search jewellery..."
                        className="w-full min-w-0 h-12 rounded-xl border border-white/[0.08] bg-[#0e0e0e]/95 px-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#D4A853]/40 focus:ring-1 focus:ring-[#D4A853]/20 transition-all"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button
                  className={iconBtn}
                  onClick={() => setSearchOpen((p) => !p)}
                  aria-label="Search"
                >
                  {searchOpen ? <X size={20} strokeWidth={1.5} /> : <Search size={20} strokeWidth={1.5} />}
                </button>
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className={iconBtn} aria-label="Wishlist">
                <Heart size={20} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 text-[#3a0a18] text-[10px] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(244,114,182,0.35)]">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className={iconBtn} aria-label="Cart">
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9963B] text-black text-[10px] font-bold flex items-center justify-center shadow-[0_2px_8px_rgba(212,168,83,0.35)]">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User / Profile */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    className="flex items-center gap-2.5 h-12 pl-3 pr-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.07] hover:border-[#D4A853]/30 transition-all duration-300"
                    onClick={() => setProfileOpen((p) => !p)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A853]/20 to-[#C9963B]/10 border border-[#D4A853]/20">
                      <User size={15} strokeWidth={1.5} className="text-[#D4A853]" />
                    </div>
                    <span className="max-w-[80px] lg:max-w-[110px] truncate text-[13px] font-medium">
                      {user?.name || "Account"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-16 w-64 rounded-2xl border border-white/[0.06] bg-[#0f0f11]/98 p-2 shadow-[0_24px_48px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                      >
                        {/* User info header */}
                        <div className="px-3.5 py-3 border-b border-white/[0.06] mb-1.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A853]/25 to-[#C9963B]/10 border border-[#D4A853]/25">
                              <Crown size={15} className="text-[#D4A853]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-white font-semibold truncate">
                                {user?.name}
                              </p>
                              <p className="text-[11px] text-zinc-500 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <User size={15} className="text-zinc-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-zinc-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          <Package size={15} className="text-zinc-500" />
                          My Orders
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            navigate("/");
                          }}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] text-red-300 hover:text-red-200 hover:bg-red-500/[0.08] transition-colors mt-1"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex h-12 px-6 items-center rounded-xl bg-gradient-to-r from-[#D4A853] to-[#f0cf88] text-black font-semibold text-[13px] tracking-wide hover:scale-[1.03] hover:shadow-[0_8px_28px_rgba(212,168,83,0.35)] transition-all duration-300"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.07] transition-all duration-300"
                onClick={() => setMobileOpen(true)}
                aria-label="Menu"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="absolute right-0 top-0 h-full w-[88vw] max-w-sm bg-[#0c0c0e] border-l border-white/[0.06] flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] via-[#f0cf88] to-[#8a6424] shadow-[0_10px_30px_rgba(212,168,83,0.22)] ring-1 ring-white/10">
                    <Logo size="xl" showText={false} glow={false} />
                  </div>
                  <div className="leading-none">
                    <p className="text-white font-bold tracking-[0.25em] text-[13px]">NAYAMO</p>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#D4A853] mt-1">Luxury Jewellery</p>
                  </div>
                </div>
                <button
                  className="h-11 w-11 rounded-xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white hover:bg-white/[0.07] transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Search */}
              <form onSubmit={submitSearch} className="px-5 mb-5">
                <div className="relative">
                  <Search
                    size={16}
                    strokeWidth={1.5}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search jewellery..."
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder-zinc-500 outline-none focus:border-[#D4A853]/30 focus:bg-white/[0.06] transition-all"
                  />
                </div>
              </form>

              {/* Nav links */}
              <nav className="px-5 space-y-1.5 flex-1 overflow-y-auto">
                {links.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-[14px] font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? "bg-[#D4A853]/12 text-white border border-[#D4A853]/20 shadow-[0_2px_12px_rgba(212,168,83,0.08)]"
                          : "text-zinc-300 bg-white/[0.03] border border-transparent hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive(item.path) ? "bg-[#D4A853]" : "bg-zinc-600"
                        }`}
                      />
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom actions */}
              <div className="px-5 pt-4 pb-6 border-t border-white/[0.06] space-y-2">
                <div className="flex gap-2">
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 bg-white/[0.04] border border-white/[0.06] text-zinc-200 text-[13px] font-medium hover:bg-white/[0.07] transition-colors"
                  >
                    <Heart size={16} strokeWidth={1.5} />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-300 text-[#3a0a18] text-[10px] font-bold flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 bg-white/[0.04] border border-white/[0.06] text-zinc-200 text-[13px] font-medium hover:bg-white/[0.07] transition-colors"
                  >
                    <ShoppingBag size={16} strokeWidth={1.5} />
                    Cart
                    {cartCount > 0 && (
                      <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A853] text-black text-[10px] font-bold flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      navigate("/");
                      setMobileOpen(false);
                    }}
                    className="w-full rounded-xl py-3 bg-red-500/[0.08] border border-red-500/15 text-red-300 text-[13px] font-medium hover:bg-red-500/[0.12] transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center rounded-xl py-3 bg-gradient-to-r from-[#D4A853] to-[#f0cf88] text-black text-[13px] font-semibold hover:shadow-[0_8px_24px_rgba(212,168,83,0.25)] transition-shadow"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20 lg:h-24" />
    </>
  );
}


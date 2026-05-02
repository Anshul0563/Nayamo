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
  Crown,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  const { scrollY } = useScroll();
  const navbarBlur = useTransform(scrollY, [0, 100], [8, 16]);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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

  const iconBtn = "relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-zinc-200 transition-all duration-500 hover:-translate-y-1 hover:border-[#D4A853]/50 hover:bg-white/15 hover:text-white hover:shadow-[0_8px_32px_rgba(212,168,83,0.3)] backdrop-blur-xl";

  return (
    <>
      <motion.header
        style={{
          backgroundColor: scrolled ? "rgba(9, 9, 9, 0.9)" : "rgba(7, 7, 8, 0.1)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nayamo-container">
          <div className="flex h-24 items-center justify-between gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" className="shrink-0 group flex items-center gap-4 rounded-3xl px-3 py-2 hover:bg-white/5 transition-all duration-500">
                <motion.div
                  className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A853] via-[#FFD700] to-[#D4A853] shadow-[0_12px_40px_rgba(212,168,83,0.4)] ring-2 ring-white/20 group-hover:scale-110 transition-all duration-500 overflow-hidden"
                  whileHover={{ rotate: 5 }}
                >
                  <Crown className="w-7 h-7 text-white" />
                </motion.div>
                <div className="hidden sm:block leading-tight">
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
              </Link>
            </motion.div>

            <nav className="hidden lg:flex items-center gap-3 rounded-3xl border border-white/15 bg-white/8 px-3 py-3 backdrop-blur-2xl shadow-xl">
              {links.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 ${isActive(item.path) ? "text-white bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30" : "text-zinc-400 hover:text-white hover:bg-white/10"}`}
                  >
                    {item.name}
                    {isActive(item.path) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-2xl border-2 border-[#D4A853]/50 shadow-[0_0_20px_rgba(212,168,83,0.3)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      onSubmit={submitSearch}
                      initial={{ opacity: 0, width: 0, scale: 0.8 }}
                      animate={{ opacity: 1, width: 200, scale: 1 }}
                      exit={{ opacity: 0, width: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="absolute right-14 top-1/2 -translate-y-1/2 overflow-hidden"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search luxury pieces..."
                        className="w-full min-w-0 h-12 rounded-2xl border-2 border-white/20 bg-[#111]/95 backdrop-blur-xl px-4 text-sm text-white outline-none focus:border-[#D4A853]/60 focus:ring-2 focus:ring-[#D4A853]/20 transition-all duration-300"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <motion.button
                  className={iconBtn}
                  onClick={() => setSearchOpen((p) => !p)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </motion.button>
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/wishlist" className={iconBtn}>
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to="/cart" className={iconBtn}>
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1.5 rounded-full bg-gradient-to-r from-[#D4A853] to-[#FFD700] text-black text-[10px] font-bold flex items-center justify-center shadow-lg"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <motion.button
                    className="flex items-center gap-3 h-12 px-4 rounded-2xl border border-white/15 bg-white/8 text-white hover:bg-white/15 transition-all duration-500 backdrop-blur-xl shadow-lg"
                    onClick={() => setProfileOpen((p) => !p)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-medium">{user?.name || "Account"}</span>
                    <motion.div
                      animate={{ rotate: profileOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute right-0 top-16 w-72 rounded-3xl border border-white/15 bg-[#111]/95 p-3 shadow-2xl backdrop-blur-2xl"
                      >
                        <div className="px-4 py-3 border-b border-white/10 mb-3 rounded-2xl bg-gradient-to-r from-[#D4A853]/10 to-[#D4A5A5]/10">
                          <p className="text-sm text-white font-bold truncate">{user?.name}</p>
                          <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <Link to="/profile" className="block px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <User size={16} />
                              My Profile
                            </div>
                          </Link>
                          <Link to="/orders" className="block px-4 py-3 rounded-2xl text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <ShoppingBag size={16} />
                              My Orders
                            </div>
                          </Link>
                          <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-300 mt-2"
                          >
                            <div className="flex items-center gap-3">
                              <LogOut size={16} />
                              Sign Out
                            </div>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/login" className="hidden md:flex h-12 px-6 items-center rounded-2xl bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black font-bold hover:shadow-[0_8px_32px_rgba(212,168,83,0.4)] transition-all duration-500">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </motion.div>
              )}

              <motion.button
                className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-white hover:bg-white/15 transition-all duration-500 backdrop-blur-xl"
                onClick={() => setMobileOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu size={22} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-[90vw] max-w-sm bg-gradient-to-b from-[#0d0d0f] to-[#111] border-l border-white/15 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-[#D4A853] via-[#FFD700] to-[#D4A853] shadow-[0_8px_32px_rgba(212,168,83,0.3)]"
                  whileHover={{ rotate: 10 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <motion.button
                  className="h-12 w-12 rounded-2xl border border-white/15 bg-white/10 flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <motion.form
                onSubmit={submitSearch}
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search luxury pieces..."
                  className="w-full h-12 rounded-2xl bg-white/10 border border-white/15 px-4 text-white outline-none focus:border-[#D4A853]/50 focus:ring-2 focus:ring-[#D4A853]/20 transition-all duration-300 backdrop-blur-sm"
                />
              </motion.form>

              <motion.div
                className="space-y-3 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {links.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-2xl px-5 py-4 text-base font-semibold transition-all duration-500 ${isActive(item.path) ? 'bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 text-white border border-[#D4A853]/30 shadow-lg' : 'text-zinc-300 bg-white/10 hover:bg-white/15 hover:text-white'}`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-auto pt-6 border-t border-white/15 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link to="/wishlist" className="block rounded-2xl px-5 py-4 bg-white/10 text-zinc-200 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <Heart size={18} />
                    Wishlist
                  </div>
                </Link>
                <Link to="/cart" className="block rounded-2xl px-5 py-4 bg-white/10 text-zinc-200 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} />
                    Cart
                  </div>
                </Link>
                {isAuthenticated ? (
                  <motion.button
                    onClick={() => { logout(); navigate('/'); }}
                    className="w-full rounded-2xl px-5 py-4 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <LogOut size={18} />
                      Sign Out
                    </div>
                  </motion.button>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to="/login" className="block text-center rounded-2xl px-5 py-4 bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black font-bold shadow-lg hover:shadow-[0_8px_32px_rgba(212,168,83,0.4)] transition-all duration-500">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Sign In
                      </div>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24" />
    </>
  );
}
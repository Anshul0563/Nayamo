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
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  const iconBtn =
    "relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4A853]/40 hover:bg-white/10 hover:text-white";

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#090909]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"}`}>
        <div className="nayamo-container">
          <div className="flex h-20 items-center justify-between gap-4">
            <Link to="/" className="shrink-0 group flex items-center gap-3 rounded-2xl px-2 py-1.5 hover:bg-white/5 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] via-[#f0cf88] to-[#8a6424] shadow-[0_10px_30px_rgba(212,168,83,0.28)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <Logo size="nav" showText={false} glow={false} />
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-white font-semibold tracking-[0.22em] text-sm">NAYAMO</p>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#D4A853]">Luxury Jewellery</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 backdrop-blur-xl">
              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(item.path) ? "text-white bg-white/10" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
                >
                  {item.name}
                  {isActive(item.path) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-[#D4A853]/30"
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      onSubmit={submitSearch}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 150 }}
                      exit={{ opacity: 0, width: 0 }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 overflow-hidden w-[150px]"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full min-w-0 h-11 rounded-full border border-white/10 bg-[#111]/95 px-3 text-sm text-white outline-none focus:border-[#D4A853]/40"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button className={iconBtn} onClick={() => setSearchOpen((p) => !p)}>
                  {searchOpen ? <X size={18} /> : <Search size={18} />}
                </button>
              </div>

              <Link to="/wishlist" className={iconBtn}>
                <Heart size={18} />
                {wishlistCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-300 text-black text-[10px] font-bold flex items-center justify-center">{wishlistCount}</span>}
              </Link>

              <Link to="/cart" className={iconBtn}>
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4A853] text-black text-[10px] font-bold flex items-center justify-center">{cartCount}</span>}
              </Link>

              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button className="flex items-center gap-2 h-11 px-3 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all" onClick={() => setProfileOpen((p) => !p)}>
                    <User size={16} />
                    <span className="max-w-[90px] truncate text-sm">{user?.name || "Account"}</span>
                    <ChevronDown size={14} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-14 w-64 rounded-2xl border border-white/10 bg-[#111]/95 p-2 shadow-2xl backdrop-blur-xl"
                      >
                        <div className="px-3 py-2 border-b border-white/10 mb-2">
                          <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
                          <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                        </div>
                        <Link to="/profile" className="block px-3 py-2 rounded-xl text-sm text-zinc-300 hover:bg-white/5">My Profile</Link>
                        <Link to="/orders" className="block px-3 py-2 rounded-xl text-sm text-zinc-300 hover:bg-white/5">My Orders</Link>
                        <button
                          onClick={() => { logout(); navigate('/'); }}
                          className="w-full text-left px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-500/10 mt-1"
                        >
                          <span className="inline-flex items-center gap-2"><LogOut size={14} /> Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex h-11 px-5 items-center rounded-full bg-gradient-to-r from-[#D4A853] to-[#f0cf88] text-black font-semibold hover:scale-105 transition-all">
                  Sign In
                </Link>
              )}

              <button className="lg:hidden flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white" onClick={() => setMobileOpen(true)}>
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="absolute right-0 top-0 h-full w-[88vw] max-w-sm bg-[#0d0d0f] border-l border-white/10 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] via-[#f0cf88] to-[#8a6424] shadow-[0_10px_30px_rgba(212,168,83,0.22)] ring-1 ring-white/10 overflow-hidden"><Logo size="nav" showText={false} glow={false} /></div>
                <button className="h-10 w-10 rounded-full border border-white/10" onClick={() => setMobileOpen(false)}><X className="mx-auto" size={18} /></button>
              </div>

              <form onSubmit={submitSearch} className="mb-5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-white outline-none"
                />
              </form>

              <div className="space-y-2">
                {links.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-xl px-4 py-3 ${isActive(item.path) ? 'bg-[#D4A853]/15 text-white border border-[#D4A853]/20' : 'text-zinc-300 bg-white/5'}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-5 border-t border-white/10 space-y-2">
                <Link to="/wishlist" className="block rounded-xl px-4 py-3 bg-white/5 text-zinc-200">Wishlist</Link>
                <Link to="/cart" className="block rounded-xl px-4 py-3 bg-white/5 text-zinc-200">Cart</Link>
                {isAuthenticated ? (
                  <button onClick={() => { logout(); navigate('/'); }} className="w-full rounded-xl px-4 py-3 bg-red-500/10 text-red-300">Sign Out</button>
                ) : (
                  <Link to="/login" className="block text-center rounded-xl px-4 py-3 bg-[#D4A853] text-black font-semibold">Sign In</Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-20" />
    </>
  );
}

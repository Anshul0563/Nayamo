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
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
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
  const navbarBlur = useTransform(scrollY, [0, 100], [10, 20]);

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

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const iconBtn =
    "relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 text-zinc-200 transition-all duration-500 hover:-translate-y-1 hover:border-[#D4A853]/60 hover:text-white hover:shadow-[0_10px_40px_rgba(212,168,83,0.35)] backdrop-blur-xl";

  return (
    <>
      <motion.header
        style={{
          backgroundColor: scrolled ? "rgba(9,9,9,0.9)" : "rgba(7,7,8,0.2)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        {/* Top light reflection */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="nayamo-container">
          <div className="flex h-24 items-center justify-between gap-4">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-4 group">
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-3xl"
              >
                <motion.img
                  src={logo}
                  alt="Nayamo Logo"
                  className="h-12 w-12 object-contain drop-shadow-[0_8px_24px_rgba(212,168,83,0.3)]"
                  whileHover={{ scale: 1.1 }}
                />
              </motion.div>

              <div className="hidden sm:block">
                <p className="text-white font-bold tracking-[0.3em] text-lg bg-gradient-to-r from-white to-[#D4A853] bg-clip-text text-transparent">
                  NAYAMO
                </p>
                <p className="text-[11px] uppercase tracking-[0.4em] text-[#D4A853]">
                  Luxury Jewellery
                </p>
              </div>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-3 py-3 backdrop-blur-2xl shadow-xl">
              {links.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 group ${
                      isActive(item.path)
                        ? "text-white bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.name}

                    {/* Glow */}
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-[#D4A853]/10 to-[#FFD700]/10 blur-xl" />

                    {/* Active border */}
                    {isActive(item.path) && (
                      <>
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl border-2 border-[#D4A853]/50"
                        />
                        <motion.div
                          layoutId="underline"
                          className="absolute bottom-1 left-1/2 w-6 h-[2px] bg-[#D4A853] rounded-full"
                          style={{ translateX: "-50%" }}
                        />
                      </>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

              {/* SEARCH */}
              <div className="relative hidden md:block" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      onSubmit={submitSearch}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 220 }}
                      exit={{ opacity: 0, width: 0 }}
                      className="absolute right-14 top-1/2 -translate-y-1/2"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full h-12 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl px-4 text-sm text-white outline-none focus:border-[#D4A853]/60"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>

                <button className={iconBtn} onClick={() => setSearchOpen(!searchOpen)}>
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>

              {/* WISHLIST */}
              <Link to="/wishlist" className={iconBtn}>
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-pink-500 text-white px-1.5 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link to="/cart" className={iconBtn}>
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-black px-1.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* AUTH */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="hidden md:flex h-12 px-5 items-center rounded-2xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                >
                  <LogOut size={18} />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex h-12 px-6 items-center rounded-2xl bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] text-black font-bold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              )}

              {/* MOBILE */}
              <button
                className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 h-full w-[90vw] max-w-sm bg-black p-6"
            >
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>

              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block py-4 text-white"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-24" />
    </>
  );
}
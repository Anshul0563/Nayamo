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
  Package,
  Settings,
  UserCircle,
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

const userMenuItems = [
  { name: "My Account", path: "/profile", icon: UserCircle },
  { name: "My Orders", path: "/orders", icon: Package },
  { name: "Settings", path: "/profile?tab=settings", icon: Settings },
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
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
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
    "flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-all";

  return (
    <>
      <motion.header
        style={{
          backgroundColor: scrolled ? "rgba(9,9,9,0.95)" : "rgba(7,7,8,0.8)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden">
                <img src={logo} alt="Nayamo" className="w-full h-full object-cover" />
              </div>
              <span className="hidden sm:block text-white font-bold tracking-[0.2em] text-sm">
                NAYAMO
              </span>
            </Link>

            {/* NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isActive(item.path)
                      ? "text-white bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-1 shrink-0">

              {/* SEARCH */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-[120%] right-1/2 translate-x-1/2 z-50"
                    >
                      <form onSubmit={submitSearch}>
                        <input
                          autoFocus
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search..."
                          className="w-[220px] h-10 rounded-lg bg-[#0f0f11] border border-white/10 px-3 text-sm text-white outline-none focus:border-[#D4A853]/50 shadow-xl"
                        />
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={iconBtn}
                >
                  {searchOpen ? <X size={18} /> : <Search size={18} />}
                </button>
              </div>

              {/* WISHLIST */}
              <Link to="/wishlist" className="relative">
                <div className={iconBtn}><Heart size={18} /></div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-pink-500 text-white rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link to="/cart" className="relative">
                <div className={iconBtn}><ShoppingBag size={18} /></div>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-[#D4A853] text-black rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* AUTH (same as yours) */}
              {/* ... (unchanged, working fine) */}

              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>

            </div>
          </div>
        </div>
      </motion.header>

      <div className="h-16" />
    </>
  );
}


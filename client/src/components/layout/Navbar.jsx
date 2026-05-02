
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
  };

  const iconBtn =
    "relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-xl";

  return (
    <>
      {/* 🔥 SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xl flex items-start justify-center pt-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              onSubmit={submitSearch}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xl px-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search luxury jewellery..."
                  className="w-full h-14 pl-12 pr-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white outline-none focus:border-[#D4A853]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <motion.header
        style={{
          backgroundColor: scrolled ? "rgba(9,9,9,0.9)" : "rgba(7,7,8,0.2)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/10"
      >
        <div className="nayamo-container flex h-24 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} className="h-10" />
            <span className="text-white font-bold tracking-widest">NAYAMO</span>
          </Link>

          {/* NAV */}
          <nav className="hidden lg:flex gap-6">
            {links.map((l) => (
              <Link key={l.name} to={l.path} className="text-zinc-300 hover:text-white">
                {l.name}
              </Link>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button className={iconBtn} onClick={() => setSearchOpen(true)}>
              <Search />
            </button>

            <Link to="/wishlist" className={iconBtn}>
              <Heart />
            </Link>

            <Link to="/cart" className={iconBtn}>
              <ShoppingBag />
            </Link>

            {isAuthenticated ? (
              <div ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)} className={iconBtn}>
                  <User />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-white">
                Sign In
              </Link>
            )}

            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="h-24" />
    </>
  );
}


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

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "text-white bg-white/10"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-1 shrink-0">
              {/* SEARCH */}
              <div className="relative" ref={searchRef}>
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={submitSearch}
                      className="overflow-hidden"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full h-9 rounded-lg bg-white/10 border border-white/10 px-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[#D4A853]/50"
                      />
                    </motion.form>
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
                <div className={iconBtn}>
                  <Heart size={18} />
                </div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-pink-500 text-white rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link to="/cart" className="relative">
                <div className={iconBtn}>
                  <ShoppingBag size={18} />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] bg-[#D4A853] text-black rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* AUTH */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="hidden md:block text-sm text-zinc-300 capitalize">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={12} className="text-zinc-500" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-[#0E0E10] border border-white/10 rounded-xl overflow-hidden"
                      >
                        <div className="p-2 border-b border-white/5">
                          <p className="text-sm text-white truncate px-2">{user?.name}</p>
                          <p className="text-xs text-zinc-500 truncate px-2">{user?.email}</p>
                        </div>
                        <div className="p-1">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                              <item.icon size={14} />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="p-1 border-t border-white/5">
                          <button
                            onClick={() => {
                              logout();
                              navigate("/");
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <LogOut size={14} />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black text-sm font-semibold"
                >
                  <Sparkles size={14} />
                  Sign In
                </Link>
              )}

              {/* MOBILE MENU BUTTON */}
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

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#0A0A0C]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <span className="text-white font-semibold tracking-wider">NAYAMO</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              <div className="p-4 border-b border-white/5">
                <Link
                  to="/shop"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-zinc-400 text-sm"
                >
                  <Search size={16} />
                  Search Products
                </Link>
              </div>

              <div className="p-4 space-y-1">
                {links.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2.5 px-3 rounded-lg text-sm ${
                      isActive(item.path) ? "text-white bg-white/10" : "text-zinc-400"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-white truncate">{user?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-500/10 text-red-400 text-sm"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black font-semibold text-sm"
                  >
                    <Sparkles size={14} />
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
}

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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const iconBtn =
    "flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all";

  return (
    <>
      <motion.header
        style={{
          backgroundColor: scrolled ? "rgba(10,10,12,0.95)" : "rgba(10,10,12,0.7)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-[#D4A853] to-[#C9963B] p-0.5">
                <img
                  src={logo}
                  alt="Nayamo"
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <span className="hidden sm:block text-white font-semibold tracking-[0.25em] text-sm">
                NAYAMO
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? "text-white bg-white/[0.08]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search - Goes to Shop */}
              <Link
                to="/shop"
                className={iconBtn}
              >
                <Search size={18} />
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative">
                <div className={iconBtn}>
                  <Heart size={18} />
                </div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] bg-pink-500 text-white rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <div className={iconBtn}>
                  <ShoppingBag size={18} />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] bg-[#D4A853] text-black rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="relative ml-1" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-white/[0.08] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="hidden md:block text-sm text-zinc-300 capitalize max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={12} className="text-zinc-500 hidden md:block" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-[#0E0E10] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm text-white truncate">{user?.name}</p>
                          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                            >
                              <item.icon size={15} />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="p-1.5 border-t border-white/5">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
                          >
                            <LogOut size={15} />
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
                  className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <Sparkles size={14} />
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#0A0A0C]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#C9963B] p-0.5">
                    <img
                      src={logo}
                      alt="Nayamo"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  </div>
                  <span className="text-white font-semibold tracking-wider">NAYAMO</span>
                </div>
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
                  className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm"
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
                    className={`block py-3 px-3 rounded-lg text-sm font-medium ${
                      isActive(item.path)
                        ? "text-white bg-white/10"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-[#0A0A0C]">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4A853] to-[#D4A5A5] flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-gradient-to-r from-[#D4A853] to-[#C9963B] text-black font-semibold text-sm"
                  >
                    <Sparkles size={16} />
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

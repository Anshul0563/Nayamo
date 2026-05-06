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
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

import logo from "../../assets/logo.png";

const links = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const userMenuItems = [
  { name: "My Account", path: "/profile", icon: User },
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
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

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
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () =>
      document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);

    setQuery("");
    setSearchOpen(false);
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const iconBtn =
    "relative overflow-hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 text-zinc-200 transition-all duration-500 hover:-translate-y-1 hover:scale-105 hover:border-[#D4A853]/60 hover:text-white hover:shadow-[0_10px_40px_rgba(212,168,83,0.35)] backdrop-blur-xl active:scale-95";

  return (
    <>
      <motion.header
        style={{
          backgroundColor: scrolled
            ? "rgba(9,9,9,0.88)"
            : "rgba(7,7,8,0.25)",
          backdropFilter: `blur(${navbarBlur}px)`,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-4 inset-x-0 mx-auto z-50 w-[calc(100%-24px)] max-w-[1500px] rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
      >
        {/* TOP LIGHT */}
        <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* BOTTOM GOLD LINE */}
        <div className="absolute bottom-0 left-1/2 h-[1px] w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D4A853]/60 to-transparent" />

        {/* GLOW */}
        <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="absolute -top-20 left-0 h-40 w-40 bg-[#D4A853]/20 blur-3xl animate-pulse" />

          <div className="absolute top-0 right-0 h-40 w-40 bg-[#FFD700]/10 blur-3xl animate-pulse" />
        </div>

        <div className="nayamo-container relative z-10">
          <div className="flex h-24 items-center justify-between gap-4">
            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-4 group"
            >
              <motion.div className="flex h-14 w-14 items-center justify-center rounded-3xl">
                <motion.img
                  src={logo}
                  alt="Nayamo Logo"
                  className="h-12 w-12 object-contain drop-shadow-[0_8px_24px_rgba(212,168,83,0.3)]"
                  whileHover={{
                    scale: 1.12,
                    rotate: 5,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                  }}
                />
              </motion.div>

              <div className="hidden sm:block">
                <p className="bg-gradient-to-r from-white to-[#D4A853] bg-clip-text text-lg font-bold tracking-[0.3em] text-transparent">
                  NAYAMO
                </p>

                <p className="text-[11px] uppercase tracking-[0.4em] text-[#D4A853]">
                  Luxury Jewellery
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                    Premium Store
                  </span>
                </div>
              </div>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden lg:flex items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-3 py-3 backdrop-blur-2xl shadow-xl">
              {links.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                  }}
                >
                  <Link
                    to={item.path}
                    className={`relative overflow-hidden px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 group ${
                      isActive(item.path)
                        ? "text-white bg-gradient-to-r from-[#D4A853]/20 to-[#D4A5A5]/20 border border-[#D4A853]/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-[#D4A853]/10 to-[#FFD700]/10 opacity-0 group-hover:opacity-100"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.4 }}
                    />

                    <span className="relative z-10">
                      {item.name}
                    </span>

                    {isActive(item.path) && (
                      <>
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl border-2 border-[#D4A853]/50"
                        />

                        <motion.div
                          layoutId="underline"
                          className="absolute bottom-1 left-1/2 h-[2px] w-6 rounded-full bg-[#D4A853]"
                          style={{
                            translateX: "-50%",
                          }}
                        />
                      </>
                    )}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div
                className="relative hidden md:block"
                ref={searchRef}
              >
                <AnimatePresence>
                  {searchOpen && (
                    <motion.form
                      onSubmit={submitSearch}
                      initial={{
                        opacity: 0,
                        width: 0,
                      }}
                      animate={{
                        opacity: 1,
                        width: 260,
                        y: "-50%",
                      }}
                      exit={{
                        opacity: 0,
                        width: 0,
                      }}
                      className="absolute right-14 top-1/2"
                    >
                      <input
                        autoFocus
                        value={query}
                        onChange={(e) =>
                          setQuery(e.target.value)
                        }
                        placeholder="Search jewellery..."
                        className="h-12 w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-4 text-sm text-white outline-none backdrop-blur-2xl focus:border-[#D4A853]/60"
                      />
                    </motion.form>
                  )}
                </AnimatePresence>

                <button
                  className={iconBtn}
                  onClick={() =>
                    setSearchOpen(!searchOpen)
                  }
                >
                  {searchOpen ? (
                    <X size={20} />
                  ) : (
                    <Search size={20} />
                  )}
                </button>
              </div>

              {/* WISHLIST */}
              <Link to="/wishlist" className={iconBtn}>
                <Heart size={20} />

                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#FFD700] to-[#D4A853] text-[10px] font-bold text-black shadow-lg animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CART */}
              <Link to="/cart" className={iconBtn}>
                <ShoppingBag size={20} />

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#FFD700] to-[#D4A853] text-[10px] font-bold text-black shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* AUTH */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={profileRef}
                >
                  <button
                    onClick={() =>
                      setProfileOpen(!profileOpen)
                    }
                    className="hidden md:flex items-center gap-2 h-12 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-3 transition-all hover:border-[#D4A853]/40"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A853] to-[#D4A5A5]">
                      <User
                        size={16}
                        className="text-white"
                      />
                    </div>

                    <span className="max-w-[80px] truncate text-sm font-medium capitalize text-zinc-300">
                      {user?.name?.split(" ")[0] ||
                        "Account"}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`text-zinc-400 transition-transform duration-300 ${
                        profileOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 10,
                          scale: 0.95,
                        }}
                        className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0C]/95 shadow-2xl backdrop-blur-xl"
                      >
                        <div className="border-b border-white/5 p-3">
                          <p className="truncate text-sm font-medium text-white">
                            {user?.name}
                          </p>

                          <p className="truncate text-xs text-zinc-500">
                            {user?.email}
                          </p>
                        </div>

                        <div className="p-2">
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() =>
                                setProfileOpen(false)
                              }
                              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-zinc-300 transition-all hover:bg-white/5 hover:text-white"
                            >
                              <item.icon size={16} />

                              {item.name}
                            </Link>
                          ))}
                        </div>

                        <div className="border-t border-white/5 p-2">
                          <button
                            onClick={() => {
                              logout();
                              navigate("/");
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition-all hover:bg-red-500/10"
                          >
                            <LogOut size={16} />
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
                  className="hidden md:flex items-center h-12 rounded-2xl bg-gradient-to-r from-[#D4A853] via-[#FFD700] to-[#D4A853] px-6 font-bold text-black shadow-[0_10px_30px_rgba(212,168,83,0.4)] transition-all hover:scale-105"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              )}

              {/* MOBILE BUTTON */}
              <button
                className="lg:hidden flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl"
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
            {/* BACKDROP */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setMobileOpen(false)
              }
            />

            {/* PANEL */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
              }}
              className="absolute right-0 top-0 flex h-full w-[85vw] max-w-sm flex-col border-l border-white/10 bg-[#050505]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
            >
              {/* HEADER */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-lg font-semibold text-white">
                  Menu
                </p>

                <button
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="rounded-xl bg-white/10 p-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* AUTH */}
              <div className="mb-6">
                {isAuthenticated ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-medium text-white">
                      {user?.name}
                    </p>

                    <p className="text-xs text-zinc-400">
                      {user?.email}
                    </p>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#FFD700] font-semibold text-black"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4A853] to-[#FFD700] font-bold text-black"
                  >
                    <Sparkles size={16} />
                    Sign In
                  </Link>
                )}
              </div>

              {/* NAV */}
              <div className="flex flex-col gap-2">
                {links.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all ${
                      isActive(item.path)
                        ? "bg-[#D4A853]/20 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">
                <Link
                  to="/wishlist"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white"
                >
                  <Heart size={16} />
                  Wishlist
                </Link>

                <Link
                  to="/cart"
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white"
                >
                  <ShoppingBag size={16} />
                  Cart
                </Link>
              </div>

              {/* LOGOUT */}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                    setMobileOpen(false);
                  }}
                  className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500/10 text-red-400"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-32" />
    </>
  );
}
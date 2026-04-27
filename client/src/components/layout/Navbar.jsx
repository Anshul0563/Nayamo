import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="nayamo-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4A853] flex items-center justify-center">
              <span className="text-white font-bold text-sm font-serif">N</span>
            </div>
            <span className="text-xl md:text-2xl font-serif font-semibold tracking-wide text-stone-900">
              Nayamo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-stone-600 hover:text-[#D4A853] font-medium transition-colors">
              Home
            </Link>
            <Link to="/shop" className="text-stone-600 hover:text-[#D4A853] font-medium transition-colors">
              Shop
            </Link>
            <Link to="/shop?category=party" className="text-stone-600 hover:text-[#D4A853] font-medium transition-colors">
              Party Wear
            </Link>
            <Link to="/shop?category=daily" className="text-stone-600 hover:text-[#D4A853] font-medium transition-colors">
              Daily Wear
            </Link>
            <Link to="/shop?category=traditional" className="text-stone-600 hover:text-[#D4A853] font-medium transition-colors">
              Traditional
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 pl-9 pr-3 py-2 rounded-full bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]/20 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </form>

            <Link to="/wishlist" className="relative p-2 hover:bg-stone-50 rounded-full transition-colors">
              <Heart className="w-5 h-5 text-stone-600" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4A853] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 hover:bg-stone-50 rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 text-stone-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#D4A853] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profile" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                  <User className="w-5 h-5 text-stone-600" />
                </Link>
                <button onClick={logout} className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-500 hover:text-red-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-flex nayamo-btn-primary text-sm py-2">
                Sign In
              </Link>
            )}

            {/* Mobile Toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex relative mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-[#D4A853]"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          </form>
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Home</Link>
          <Link to="/shop" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Shop</Link>
          <Link to="/shop?category=party" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Party Wear</Link>
          <Link to="/shop?category=daily" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Daily Wear</Link>
          <Link to="/shop?category=traditional" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Traditional</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Cart ({cartCount})</Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">Wishlist ({wishlistCount})</Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-stone-700 font-medium">My Orders</Link>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="block py-2 text-red-500 font-medium">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-[#D4A853] font-medium">Sign In</Link>
          )}
        </div>
      )}
    </header>
  );
}


import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingCart, User, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "@/components/common/Logo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-nayamo-bg-elevated/95 backdrop-blur-xl border-b border-nayamo-border-light">
      <div className="nayamo-container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-serif text-2xl font-bold text-nayamo-text-primary">Nayamo</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary hover:text-nayamo-gold'}`}>
              Home
            </Link>
            <Link to="/shop" className={`font-medium transition-colors ${isActive('/shop') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary hover:text-nayamo-gold'}`}>
              Shop
            </Link>
            <Link to="/about" className={`font-medium transition-colors ${isActive('/about') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary hover:text-nayamo-gold'}`}>
              About
            </Link>

            <div className="flex items-center gap-4 ml-8">
              <Link to="/wishlist" className="relative p-2 text-nayamo-text-secondary hover:text-nayamo-gold transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-nayamo-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 text-nayamo-text-secondary hover:text-nayamo-gold transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-nayamo-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/profile" className="p-2 text-nayamo-text-secondary hover:text-nayamo-gold transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-nayamo-text-secondary hover:text-nayamo-gold transition-colors">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="nayamo-btn-secondary">
                  Login
                </Link>
              )}
            </div>
          </div>

          <button
            className="lg:hidden p-2 text-nayamo-text-secondary hover:text-nayamo-gold"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-nayamo-border-light">
            <Link to="/" className={`block py-3 font-medium ${isActive('/') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary'}`}>
              Home
            </Link>
            <Link to="/shop" className={`block py-3 font-medium ${isActive('/shop') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary'}`}>
              Shop
            </Link>
            <Link to="/about" className={`block py-3 font-medium ${isActive('/about') ? 'text-nayamo-gold' : 'text-nayamo-text-secondary'}`}>
              About
            </Link>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-nayamo-border-light">
              <Link to="/wishlist" className="relative p-2">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-nayamo-gold text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-nayamo-gold text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex gap-4">
                  <Link to="/profile" className="p-2">
                    <User className="w-5 h-5" />
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="text-sm font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


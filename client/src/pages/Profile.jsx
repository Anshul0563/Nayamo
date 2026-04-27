import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Package, Heart, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="nayamo-container py-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="nayamo-card p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D4A853] to-[#C9963B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(212,168,83,0.3)]">
                <Sparkles className="w-10 h-10 text-[#0A0A0A]" />
              </div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-1 text-[#9CA3AF]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <span className="inline-block mt-3 px-3 py-1 bg-[#D4A853]/10 text-[#D4A853] text-xs font-medium rounded-full uppercase border border-[#D4A853]/20">
                {user.role}
              </span>

              <button
                onClick={logout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#D4A5A5]/30 text-[#D4A5A5] rounded-xl hover:bg-[#D4A5A5]/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/orders")}
                className="nayamo-card p-6 text-left hover:bg-[#242428] transition-colors"
              >
                <div className="w-12 h-12 bg-[#D4A853]/10 rounded-xl flex items-center justify-center mb-4 border border-[#D4A853]/10">
                  <Package className="w-6 h-6 text-[#D4A853]" />
                </div>
                <h3 className="font-semibold text-white">My Orders</h3>
                <p className="text-sm text-[#9CA3AF] mt-1">View and track your orders</p>
              </button>

              <button
                onClick={() => navigate("/wishlist")}
                className="nayamo-card p-6 text-left hover:bg-[#242428] transition-colors"
              >
                <div className="w-12 h-12 bg-[#D4A5A5]/10 rounded-xl flex items-center justify-center mb-4 border border-[#D4A5A5]/10">
                  <Heart className="w-6 h-6 text-[#D4A5A5]" />
                </div>
                <h3 className="font-semibold text-white">Wishlist</h3>
                <p className="text-sm text-[#9CA3AF] mt-1">Saved items for later</p>
              </button>

              <button
                onClick={() => navigate("/track-order")}
                className="nayamo-card p-6 text-left hover:bg-[#242428] transition-colors"
              >
                <div className="w-12 h-12 bg-[#D4A853]/10 rounded-xl flex items-center justify-center mb-4 border border-[#D4A853]/10">
                  <MapPin className="w-6 h-6 text-[#D4A853]" />
                </div>
                <h3 className="font-semibold text-white">Track Order</h3>
                <p className="text-sm text-[#9CA3AF] mt-1">Check delivery status</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, LogOut, Package, Heart, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const quickLinks = [
  { to: "/orders", icon: Package, label: "My Orders", desc: "View and track your orders", color: "#D4A853" },
  { to: "/wishlist", icon: Heart, label: "Wishlist", desc: "Saved items for later", color: "#D4A5A5" },
  { to: "/track-order", icon: MapPin, label: "Track Order", desc: "Check delivery status", color: "#D4A853" },
];

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center">
        <Loader size={40} />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070708]">
      <div className="nayamo-container py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            My Profile
          </h1>
          <p className="text-[#A1A1AA]">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="nayamo-card p-8 text-center border border-white/[0.04]">
              <div className="w-24 h-24 bg-gradient-to-br from-[#D4A853] to-[#C9963B] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_12px_40px_rgba(212,168,83,0.3)]">
                <Sparkles className="w-12 h-12 text-[#070708]" />
              </div>
              <h2 className="text-xl font-semibold text-white">{user.name}</h2>
              <div className="flex items-center justify-center gap-2 mt-2 text-[#A1A1AA]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <span className="inline-block mt-4 px-4 py-1.5 bg-[#D4A853]/8 text-[#D4A853] text-xs font-semibold rounded-full uppercase tracking-wider border border-[#D4A853]/15">
                {user.role}
              </span>

              <button
                onClick={logout}
                className="w-full mt-8 flex items-center justify-center gap-2 px-4 py-3 border border-[#D4A5A5]/20 text-[#D4A5A5] rounded-xl hover:bg-[#D4A5A5]/10 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link, i) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate(link.to)}
                  className="nayamo-card p-7 text-left hover:bg-[#1E1E24] transition-colors border border-white/[0.04] group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${link.color}10`,
                        borderColor: `${link.color}15`,
                      }}
                    >
                      <link.icon className="w-6 h-6" style={{ color: link.color }} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#52525B] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">{link.label}</h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">{link.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


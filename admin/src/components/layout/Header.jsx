import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  RefreshCw,
  Package,
  IndianRupee,
  ChevronDown,
  X,
  Check,
  Clock,
} from "lucide-react";

// Mock notifications - in production, fetch from API
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "order",
    title: "New Order Received",
    message: "Order #12345 from Priya Sharma",
    time: "2 min ago",
    read: false,
    icon: Package,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Received",
    message: "₹4,500 via UPI - Order #12344",
    time: "15 min ago",
    read: false,
    icon: IndianRupee,
    color: "text-gold-400",
    bgColor: "bg-gold-500/10",
    borderColor: "border-gold-500/20",
  },
  {
    id: 3,
    type: "alert",
    title: "Low Stock Alert",
    message: "Diamond Necklace (SKU: DN-001) - 2 left",
    time: "1 hour ago",
    read: true,
    icon: Clock,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
];

export default function Header({ 
  onMenuToggle, 
  onRefresh, 
  pageTitle,
  adminName = "Admin",
  collapsed = false
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header className="h-16 bg-luxury-black/80 backdrop-blur-glass border-b border-luxury-border sticky top-0 z-30">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-luxury-muted hover:text-luxury-text transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-display font-semibold text-luxury-text truncate">
              {pageTitle}
            </h1>
            <p className="text-xs text-luxury-dim hidden sm:block">
              {new Date().toLocaleDateString("en-IN", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div 
            ref={searchRef}
            className={`hidden md:flex items-center transition-all duration-300 ${
              searchFocused ? "w-80" : "w-56"
            }`}
          >
            <div className="relative w-full">
              <Search 
                size={16} 
                className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  searchFocused ? "text-gold-400" : "text-luxury-dim"
                }`} 
              />
              <input
                type="text"
                placeholder="Search orders, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-luxury-border text-sm text-luxury-text placeholder:text-luxury-dim outline-none focus:border-gold-500/50 focus:shadow-gold-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-dim hover:text-luxury-text"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="hidden sm:flex p-2.5 rounded-xl hover:bg-white/5 text-luxury-muted hover:text-luxury-text transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden sm:flex p-2.5 rounded-xl hover:bg-white/5 text-luxury-muted hover:text-gold-400 transition-colors"
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2.5 rounded-xl hover:bg-white/5 text-luxury-muted hover:text-luxury-text transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold-gradient text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-luxury-black">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-96 bg-luxury-card border border-luxury-border rounded-2xl shadow-elevated z-50 animate-scale-in overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-luxury-border flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-luxury-text">Notifications</h3>
                    <p className="text-xs text-luxury-dim">
                      {unreadCount} unread
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={markAllRead}
                      className="p-2 rounded-lg hover:bg-white/5 text-luxury-dim hover:text-luxury-text transition-colors"
                      title="Mark all read"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={clearNotifications}
                      className="p-2 rounded-lg hover:bg-white/5 text-luxury-dim hover:text-red-400 transition-colors"
                      title="Clear all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={32} className="mx-auto text-luxury-dim mb-3" />
                      <p className="text-luxury-muted">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 border-b border-luxury-border/50 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                            !notif.read ? "bg-white/[0.01]" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${notif.bgColor} ${notif.borderColor} border shrink-0`}>
                              <Icon size={16} className={notif.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`text-sm font-medium ${!notif.read ? "text-luxury-text" : "text-luxury-muted"}`}>
                                  {notif.title}
                                </h4>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-gold-400 rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                              <p className="text-xs text-luxury-dim mt-1">{notif.message}</p>
                              <p className="text-[10px] text-luxury-dim mt-2">{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center">
                <User size={16} className="text-gold-400" />
              </div>
              <span className="hidden lg:block text-sm text-luxury-text font-medium">
                {adminName}
              </span>
              <ChevronDown 
                size={14} 
                className={`hidden lg:block text-luxury-dim transition-transform ${profileOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-luxury-card border border-luxury-border rounded-2xl shadow-elevated z-50 animate-scale-in overflow-hidden">
                <div className="p-4 border-b border-luxury-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center">
                      <User size={24} className="text-gold-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-luxury-text">{adminName}</p>
                      <p className="text-xs text-gold-400">Administrator</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => { window.location.href = "/settings"; setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-luxury-muted hover:text-luxury-text hover:bg-white/5 transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("refreshToken");
                      localStorage.removeItem("role");
                      window.location.href = "/login";
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


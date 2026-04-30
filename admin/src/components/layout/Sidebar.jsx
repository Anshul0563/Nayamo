import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  PlusSquare,
  Wallet,
  BarChart3,
  RotateCcw,
  Settings,
  Users,
  LogOut,
  User,
  Crown,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Inventory", path: "/inventory", icon: Boxes },
  { name: "Add Product", path: "/add-product", icon: PlusSquare },
  { name: "Payments", path: "/payments", icon: Wallet },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Users", path: "/users", icon: Users },
  { name: "Reviews", path: "/reviews", icon: Star },
  { name: "Returns", path: "/returns", icon: RotateCcw },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({ 
  mobileOpen, 
  onMobileClose, 
  collapsed = false, 
  onToggleCollapse,
  adminName = "Admin" 
}) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const sidebarClasses = collapsed 
    ? "w-20" 
    : "w-72";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-luxury-black border-r border-luxury-border transition-all duration-500 ease-luxury ${sidebarClasses}`}
      >
        {/* Logo Section */}
        <div className={`p-5 border-b border-luxury-border flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold-sm">
                <Crown size={20} className="text-black" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-gold-gradient">
                  Nayamo
                </h1>
                <p className="text-[10px] text-luxury-dim tracking-[0.2em] uppercase">
                  Premium Jewellery
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold-sm">
              <Crown size={20} className="text-black" />
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-white/5 text-luxury-muted hover:text-luxury-text transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== "/" && location.pathname.startsWith(item.path));
            
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive: navActive }) => `
                  group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                  ${collapsed ? 'justify-center' : ''}
                  ${navActive || isActive
                    ? "bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium" 
                    : "text-luxury-muted hover:text-luxury-text hover:bg-white/5"
                  }
                `}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Active indicator */}
                {(isActive) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold-gradient rounded-r-full" />
                )}
                
                <Icon 
                  size={20} 
                  className={`shrink-0 transition-transform duration-300 ${
                    isActive ? "text-gold-400" : "group-hover:scale-110"
                  }`} 
                />
                
                {!collapsed && (
                  <span className="truncate transition-opacity duration-300">
                    {item.name}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && hoveredItem === item.name && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-luxury-card border border-luxury-border rounded-lg text-sm whitespace-nowrap z-50 shadow-glass">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-luxury-card border-l border-b border-luxury-border rotate-45" />
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-luxury-border">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center shrink-0">
              <User size={18} className="text-gold-400" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-luxury-text truncate">
                  {adminName}
                </p>
                <p className="text-xs text-luxury-dim">Administrator</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-luxury-black border-r border-luxury-border z-50 md:hidden flex flex-col animate-slide-in-right">
            {/* Mobile Logo */}
            <div className="p-5 border-b border-luxury-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold-sm">
                  <Crown size={20} className="text-black" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-gold-gradient">
                    Nayamo
                  </h1>
                  <p className="text-[10px] text-luxury-dim tracking-[0.2em] uppercase">
                    Premium Jewellery
                  </p>
                </div>
              </div>
              <button
                onClick={onMobileClose}
                className="p-2 rounded-lg hover:bg-white/5 text-luxury-muted"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== "/" && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive: navActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${navActive || isActive
                        ? "bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium" 
                        : "text-luxury-muted hover:text-luxury-text hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Mobile User */}
            <div className="p-4 border-t border-luxury-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-gradient-soft border border-gold-500/20 flex items-center justify-center">
                  <User size={18} className="text-gold-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-luxury-text">{adminName}</p>
                  <p className="text-xs text-luxury-dim">Administrator</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm w-full"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}


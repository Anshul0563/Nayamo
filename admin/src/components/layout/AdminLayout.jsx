import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const menuItems = [
  { name: "Dashboard", path: "/" },
  { name: "Orders", path: "/orders" },
  { name: "Inventory", path: "/inventory" },
  { name: "Add Product", path: "/add-product" },
  { name: "Payments", path: "/payments" },
  { name: "Analytics", path: "/analytics" },
  { name: "Returns", path: "/returns" },
  { name: "Settings", path: "/settings" },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Try to get admin name from token payload
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.name) setAdminName(payload.name);
        if (payload.email) setAdminName(payload.email.split("@")[0]);
      }
    } catch {
      // Ignore decode errors
    }
  }, []);

  // Persist sidebar collapse state
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.dispatchEvent(new CustomEvent("admin:refresh"));
  };

  const pageTitle = menuItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  )?.name || "Admin";

  return (
<div className="min-h-screen bg-transparent text-luxury-text flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        adminName={adminName}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          onMenuToggle={() => setMobileOpen(true)}
          onRefresh={handleRefresh}
          pageTitle={pageTitle}
          adminName={adminName}
          collapsed={collapsed}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div key={refreshKey} className="page-enter">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-luxury-border bg-luxury-black/50 px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
            <p className="text-luxury-dim">
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-gold-400 font-medium">Nayamo</span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-luxury-dim">
              <span>Premium Jewellery Management</span>
              <span className="text-gold-500/50 mx-1">|</span>
              <span className="text-gold-400/60">v2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


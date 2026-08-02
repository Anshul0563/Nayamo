import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import Header from "./Header";
import Sidebar from "./Sidebar";

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
    let active = true;
    authAPI.getAdminProfile()
      .then(({ data }) => {
        const user = data?.data;
        if (active && user?.name) setAdminName(user.name);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
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
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        adminName={adminName}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuToggle={() => setMobileOpen(true)}
          onRefresh={handleRefresh}
          pageTitle={pageTitle}
          adminName={adminName}
          collapsed={collapsed}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div key={refreshKey} className="page-enter">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-luxury-border bg-luxury-black/50 px-4 py-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-2 text-xs md:flex-row">
            <p className="text-luxury-dim">
              © {new Date().getFullYear()} {" "}
              <span className="font-medium text-gold-400">Nayamo</span>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-luxury-dim">
              <span>Premium Jewellery Management</span>
              <span className="mx-1 text-gold-500/50">|</span>
              <span className="text-gold-400/60">v2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  PlusSquare,
  Wallet,
  BarChart3,
  RotateCcw,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Orders", path: "/orders", icon: ShoppingCart },
  { name: "Inventory", path: "/inventory", icon: Boxes },
  { name: "Add Product", path: "/add-product", icon: PlusSquare },
  { name: "Payments", path: "/payments", icon: Wallet },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "Returns", path: "/returns", icon: RotateCcw },
  { name: "Settings", path: "/settings", icon: Settings },
];

function AdminLayout() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const Sidebar = () => (
    <div className="h-full flex flex-col bg-zinc-950 text-white border-r border-white/10">
      {/* Logo */}
      <div className="p-5 text-2xl font-bold tracking-wide border-b border-white/10 flex items-center justify-between">
        <span>Nayamo</span>

        {/* Mobile Close */}
        <button
          className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Menu */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "hover:bg-white/10 text-zinc-300"
                }`
              }
            >
              <Icon size={18} />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-black via-zinc-900 to-zinc-950 text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-72 max-w-[85vw] h-full shadow-2xl">
            <Sidebar />
          </div>

          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 w-0 min-w-0 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 w-full min-w-0 border-b border-white/10 px-4 md:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 shrink-0"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>

            <h1 className="text-lg md:text-2xl font-semibold truncate">
              Admin Dashboard
            </h1>
          </div>

          <div className="text-sm text-zinc-400 hidden sm:block truncate">
            Welcome, Admin
          </div>
        </header>

        {/* Content + Footer */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="border-t border-white/10 bg-zinc-950 px-4 md:px-6 py-4 shrink-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
              <p className="text-zinc-300">
                © {new Date().getFullYear()}{" "}
                <span className="text-white font-semibold">Nayamo</span>. All rights reserved.
              </p>

              <div className="text-zinc-400">
                Built with ❤️ for your business
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const load = async () => {
    try {
      setLoading(true);

      const [dashRes, orderRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/orders"),
      ]);

      setStats(dashRes.data.data || {});
      setOrders(orderRes.data.orders || []);
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    load();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const filteredRecent = useMemo(() => {
    const list = stats.recentOrders || [];

    if (!search.trim()) return list;

    return list.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item._id.toLowerCase().includes(search.toLowerCase())
    );
  }, [stats, search]);

  const Card = ({ title, value, color }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-sm text-zinc-400">{title}</p>
      <h2 className={`text-3xl font-bold mt-3 ${color}`}>{value}</h2>
    </div>
  );

  const quickActions = [
    {
      title: "Manage Orders",
      action: () => (window.location.href = "/admin/orders"),
    },
    {
      title: "Refresh Data",
      action: load,
    },
    {
      title: "Logout",
      action: logout,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white grid place-items-center text-2xl">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-black/30 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-3xl font-bold">Nayamo 💎</h1>
          <p className="text-zinc-400 text-sm mt-1">Luxury Seller Panel</p>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-white text-black font-semibold">
            Dashboard
          </button>

          <button
            onClick={() => (window.location.href = "/admin/orders")}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            Orders
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            Products
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            Customers
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            Analytics
          </button>
        </nav>

        <div className="mt-auto p-4">
          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 rounded-xl py-3 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Dashboard</h2>
            <p className="text-zinc-400 mt-1">
              Welcome back! Manage your store professionally.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search recent orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none w-60"
            />

            <button
              onClick={load}
              className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
          <Card
            title="Total Users"
            value={stats.totalUsers}
            color="text-cyan-400"
          />
          <Card
            title="Total Orders"
            value={stats.totalOrders}
            color="text-violet-400"
          />
          <Card
            title="Products"
            value={stats.totalProducts}
            color="text-emerald-400"
          />
          <Card
            title="Revenue"
            value={`₹${stats.totalRevenue}`}
            color="text-yellow-400"
          />
        </div>

        {/* Middle Grid */}
        <div className="grid xl:grid-cols-3 gap-6 mt-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Recent Orders</h3>
              <button
                onClick={() => (window.location.href = "/admin/orders")}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {filteredRecent.length === 0 ? (
                <div className="text-zinc-400 py-10 text-center">
                  No orders found
                </div>
              ) : (
                filteredRecent.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-xl bg-black/30 border border-white/5 p-4 flex flex-wrap gap-4 items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {order.user?.name || "Customer"}
                      </p>
                      <p className="text-sm text-zinc-400">
                        #{order._id.slice(-6)}
                      </p>
                    </div>

                    <div className="text-sm text-zinc-300">
                      {order.items?.length || 0} Items
                    </div>

                    <div className="font-bold text-emerald-400">
                      ₹{order.totalPrice}
                    </div>

                    <div className="capitalize text-sm px-3 py-1 rounded-full bg-white/10">
                      {order.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-xl font-semibold">Quick Actions</h3>

            <div className="grid gap-3 mt-4">
              {quickActions.map((item) => (
                <button
                  key={item.title}
                  onClick={item.action}
                  className="rounded-xl bg-black/30 border border-white/10 p-4 text-left hover:bg-white/10 transition"
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5">
              <p className="text-sm opacity-80">Today Revenue</p>
              <h4 className="text-3xl font-bold mt-2">
                ₹{stats.totalRevenue}
              </h4>
              <p className="text-sm mt-2 opacity-80">
                Track growth and improve performance.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Analytics */}
        <div className="grid md:grid-cols-3 gap-5 mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-zinc-400">Pending Orders</p>
            <h3 className="text-3xl font-bold mt-2 text-orange-400">
              {orders.filter((o) => o.status === "pending").length}
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-zinc-400">Delivered Orders</p>
            <h3 className="text-3xl font-bold mt-2 text-green-400">
              {orders.filter((o) => o.status === "delivered").length}
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-zinc-400">Cancelled Orders</p>
            <h3 className="text-3xl font-bold mt-2 text-red-400">
              {orders.filter((o) => o.status === "cancelled").length}
            </h3>
          </div>
        </div>
      </main>
    </div>
  );
}
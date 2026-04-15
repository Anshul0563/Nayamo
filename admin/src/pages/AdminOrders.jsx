import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api/admin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const statuses = [
    "pending",
    "confirmed",
    "packed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
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

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      load();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const counts = useMemo(
    () => ({
      pending: orders.filter((x) => x.status === "pending").length,
      confirmed: orders.filter((x) => x.status === "confirmed").length,
      shipped: orders.filter((x) => x.status === "shipped").length,
      cancelled: orders.filter((x) => x.status === "cancelled").length,
    }),
    [orders]
  );

  const rows = useMemo(() => {
    let data = orders.filter((o) => o.status === tab);

    if (search.trim()) {
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [orders, tab, search]);

  const badge = (status) => {
    const colors = {
      pending: "bg-orange-500/20 text-orange-400",
      confirmed: "bg-blue-500/20 text-blue-400",
      packed: "bg-violet-500/20 text-violet-400",
      shipped: "bg-cyan-500/20 text-cyan-400",
      delivered: "bg-emerald-500/20 text-emerald-400",
      cancelled: "bg-red-500/20 text-red-400",
    };

    return colors[status] || "bg-white/10 text-white";
  };

  const StatCard = ({ title, value, color }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-zinc-400">{title}</p>
      <h3 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white grid place-items-center text-2xl">
        Loading Orders...
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
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            Dashboard
          </button>

          <button className="w-full text-left px-4 py-3 rounded-xl bg-white text-black font-semibold">
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
            <h2 className="text-4xl font-bold">Orders</h2>
            <p className="text-zinc-400 mt-1">
              Manage and track all customer orders.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order / customer"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none w-64"
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
          <StatCard
            title="Pending Orders"
            value={counts.pending}
            color="text-orange-400"
          />
          <StatCard
            title="Ready to Ship"
            value={counts.confirmed}
            color="text-blue-400"
          />
          <StatCard
            title="Shipped"
            value={counts.shipped}
            color="text-cyan-400"
          />
          <StatCard
            title="Cancelled"
            value={counts.cancelled}
            color="text-red-400"
          />
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-white/10 bg-white/5 mt-6 px-5">
          <div className="flex gap-8 overflow-x-auto">
            {[
              ["pending", "Pending"],
              ["confirmed", "Ready to Ship"],
              ["shipped", "Shipped"],
              ["cancelled", "Cancelled"],
            ].map((t) => (
              <button
                key={t[0]}
                onClick={() => setTab(t[0])}
                className={`py-4 border-b-2 whitespace-nowrap ${
                  tab === t[0]
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-zinc-400"
                }`}
              >
                {t[1]} ({counts[t[0]]})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 mt-6 overflow-auto">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              No Orders Found
            </div>
          ) : (
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400">
                  {[
                    "Order ID",
                    "Customer",
                    "Amount",
                    "Items",
                    "Address",
                    "Payment",
                    "Status",
                    "Update",
                  ].map((h) => (
                    <th key={h} className="text-left p-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="p-4 font-medium">
                      #{o._id.slice(-6)}
                    </td>

                    <td className="p-4">
                      <div>{o.user?.name || "Customer"}</div>
                      <div className="text-xs text-zinc-500">
                        {o.user?.email}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-emerald-400">
                      ₹{o.totalPrice}
                    </td>

                    <td className="p-4">{o.items.length}</td>

                    <td className="p-4 max-w-[250px] text-zinc-300">
                      {o.address}
                    </td>

                    <td className="p-4 uppercase text-xs">
                      {o.paymentMethod}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${badge(
                          o.status
                        )}`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateStatus(o._id, e.target.value)
                        }
                        className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
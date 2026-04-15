import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function DashboardV3() {
  const [page, setPage] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

      const [dashRes, userRes, orderRes, productRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/users"),
        api.get("/orders"),
        api.get("/products"),
      ]);

      setStats(dashRes.data.data);
      setUsers(userRes.data.users);
      setOrders(orderRes.data.orders);
      setProducts(productRes.data.products);
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

  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (statusFilter !== "all") {
      data = data.filter((item) => item.status === statusFilter);
    }

    if (search.trim()) {
      data = data.filter(
        (item) =>
          item.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          item._id.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [orders, search, statusFilter]);

  const badge = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      packed: "#8b5cf6",
      shipped: "#06b6d4",
      delivered: "#22c55e",
      cancelled: "#ef4444",
    };

    return {
      background: colors[status] || "#666",
      padding: "6px 10px",
      borderRadius: "20px",
      fontSize: "12px",
      textTransform: "capitalize",
      fontWeight: "bold",
      display: "inline-block",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 p-6 hidden md:block">
        <h1 className="text-3xl font-bold">Nayamo 💎</h1>
        <p className="text-zinc-400 text-sm mt-1">Luxury Admin Panel</p>

        <div className="grid gap-2 mt-8">
          {["dashboard", "users", "orders", "products"].map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`px-4 py-3 rounded-2xl text-left capitalize transition ${
                page === item
                  ? "bg-white text-black"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <button
          onClick={logout}
          className="w-full mt-8 rounded-2xl bg-red-500 p-3 hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="flex justify-between items-center gap-4 flex-wrap mb-6">
          <div>
            <h2 className="text-4xl font-bold capitalize">{page}</h2>
            <p className="text-zinc-400">Manage your store professionally</p>
          </div>

          <button
            onClick={load}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20"
          >
            Refresh
          </button>
        </div>

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              <Card title="Users" value={stats.totalUsers || 0} />
              <Card title="Orders" value={stats.totalOrders || 0} />
              <Card title="Products" value={stats.totalProducts || 0} />
              <Card title="Revenue" value={`₹${stats.totalRevenue || 0}`} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-xl font-semibold">Recent Orders</h3>

                {(stats.recentOrders || []).map((order) => (
                  <div
                    key={order._id}
                    className="mt-3 p-3 rounded-2xl bg-black/30"
                  >
                    {order.user?.name} • ₹{order.totalPrice} • {order.status}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-xl font-semibold">Quick Actions</h3>

                <div className="grid gap-3 mt-4">
                  <button className="p-3 rounded-2xl bg-white/10">
                    Add Product
                  </button>
                  <button
                    onClick={() => setPage("orders")}
                    className="p-3 rounded-2xl bg-white/10"
                  >
                    Manage Orders
                  </button>
                  <button className="p-3 rounded-2xl bg-white/10">
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* USERS */}
        {page === "users" && (
          <SectionBox title="All Users">
            <SimpleTable
              headers={["Name", "Email", "Role"]}
              rows={users.map((u) => [u.name, u.email, u.role])}
            />
          </SectionBox>
        )}

        {/* PRODUCTS */}
        {page === "products" && (
          <SectionBox title="All Products">
            <SimpleTable
              headers={["Title", "Price", "Stock", "Category"]}
              rows={products.map((p) => [
                p.title,
                `₹${p.price}`,
                p.stock,
                p.category,
              ])}
            />
          </SectionBox>
        )}

        {/* ORDERS */}
        {page === "orders" && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              <input
                type="text"
                placeholder="Search customer / email / order id"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none"
              >
                <option value="all">All Status</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 overflow-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="text-zinc-400 border-b border-white/10">
                    <th className="text-left py-3">Order</th>
                    <th className="text-left py-3">Customer</th>
                    <th className="text-left py-3">Amount</th>
                    <th className="text-left py-3">Items</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Update</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-4">#{order._id.slice(-6)}</td>

                      <td className="py-4">
                        <div>{order.user?.name || "User"}</div>
                        <small className="text-zinc-400">
                          {order.user?.email}
                        </small>
                      </td>

                      <td className="py-4">₹{order.totalPrice}</td>

                      <td className="py-4">{order.items.length}</td>

                      <td className="py-4">
                        <span style={badge(order.status)}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateStatus(order._id, e.target.value)
                          }
                          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2"
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-zinc-400">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* Components */

function Card({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-zinc-400">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}

function SectionBox({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="text-zinc-400 border-b border-white/10">
            {headers.map((head) => (
              <th key={head} className="text-left py-3">
                {head}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              {row.map((cell, index) => (
                <td key={index} className="py-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={headers.length}
                className="py-8 text-center text-zinc-400"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
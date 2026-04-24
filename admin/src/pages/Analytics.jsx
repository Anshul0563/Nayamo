import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  RefreshCcw,
  AlertTriangle,
  Ban,
  CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";

function Card({
  title,
  value,
  icon: Icon,
  color,
  sub,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {title}
        </p>

        <div className="h-10 w-10 rounded-2xl bg-black/30 grid place-items-center">
          <Icon
            size={18}
            className={color}
          />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mt-4">
        {value}
      </h2>

      {sub && (
        <p className="text-xs text-zinc-500 mt-2">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function Analytics() {
  const token = localStorage.getItem("token");

  const api = useMemo(
    () =>
      axios.create({
        baseURL:
          "http://localhost:5050/api/admin",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    [token]
  );

  const [loading, setLoading] =
    useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    lowStock: 0,
    outOfStock: 0,
    monthlySales: [],
    topProducts: [],
    recentOrders: [],
    lowStockProducts: [],
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "/dashboard"
      );

      setData(res.data.data);
    } catch (error) {
      console.log(
        error.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const bestMonth = useMemo(() => {
    if (!data.monthlySales?.length)
      return "-";

    return [...data.monthlySales].sort(
      (a, b) => b.sales - a.sales
    )[0]?.month;
  }, [data]);

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white text-xl">
        Loading Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">
            Analytics
          </h1>

          <p className="text-zinc-400 mt-1">
            Real-time business insights &
            growth tracking.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-3 rounded-2xl bg-black/30 border border-white/10 flex items-center gap-2">
            <CalendarDays size={16} />
            This Year
          </button>

          <button
            onClick={refresh}
            className="px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <RefreshCcw
              size={16}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Revenue"
          value={`₹${data.totalRevenue}`}
          icon={IndianRupee}
          color="text-emerald-400"
          sub="Total earnings"
        />

        <Card
          title="Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          color="text-cyan-400"
          sub="All orders"
        />

        <Card
          title="Products"
          value={data.totalProducts}
          icon={Package}
          color="text-yellow-400"
          sub="Listed products"
        />

        <Card
          title="Users"
          value={data.totalUsers}
          icon={Users}
          color="text-pink-400"
          sub="Registered users"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Avg Order Value"
          value={`₹${data.avgOrderValue}`}
          icon={TrendingUp}
          color="text-indigo-400"
        />

        <Card
          title="Low Stock"
          value={data.lowStock}
          icon={AlertTriangle}
          color="text-yellow-400"
        />

        <Card
          title="Out of Stock"
          value={data.outOfStock}
          icon={Ban}
          color="text-red-400"
        />

        <Card
          title="Best Month"
          value={bestMonth}
          icon={CalendarDays}
          color="text-cyan-400"
        />
      </div>

      {/* Charts */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-5">
            Monthly Revenue
          </h2>

          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data.monthlySales}
              >
                <defs>
                  <linearGradient
                    id="fillSales"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#6366f1"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="#6366f1"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                />

                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                />

                <YAxis
                  stroke="#71717a"
                />

                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#fillSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-5">
            Recent Orders
          </h2>

          <div className="space-y-3">
            {data.recentOrders?.length ===
            0 ? (
              <p className="text-zinc-400">
                No orders found
              </p>
            ) : (
              data.recentOrders.map(
                (order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl bg-black/30 p-3"
                  >
                    <p className="font-medium truncate">
                      {order.user?.name ||
                        "User"}
                    </p>

                    <p className="text-sm text-zinc-400">
                      ₹
                      {order.totalPrice}
                    </p>

                    <p className="text-xs text-zinc-500 mt-1 uppercase">
                      {
                        order.status
                      }
                    </p>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid xl:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-5">
            Top Products
          </h2>

          <div className="h-80">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={data.topProducts}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#27272a"
                />

                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                />

                <YAxis
                  stroke="#71717a"
                />

                <Tooltip />

                <Bar
                  dataKey="sales"
                  fill="#10b981"
                  radius={[
                    10, 10, 0, 0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-semibold mb-5">
            Low Stock Products
          </h2>

          <div className="space-y-3">
            {data.lowStockProducts
              ?.length === 0 ? (
              <p className="text-zinc-400">
                No low stock items
              </p>
            ) : (
              data.lowStockProducts.map(
                (item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl bg-black/30 p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium truncate">
                        {item.name ||
                          item.title}
                      </p>

                      <p className="text-xs text-zinc-500">
                        ₹
                        {item.price}
                      </p>
                    </div>

                    <span className="text-yellow-400 font-semibold">
                      {item.stock}
                    </span>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
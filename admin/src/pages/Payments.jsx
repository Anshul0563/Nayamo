// FILE: admin/src/pages/Payments.jsx

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  Wallet,
  Clock3,
  AlertCircle,
  CheckCircle2,
  Search,
  RefreshCcw,
  CreditCard,
} from "lucide-react";

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5050/api/admin",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const loadPayments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (error) {
      console.log("Payments Load Error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const transactions = useMemo(() => {
    return orders.map((order) => {
      const isPaid =
        order.isPaid ||
        order.paymentStatus === "paid";

      let status = "pending";

      if (isPaid) status = "paid";
      else if (order.paymentStatus === "failed")
        status = "failed";

      return {
        id: order._id,
        customer: order.user?.name || "Customer",
        method:
          order.paymentMethod === "cod"
            ? "COD"
            : "Online",
        amount: Number(order.totalPrice || 0),
        status,
        date: new Date(
          order.createdAt
        ).toLocaleDateString(),
      };
    });
  }, [orders]);

  const filtered = useMemo(() => {
    return transactions.filter(
      (item) =>
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customer
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const stats = useMemo(() => {
    const total = transactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const received = transactions
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + item.amount, 0);

    const pending = transactions
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0);

    const failed = transactions
      .filter((item) => item.status === "failed")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      total,
      received,
      pending,
      failed,
    };
  }, [transactions]);

  const Card = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon size={18} className={color} />
      </div>

      <h2 className={`text-2xl md:text-3xl font-bold mt-4 ${color}`}>
        {value}
      </h2>
    </div>
  );

  const Status = ({ status }) => {
    if (status === "paid") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20 inline-flex items-center gap-1">
          <CheckCircle2 size={14} />
          Paid
        </span>
      );
    }

    if (status === "pending") {
      return (
        <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 inline-flex items-center gap-1">
          <Clock3 size={14} />
          Pending
        </span>
      );
    }

    return (
      <span className="px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
        <AlertCircle size={14} />
        Failed
      </span>
    );
  };

  if (loading) {
    return (
      <div className="h-[70vh] grid place-items-center text-white text-2xl">
        Loading Payments...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">
            Payments
          </h1>
          <p className="text-zinc-400 mt-1">
            Real-time payment analytics & transactions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-4 top-4 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payment..."
              className="w-full sm:w-72 pl-10 pr-4 py-3 rounded-2xl bg-black/30 border border-white/10 outline-none"
            />
          </div>

          <button
            onClick={loadPayments}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card
          title="Gross Revenue"
          value={`₹${stats.total}`}
          icon={IndianRupee}
          color="text-emerald-400"
        />

        <Card
          title="Received"
          value={`₹${stats.received}`}
          icon={Wallet}
          color="text-cyan-400"
        />

        <Card
          title="Pending"
          value={`₹${stats.pending}`}
          icon={Clock3}
          color="text-yellow-400"
        />

        <Card
          title="Failed"
          value={`₹${stats.failed}`}
          icon={AlertCircle}
          color="text-red-400"
        />
      </div>

      {/* Transactions */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold">
            Recent Transactions
          </h2>

          <span className="text-sm text-zinc-400">
            {filtered.length} records
          </span>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-zinc-400 py-10">
              No payments found
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {item.customer}
                  </p>

                  <p className="text-sm text-zinc-400 break-all">
                    #{item.id.slice(-8)} • {item.date}
                  </p>
                </div>

                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <CreditCard size={15} />
                  {item.method}
                </div>

                <div className="font-bold text-emerald-400">
                  ₹{item.amount}
                </div>

                <Status status={item.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 p-6">
        <h3 className="text-xl font-bold">
          Razorpay Ready
        </h3>
        <p className="text-zinc-300 mt-2">
          Real payments automatically appear here after successful checkout.
        </p>
      </div>
    </div>
  );
}
// FILE: admin/src/pages/Payments.jsx

import { useMemo, useState } from "react";
import {
  IndianRupee,
  Wallet,
  CreditCard,
  Landmark,
  Download,
  FileText,
  BadgePercent,
  Search,
  RefreshCcw,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

export default function Payments() {
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("April 2026");

  // Demo dynamic-ready structure
  const transactions = [
    {
      id: "TXN89452",
      customer: "Anshul",
      method: "UPI",
      amount: 1299,
      status: "paid",
      date: "16 Apr 2026",
      gst: 233.82,
    },
    {
      id: "TXN89453",
      customer: "Riya",
      method: "COD",
      amount: 699,
      status: "pending",
      date: "16 Apr 2026",
      gst: 125.82,
    },
    {
      id: "TXN89454",
      customer: "Mohit",
      method: "Card",
      amount: 2199,
      status: "paid",
      date: "15 Apr 2026",
      gst: 395.82,
    },
    {
      id: "TXN89455",
      customer: "Neha",
      method: "NetBanking",
      amount: 499,
      status: "failed",
      date: "14 Apr 2026",
      gst: 89.82,
    },
  ];

  const filtered = useMemo(() => {
    return transactions.filter(
      (item) =>
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const stats = useMemo(() => {
    const total = transactions.reduce((s, i) => s + i.amount, 0);
    const paid = transactions
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.amount, 0);

    const pending = transactions
      .filter((i) => i.status === "pending")
      .reduce((s, i) => s + i.amount, 0);

    const gstCollected = transactions
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.gst, 0);

    return { total, paid, pending, gstCollected };
  }, []);

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

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 md:p-6 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">
            Payments & GST
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage collections, settlements and tax reports.
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

          <button className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold">
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
          value={`₹${stats.paid}`}
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
          title="GST Collected"
          value={`₹${stats.gstCollected.toFixed(2)}`}
          icon={BadgePercent}
          color="text-violet-400"
        />
      </div>

      {/* Payment Methods + GST */}
      <div className="grid xl:grid-cols-3 gap-4">
        {/* Methods */}
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold">
              Recent Transactions
            </h2>

            <span className="text-sm text-zinc-400">
              {filtered.length} records
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-black/30 border border-white/5 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-semibold">{item.customer}</p>
                  <p className="text-sm text-zinc-400">
                    {item.id} • {item.date}
                  </p>
                </div>

                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  {item.method === "UPI" && <Wallet size={15} />}
                  {item.method === "Card" && <CreditCard size={15} />}
                  {item.method === "NetBanking" && (
                    <Landmark size={15} />
                  )}
                  {item.method === "COD" && <IndianRupee size={15} />}
                  {item.method}
                </div>

                <div className="font-bold text-emerald-400">
                  ₹{item.amount}
                </div>

                <Status status={item.status} />
              </div>
            ))}
          </div>
        </div>

        {/* GST Panel */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg md:text-xl font-semibold">
            GST Center
          </h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
              <p className="text-sm text-zinc-400">Return Month</p>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-2 w-full px-3 py-3 rounded-2xl bg-zinc-900 border border-white/10 outline-none"
              >
                <option>April 2026</option>
                <option>March 2026</option>
                <option>February 2026</option>
              </select>
            </div>

            <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
              <p className="text-sm text-zinc-400">Taxable Sales</p>
              <h3 className="text-2xl font-bold mt-2">
                ₹{stats.paid}
              </h3>
            </div>

            <div className="rounded-2xl bg-black/30 p-4 border border-white/5">
              <p className="text-sm text-zinc-400">GST Payable</p>
              <h3 className="text-2xl font-bold mt-2 text-violet-400">
                ₹{stats.gstCollected.toFixed(2)}
              </h3>
            </div>

            <button className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
              <FileText size={16} />
              Generate GST Report
            </button>

            <button className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-semibold flex items-center justify-center gap-2">
              <Download size={16} />
              Download CSV
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Card */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 p-6">
        <h3 className="text-xl font-bold">
          Razorpay / Cashfree / Stripe Ready
        </h3>
        <p className="text-zinc-300 mt-2">
          Connect your gateway and track real-time settlements here.
        </p>
      </div>
    </div>
  );
}
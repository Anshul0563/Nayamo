import React from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TopSellingChart({ products = [] }) {

  const filtered = products.filter(
    p => !["cancelled", "returned", "rto"].includes(p.status)
  );

  return (
    <div className="p-6 bg-[#0d0d0d] rounded-2xl border border-white/5">
      <h3 className="text-white mb-4">Top Selling Products</h3>

      <div className="h-[250px]">
        <ResponsiveContainer>
          <BarChart data={filtered}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="sold" fill="#D4A853" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
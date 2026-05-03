import React from "react";

export default function Heatmap({ data = [] }) {

  return (
    <div className="p-6 bg-[#0d0d0d] rounded-2xl border border-white/5">
      <h3 className="text-white mb-4">Sales Heatmap</h3>

      <div className="grid grid-cols-7 gap-2">
        {data.map((d, i) => {
          const intensity = Math.min(d.revenue / 1000, 1);

          return (
            <div
              key={i}
              className="h-10 rounded"
              style={{
                background: `rgba(212,168,83,${intensity})`,
              }}
              title={`₹${d.revenue}`}
            />
          );
        })}
      </div>
    </div>
  );
}
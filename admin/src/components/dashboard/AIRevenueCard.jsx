import React from "react";
import { predictRevenue } from "../utils/revenuePrediction";

export default function AIRevenueCard({ data }) {
  const prediction = predictRevenue(data);

  return (
    <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5">
      <p className="text-xs text-gray-400 mb-2">AI Prediction</p>
      <h2 className="text-3xl text-white font-bold">
        ₹{prediction.toLocaleString("en-IN")}
      </h2>
      <p className="text-xs text-gray-500 mt-2">
        Expected next period revenue
      </p>
    </div>
  );
}
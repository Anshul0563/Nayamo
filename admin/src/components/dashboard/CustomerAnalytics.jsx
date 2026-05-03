import React from "react";

export default function CustomerAnalytics({ stats }) {
  return (
    <div className="p-6 bg-[#0d0d0d] rounded-2xl border border-white/5">

      <h3 className="text-white mb-4">Customer Insights</h3>

      <div className="space-y-3 text-sm text-gray-400">

        <div className="flex justify-between">
          <span>New Users</span>
          <span>{stats.newUsersToday || 0}</span>
        </div>

        <div className="flex justify-between">
          <span>Returning Users</span>
          <span>{stats.returningUsers || 0}</span>
        </div>

        <div className="flex justify-between">
          <span>Conversion Rate</span>
          <span>{stats.conversionRate || 0}%</span>
        </div>

        <div className="flex justify-between">
          <span>Avg Session</span>
          <span>{stats.avgSession || "2m 30s"}</span>
        </div>

      </div>
    </div>
  );
}
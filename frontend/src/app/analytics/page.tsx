"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { auditApi } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

const BLOOD_COLORS: Record<string, string> = {
  "O+": "#ef4444",
  "O-": "#dc2626",
  "A+": "#3b82f6",
  "A-": "#2563eb",
  "B+": "#22c55e",
  "B-": "#16a34a",
  "AB+": "#a855f7",
  "AB-": "#9333ea",
};

const STATUS_COLORS: Record<string, string> = {
  Healthy: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444",
};

export default function AnalyticsPage() {
  const { inventory, donors, currentUser } = useAppContext();
  const router = useRouter();
  const [auditStats, setAuditStats] = useState<any>(null);

  useEffect(() => {
    if (currentUser?.role === "donor") router.replace("/");
  }, [currentUser, router]);

  useEffect(() => {
    auditApi.getStats().then((res) => setAuditStats(res.data)).catch(() => {});
  }, []);

  if (currentUser?.role === "donor") return null;

  // Blood type distribution data
  const bloodDistribution = inventory.map((item) => ({
    name: item.type,
    value: item.units,
    color: BLOOD_COLORS[item.type] || "#71717a",
  }));

  // Inventory status data
  const statusCounts = { Healthy: 0, Warning: 0, Critical: 0 };
  inventory.forEach((item) => {
    statusCounts[item.status]++;
  });
  const statusData = Object.entries(statusCounts).map(([name, count]) => ({
    name,
    count,
    fill: STATUS_COLORS[name],
  }));

  // Donor availability
  const availableCount = donors.filter((d) => d.available).length;
  const unavailableCount = donors.length - availableCount;
  const availabilityData = [
    { name: "Available", value: availableCount, fill: "#22c55e" },
    { name: "Unavailable", value: unavailableCount, fill: "#71717a" },
  ];

  // Donor reliability distribution
  const reliabilityBuckets = [
    { range: "90-100", count: 0, fill: "#22c55e" },
    { range: "70-89", count: 0, fill: "#3b82f6" },
    { range: "50-69", count: 0, fill: "#f59e0b" },
    { range: "0-49", count: 0, fill: "#ef4444" },
  ];
  donors.forEach((d) => {
    if (d.reliability >= 90) reliabilityBuckets[0].count++;
    else if (d.reliability >= 70) reliabilityBuckets[1].count++;
    else if (d.reliability >= 50) reliabilityBuckets[2].count++;
    else reliabilityBuckets[3].count++;
  });

  // Expiring units
  const expiringData = inventory
    .filter((i) => i.expiringIn48h > 0)
    .map((i) => ({
      name: i.type,
      expiring: i.expiringIn48h,
      fill: BLOOD_COLORS[i.type] || "#71717a",
    }))
    .sort((a, b) => b.expiring - a.expiring);

  // Donor blood type coverage
  const donorsByType: Record<string, number> = {};
  donors.forEach((d) => {
    donorsByType[d.bloodType] = (donorsByType[d.bloodType] || 0) + 1;
  });
  const coverageData = Object.entries(donorsByType).map(([type, count]) => ({
    name: type,
    donors: count,
    fill: BLOOD_COLORS[type] || "#71717a",
  }));

  const totalUnits = inventory.reduce((acc, i) => acc + i.units, 0);

  // Custom dark tooltip component for all charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl">
        {label && <p className="text-xs font-semibold text-zinc-300 mb-1.5">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
            <span className="text-sm text-zinc-200 font-medium capitalize">{entry.name}:</span>
            <span className="text-sm text-white font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const cursorStyle = { fill: "rgba(255,255,255,0.04)", radius: 4 };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-brand" />
            Analytics Dashboard
          </h1>
          <p className="text-zinc-400">
            Visualize blood inventory, donor networks, and system activity.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-panel border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm font-medium">Total Supply</span>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-3xl font-bold">{totalUnits.toLocaleString()}</span>
            <span className="text-sm text-zinc-500 ml-2">units</span>
          </div>
          <div className="bg-panel border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm font-medium">Blood Types Tracked</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-3xl font-bold">{inventory.length}</span>
            <span className="text-sm text-zinc-500 ml-2">types</span>
          </div>
          <div className="bg-panel border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm font-medium">Registered Donors</span>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-3xl font-bold">{donors.length}</span>
            <span className="text-sm text-zinc-500 ml-2">donors</span>
          </div>
          <div className="bg-panel border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm font-medium">System Actions</span>
              <BarChart3 className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-3xl font-bold">{auditStats?.totalLogs ?? 0}</span>
            <span className="text-sm text-zinc-500 ml-2">logged</span>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Type Distribution Donut */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Blood Type Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bloodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {bloodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-zinc-300 text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Inventory Status Breakdown</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donor Availability */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Donor Availability</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="40%"
                  outerRadius="80%"
                  data={availabilityData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar dataKey="value" cornerRadius={10} />
                  <Legend
                    formatter={(value) => <span className="text-zinc-300 text-xs">{value}</span>}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-4">
              <span className="text-3xl font-bold text-emerald-500">
                {donors.length > 0 ? Math.round((availableCount / donors.length) * 100) : 0}%
              </span>
              <span className="text-sm text-zinc-400 ml-2">available</span>
            </div>
          </div>

          {/* Donor Reliability */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Donor Reliability</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reliabilityBuckets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis dataKey="range" type="category" stroke="#71717a" fontSize={11} width={60} />
                  <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {reliabilityBuckets.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donor Blood Type Coverage */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Donor Coverage by Type</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
                  <Bar dataKey="donors" radius={[8, 8, 0, 0]}>
                    {coverageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Expiring Units */}
        {expiringData.length > 0 && (
          <div className="bg-panel border border-amber-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Units Expiring in 48 Hours
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expiringData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" stroke="#71717a" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={40} />
                  <Tooltip content={<CustomTooltip />} cursor={cursorStyle} />
                  <Bar dataKey="expiring" radius={[0, 8, 8, 0]}>
                    {expiringData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

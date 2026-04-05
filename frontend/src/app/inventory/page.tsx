"use client";

import { Droplet, Search, Filter, Plus, ArrowUpRight, ArrowDownRight, MoreVertical, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  const inventoryData = [
    { type: "O+", units: 420, status: "Healthy", trend: "+5%", critical: false },
    { type: "O-", units: 85, status: "Critical", trend: "-12%", critical: true },
    { type: "A+", units: 310, status: "Healthy", trend: "+2%", critical: false },
    { type: "A-", units: 45, status: "Warning", trend: "-8%", critical: false },
    { type: "B+", units: 190, status: "Healthy", trend: "+1%", critical: false },
    { type: "B-", units: 30, status: "Warning", trend: "-4%", critical: false },
    { type: "AB+", units: 120, status: "Healthy", trend: "+8%", critical: false },
    { type: "AB-", units: 15, status: "Critical", trend: "-20%", critical: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      {/* Navbar (Placeholder identical to Dashboard for now) */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-brand" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Blood<span className="text-brand">Link</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="/" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="/inventory" className="text-foreground hover:text-brand transition-colors">Inventory</a>
            <a href="/donors" className="hover:text-foreground transition-colors">Donors</a>
            <a href="/emergencies" className="hover:text-foreground transition-colors">Emergencies</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-panel border border-border flex items-center justify-center text-sm font-semibold text-zinc-300">
              AD
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Blood Inventory Management</h1>
            <p className="text-zinc-400">
              Monitor real-time stock levels, expiration dates, and distribution across the network.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-panel border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Donation
            </button>
            <button className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-brand-hover transition-colors flex items-center gap-2">
              Update Stock
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Network Supply Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">1,215</span>
              <span className="text-sm text-zinc-500">Total Units</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
            <span className="text-sm font-medium text-zinc-400">Critical Shortages</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-500">2</span>
              <span className="text-sm text-zinc-500">Blood Types</span>
            </div>
            <span className="text-xs text-zinc-400 mt-1">O- and AB- below 10% safety threshold</span>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Expiring Soon (48h)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-500">34</span>
              <span className="text-sm text-zinc-500">Units</span>
            </div>
            <span className="text-xs text-zinc-400 mt-1">Priority dispatch recommended</span>
          </div>
        </div>

        {/* Inventory Data Table Layout */}
        <div className="bg-panel border border-border rounded-2xl overflow-hidden flex flex-col">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/50">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search blood type or ID..." 
                className="w-full bg-background border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white"
              />
            </div>
            <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter By Status
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Blood Type</th>
                  <th className="px-6 py-4 font-medium">Available Units</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">7-Day Trend</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventoryData.map((item, index) => (
                  <tr key={index} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-inner ${item.critical ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-zinc-800 text-zinc-300 border border-border'}`}>
                          {item.type}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-lg">{item.units}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                        item.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                        item.status === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {item.critical && <AlertTriangle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1 ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {item.trend.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span className="font-medium">{item.trend}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-zinc-400 hover:text-white transition-colors p-2">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { Activity, Droplet, Users, BellRing, Search, Plus, MapPin, ArrowRight, HeartPulse } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      {/* Navbar */}
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
            <a href="#" className="text-foreground hover:text-brand transition-colors">Dashboard</a>
            <a href="#" className="hover:text-foreground transition-colors">Inventory</a>
            <a href="#" className="hover:text-foreground transition-colors">Donors</a>
            <a href="#" className="hover:text-foreground transition-colors">Emergencies</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-foreground transition-colors relative">
              <BellRing className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-panel border border-border flex items-center justify-center text-sm font-semibold text-zinc-300">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Platform Overview</h1>
            <p className="text-zinc-400 max-w-xl">
              Real-time blood donation coordination and matching across hospital networks.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-panel border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Donors
            </button>
            <button className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-brand-hover transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Request
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm font-medium">Total Inventory</span>
              <Activity className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">1,842</span>
              <span className="text-sm text-zinc-500">units</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
              <span className="font-semibold">+12%</span>
              <span className="text-zinc-400">from yesterday</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm font-medium">Active Alerts</span>
              <BellRing className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">4</span>
              <span className="text-sm text-zinc-500">critical</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-red-500 bg-red-500/10 w-fit px-2 py-1 rounded-md">
              <span className="font-semibold">O- and A-</span>
              <span className="text-zinc-400">shortage</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm font-medium">Eligible Donors</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">8,405</span>
              <span className="text-sm text-zinc-500">active</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-500 bg-blue-500/10 w-fit px-2 py-1 rounded-md">
              <span className="font-semibold">342</span>
              <span className="text-zinc-400">ready today</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-brand text-sm font-semibold">Emergency Match</span>
                <HeartPulse className="w-5 h-5 text-brand" />
              </div>
              <div className="flex flex-col gap-1 mb-4">
                <span className="text-2xl font-bold text-white">Trauma Unit - City General</span>
                <span className="text-sm text-zinc-300">Requires 6 units of O-</span>
              </div>
              <button className="w-full py-2 bg-brand text-white rounded-lg text-sm font-semibold shadow-md hover:bg-brand-hover transition-colors flex items-center justify-center gap-2">
                Initiate Algorithm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          
          {/* Inventory Breakdown */}
          <div className="lg:col-span-2 bg-panel border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Live Inventory Status</h2>
              <button className="text-sm font-medium text-brand hover:text-brand-hover">View Details</button>
            </div>
            <div className="space-y-4">
              {['O Positive (O+)', 'A Positive (A+)', 'O Negative (O-)'].map((type, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium text-zinc-300">{type}</div>
                  <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${i === 2 ? 'bg-brand' : 'bg-zinc-400'}`} 
                      style={{ width: `${i === 0 ? 75 : i === 1 ? 60 : 15}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right text-sm">
                    {i === 0 ? '420U' : i === 1 ? '310U' : '85U'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Coordination */}
          <div className="bg-panel border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Coordination</h2>
            <div className="space-y-5">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white mb-1">Transfer to St. Mary's</h3>
                    <p className="text-xs text-zinc-400">12 units of AB- dispatched via MedTransport. ETA 15 mins.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

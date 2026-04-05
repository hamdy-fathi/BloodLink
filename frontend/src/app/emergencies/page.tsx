"use client";

import { Droplet, AlertCircle, HeartPulse, MapPin, Clock, Search } from "lucide-react";

export default function EmergenciesPage() {
  const emergencies = [
    {
      id: "EM-001",
      hospital: "Qasr Al-Ainy Hospital",
      department: "Trauma Unit",
      type: "O-",
      units: 6,
      urgency: "Critical",
      time: "10 mins ago",
      distance: "3.8 km",
    },
    {
      id: "EM-002",
      hospital: "Ain Shams Specialized Hospital",
      department: "Surgery",
      type: "A+",
      units: 4,
      urgency: "High",
      time: "45 mins ago",
      distance: "8.2 km",
    },
    {
      id: "EM-003",
      hospital: "Dar El Fouad Hospital",
      department: "Maternity",
      type: "AB-",
      units: 2,
      urgency: "Medium",
      time: "2 hours ago",
      distance: "12.5 km",
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      {/* Navbar Minimal */}
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
            <a href="/inventory" className="hover:text-foreground transition-colors">Inventory</a>
            <a href="/donors" className="hover:text-foreground transition-colors">Donors</a>
            <a href="/emergencies" className="text-foreground hover:text-brand transition-colors">Emergencies</a>
          </nav>
          <div className="w-9 h-9 rounded-full bg-panel border border-border flex items-center justify-center text-sm font-semibold text-zinc-300">
            AD
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Requests List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">Active Emergencies</h1>
            <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">{emergencies.length}</span>
          </div>
          
          <div className="relative w-full mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search hospital or ID..." 
              className="w-full bg-panel border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-4">
            {emergencies.map((request) => (
              <div 
                key={request.id} 
                className={`bg-panel border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  request.id === "EM-001" ? "border-brand/50 shadow-[0_0_15px_rgba(225,29,72,0.1)] relative overflow-hidden" : "border-border hover:border-zinc-600"
                }`}
              >
                {request.id === "EM-001" && <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>}
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${request.urgency === 'Critical' ? 'text-brand' : request.urgency === 'High' ? 'text-amber-500' : 'text-blue-500'}`} />
                    <span className="text-xs font-semibold text-zinc-300">{request.id}</span>
                  </div>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {request.time}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white leading-tight mb-1">{request.hospital}</h3>
                <p className="text-sm text-zinc-400 mb-4">{request.department}</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-sm font-bold text-white shrink-0">
                    {request.type}
                  </div>
                  <div className="flex-1 text-sm font-medium">
                    <span className="text-zinc-300">Requires: </span>
                    <span className="text-white">{request.units} Units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Match Engine */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-panel border border-brand/30 rounded-2xl p-6 lg:p-8 flex-1 relative overflow-hidden shadow-[0_0_30px_rgba(225,29,72,0.05)]">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                  <HeartPulse className="w-6 h-6 text-brand" />
                  Matching Engine
                </h2>
                <p className="text-sm text-zinc-400 mt-1">EM-001 • Qasr Al-Ainy Hospital</p>
              </div>
              <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-lg flex items-center gap-2 w-fit">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
                </span>
                <span className="text-xs font-bold text-brand">Algorithm Active</span>
              </div>
            </div>

            {/* Match Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-zinc-400 mb-1">Required Type</div>
                <div className="text-xl font-bold text-brand">O- Negative</div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-zinc-400 mb-1">Distance Radius</div>
                <div className="text-xl font-bold text-white">15 km</div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-zinc-400 mb-1">Compatible Donors</div>
                <div className="text-xl font-bold text-white">42 found</div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-xs text-zinc-400 mb-1">High Reliability</div>
                <div className="text-xl font-bold text-emerald-500">12 match</div>
              </div>
            </div>

            {/* Recommended Matches */}
            <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-zinc-200">Top Recommended Donors</h3>
            
            <div className="space-y-3 relative z-10">
              {[
                { name: "Mohamed T.", distance: "1.9 km", reliable: "98%", time: "ETA 12m", score: "99" },
                { name: "Sara E.", distance: "5.4 km", reliable: "95%", time: "ETA 20m", score: "94" },
                { name: "Youssef K.", distance: "6.6 km", reliable: "82%", time: "ETA 25m", score: "88" },
              ].map((donor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-zinc-600 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                      {donor.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{donor.name}</h4>
                      <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {donor.distance}</span>
                        <span>•</span>
                        <span className="text-emerald-500 font-medium">{donor.reliable} Reliability</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold">{donor.time}</div>
                      <div className="text-xs text-zinc-500">Predicted Arrival</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-brand flex items-center justify-center font-bold text-brand shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                      {donor.score}
                    </div>
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                      Notify
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand/20">
              Notify All Top Matches
            </button>
            
          </div>
        </div>

      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/Toast";
import { Activity, Users, BellRing, Search, Plus, MapPin, ArrowRight, HeartPulse, AlertCircle, Package, Heart, Settings, ArrowRightLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { NotificationType } from "@/lib/types";

function notifIcon(type: NotificationType) {
  switch (type) {
    case "emergency": return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "shortage": return <Package className="w-5 h-5 text-amber-500" />;
    case "donation": return <Heart className="w-5 h-5 text-emerald-500" />;
    case "transfer": return <ArrowRightLeft className="w-5 h-5 text-blue-500" />;
    case "system": return <Settings className="w-5 h-5 text-zinc-400" />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Admin / Staff / Manager Dashboard ──
function AdminDashboard() {
  const { inventory, donors } = useAppContext();

  const totalUnits = inventory.reduce((acc, i) => acc + i.units, 0);
  const criticalAlerts = inventory.filter((i) => i.status === "Critical").length;
  const activeDonors = donors.filter((d) => d.available).length;
  const readyToday = donors.filter((d) => d.available && d.eligible).length;

  return (
    <>
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Platform Overview</h1>
          <p className="text-zinc-400 max-w-xl">
            Real-time blood donation coordination and matching across hospital networks.
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/donors" className="px-4 py-2 rounded-lg bg-panel border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Donors
          </a>
          <a href="/emergencies" className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-brand-hover transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </a>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm font-medium">Total Inventory</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{totalUnits.toLocaleString()}</span>
            <span className="text-sm text-zinc-500">units</span>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm font-medium">Critical Alerts</span>
            <BellRing className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{criticalAlerts}</span>
            <span className="text-sm text-zinc-500">blood types</span>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm font-medium">Eligible Donors</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{activeDonors.toLocaleString()}</span>
            <span className="text-sm text-zinc-500">available</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-blue-500 bg-blue-500/10 w-fit px-2 py-1 rounded-md">
            <span className="font-semibold">{readyToday}</span>
            <span className="text-zinc-400">ready today</span>
          </div>
        </div>

        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-brand text-sm font-semibold">Emergency Match</span>
              <HeartPulse className="w-5 h-5 text-brand" />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              <span className="text-2xl font-bold text-white">Trauma Unit</span>
              <span className="text-sm text-zinc-300">Qasr Al-Ainy • 6 units O-</span>
            </div>
            <a href="/emergencies" className="w-full py-2 bg-brand text-white rounded-lg text-sm font-semibold shadow-md hover:bg-brand-hover transition-colors flex items-center justify-center gap-2">
              Match Now <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Live Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 bg-panel border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Live Inventory Status</h2>
            <a href="/inventory" className="text-sm font-medium text-brand hover:text-brand-hover">View All →</a>
          </div>
          <div className="space-y-4">
            {inventory.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-14 text-sm font-bold text-zinc-300">{item.type}</div>
                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${item.critical ? "bg-brand" : "bg-zinc-400"}`}
                    style={{ width: `${Math.min((item.units / 500) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="w-16 text-right text-sm">{item.units}U</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Coordination</h2>
          <div className="space-y-5">
            {[
              { title: "Transfer to Ain Shams", desc: "12 units AB- dispatched. ETA 15 mins." },
              { title: "Pickup from Red Crescent", desc: "80 units O+ received and logged." },
              { title: "Alert to Dar El Fouad", desc: "Low B- stock warning issued." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Donor Dashboard ──
function DonorDashboard() {
  const { currentUser, notifications, respondToNotification } = useAppContext();
  const { toast } = useToast();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  // Donor only sees emergency-type notifications (requests directed at them)
  const emergencyNotifs = notifications.filter((n) => n.type === "emergency");
  const otherNotifs = notifications.filter((n) => n.type !== "emergency");
  const pendingCount = emergencyNotifs.filter((n) => n.response === "pending").length;
  const acceptedCount = emergencyNotifs.filter((n) => n.response === "accepted").length;

  async function handleRespond(id: string, response: "accepted" | "refused") {
    setRespondingId(id);
    try {
      await respondToNotification(id, response);
      toast(
        response === "accepted" ? "success" : "info",
        response === "accepted" ? "Request Accepted" : "Request Declined",
        response === "accepted"
          ? "Thank you! The hospital has been notified of your availability."
          : "The hospital will look for another donor."
      );
    } catch {
      toast("error", "Failed", "Could not send your response. Please try again.");
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <>
      {/* Welcome */}
      <div className="mb-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Welcome, {currentUser?.name?.split(" ")[0]}
        </h1>
        <p className="text-zinc-400 max-w-xl">
          Here are your blood donation requests and notifications.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm font-medium">Active Requests</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{pendingCount}</span>
            <span className="text-sm text-zinc-500">pending</span>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-zinc-400 text-sm font-medium">Accepted</span>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-500">{acceptedCount}</span>
            <span className="text-sm text-zinc-500">donations</span>
          </div>
        </div>

        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-brand text-sm font-semibold">Your Role</span>
            <HeartPulse className="w-5 h-5 text-brand" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-white">Blood Donor</span>
            <span className="text-sm text-zinc-300">Thank you for saving lives</span>
          </div>
        </div>
      </div>

      {/* Emergency Requests */}
      <div className="bg-panel border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Emergency Requests
          </h2>
          <span className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 rounded-full px-3 py-1 font-semibold">
            {pendingCount} pending
          </span>
        </div>

        {emergencyNotifs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <HeartPulse className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm">No emergency requests at this time.</p>
            <p className="text-xs text-zinc-600 mt-1">You will be notified when your blood type is needed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyNotifs.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  !n.read
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-background border-border"
                }`}
              >
                <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${!n.read ? "text-white" : "text-zinc-300"}`}>
                      {n.title}
                    </h4>
                    {n.response === "accepted" && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        <CheckCircle className="w-3 h-3" /> Accepted
                      </span>
                    )}
                    {n.response === "refused" && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold bg-zinc-700/50 text-zinc-400 border border-zinc-600 rounded-full px-2 py-0.5">
                        <XCircle className="w-3 h-3" /> Declined
                      </span>
                    )}
                    {n.response === "pending" && (
                      <span className="shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-zinc-500">{timeAgo(n.timestamp)}</span>
                    {n.response === "pending" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(n.id, "accepted")}
                          disabled={respondingId === n.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                        >
                          {respondingId === n.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(n.id, "refused")}
                          disabled={respondingId === n.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Other Notifications */}
      {otherNotifs.length > 0 && (
        <div className="bg-panel border border-border rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-zinc-400" />
            Other Notifications
          </h2>
          <div className="space-y-3">
            {otherNotifs.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  !n.read ? "bg-brand/5 border-brand/20" : "bg-background border-border"
                }`}
              >
                <div className="mt-0.5 shrink-0">{notifIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${!n.read ? "text-white" : "text-zinc-300"}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">{n.message}</p>
                  <span className="text-[10px] text-zinc-500 mt-2 block">{timeAgo(n.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  const { currentUser } = useAppContext();
  const isDonor = currentUser?.role === "donor";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {isDonor ? <DonorDashboard /> : <AdminDashboard />}
      </main>
    </div>
  );
}

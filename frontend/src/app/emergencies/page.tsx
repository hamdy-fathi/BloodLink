"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { emergenciesApi } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  Droplet,
  AlertCircle,
  HeartPulse,
  MapPin,
  Clock,
  Search,
  Plus,
  X,
} from "lucide-react";

interface Emergency {
  id: string;
  hospital: string;
  department: string;
  requiredType: string;
  unitsNeeded: number;
  urgency: string;
  createdAt: string;
  distance: number;
}

interface MatchedDonor {
  id: string;
  name: string;
  bloodType: string;
  reliability: number;
  distance: string;
  eta: string;
  score: number;
  city: string;
  phone: string;
}

interface MatchResult {
  emergency: Emergency;
  totalCompatible: number;
  highReliability: number;
  donors: MatchedDonor[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default function EmergenciesPage() {
  const { isAuthenticated } = useAppContext();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formHospital, setFormHospital] = useState("");
  const [formDept, setFormDept] = useState("");
  const [formType, setFormType] = useState("O-");
  const [formUnits, setFormUnits] = useState("");
  const [formUrgency, setFormUrgency] = useState("Critical");

  useEffect(() => {
    if (!isAuthenticated) return;
    emergenciesApi
      .getAll()
      .then((res) => {
        setEmergencies(res.data);
        if (res.data.length > 0) {
          setSelectedId(res.data[0].id);
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Load match when selection changes
  useEffect(() => {
    if (!selectedId) {
      setMatchResult(null);
      return;
    }
    setLoadingMatch(true);
    emergenciesApi
      .match(selectedId)
      .then((res) => setMatchResult(res.data))
      .catch(() => {})
      .finally(() => setLoadingMatch(false));
  }, [selectedId]);

  const filtered = emergencies.filter(
    (e) =>
      e.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selected = emergencies.find((e) => e.id === selectedId) || null;

  async function handleNotifyAll() {
    if (!selectedId) return;
    await emergenciesApi.notify(selectedId);
    alert("All top matching donors have been notified!");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await emergenciesApi.create({
        hospital: formHospital,
        department: formDept,
        requiredType: formType,
        unitsNeeded: parseInt(formUnits) || 1,
        urgency: formUrgency,
      });
      setEmergencies((prev) => [res.data, ...prev]);
      setSelectedId(res.data.id);
      setShowCreate(false);
      setFormHospital("");
      setFormDept("");
      setFormType("O-");
      setFormUnits("");
      setFormUrgency("Critical");
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Requests List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Active Emergencies
            </h1>
            <div className="flex items-center gap-2">
              <span className="bg-brand text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {emergencies.length}
              </span>
              <button
                onClick={() => setShowCreate(true)}
                className="p-2 rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative w-full mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search hospital or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedId(request.id)}
                className={`bg-panel border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  selectedId === request.id
                    ? "border-brand/50 shadow-[0_0_15px_rgba(225,29,72,0.1)] relative overflow-hidden"
                    : "border-border hover:border-zinc-600"
                }`}
              >
                {selectedId === request.id && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
                )}

                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle
                      className={`w-4 h-4 ${
                        request.urgency === "Critical"
                          ? "text-brand"
                          : request.urgency === "High"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-zinc-300">
                      {request.id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeAgo(request.createdAt)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-tight mb-1">
                  {request.hospital}
                </h3>
                <p className="text-sm text-zinc-400 mb-4">
                  {request.department}
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 text-sm font-bold text-white shrink-0">
                    {request.requiredType}
                  </div>
                  <div className="flex-1 text-sm font-medium">
                    <span className="text-zinc-300">Requires: </span>
                    <span className="text-white">
                      {request.unitsNeeded} Units
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-panel border border-border rounded-xl p-12 text-center text-zinc-500">
                No active emergencies.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Match Engine */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="bg-panel border border-brand/30 rounded-2xl p-6 lg:p-8 flex-1 relative overflow-hidden shadow-[0_0_30px_rgba(225,29,72,0.05)]">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none"></div>

            {!selected ? (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Select an emergency to view matching engine
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                      <HeartPulse className="w-6 h-6 text-brand" />
                      Matching Engine
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {selected.id.slice(0, 8)} • {selected.hospital}
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-brand/10 border border-brand/20 rounded-lg flex items-center gap-2 w-fit">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand"></span>
                    </span>
                    <span className="text-xs font-bold text-brand">
                      Algorithm Active
                    </span>
                  </div>
                </div>

                {/* Match Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">
                      Required Type
                    </div>
                    <div className="text-xl font-bold text-brand">
                      {selected.requiredType}
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">
                      Distance Radius
                    </div>
                    <div className="text-xl font-bold text-white">15 km</div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">
                      Compatible Donors
                    </div>
                    <div className="text-xl font-bold text-white">
                      {loadingMatch ? "..." : `${matchResult?.totalCompatible ?? 0} found`}
                    </div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-xs text-zinc-400 mb-1">
                      High Reliability
                    </div>
                    <div className="text-xl font-bold text-emerald-500">
                      {loadingMatch ? "..." : `${matchResult?.highReliability ?? 0} match`}
                    </div>
                  </div>
                </div>

                {/* Recommended Matches */}
                <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-zinc-200">
                  Top Recommended Donors
                </h3>

                <div className="space-y-3 relative z-10">
                  {loadingMatch ? (
                    <div className="text-center py-8 text-zinc-500">
                      Running matching algorithm...
                    </div>
                  ) : matchResult && matchResult.donors.length > 0 ? (
                    matchResult.donors.map((donor) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-zinc-600 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm">
                            {donor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {donor.name}
                            </h4>
                            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {donor.distance}
                              </span>
                              <span>•</span>
                              <span className="text-emerald-500 font-medium">
                                {donor.reliability}% Reliability
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-semibold">
                              {donor.eta}
                            </div>
                            <div className="text-xs text-zinc-500">
                              Predicted Arrival
                            </div>
                          </div>
                          <div className="w-12 h-12 rounded-full border-2 border-brand flex items-center justify-center font-bold text-brand shadow-[0_0_10px_rgba(225,29,72,0.2)]">
                            {donor.score}
                          </div>
                          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors">
                            Notify
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-500">
                      No compatible donors found.
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNotifyAll}
                  className="w-full mt-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-brand/20"
                >
                  Notify All Top Matches
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Create Emergency Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-panel border border-border rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">New Emergency Request</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Hospital
                </label>
                <input
                  type="text"
                  value={formHospital}
                  onChange={(e) => setFormHospital(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="Hospital name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="e.g. Trauma Unit"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Blood Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                      (t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formUnits}
                    onChange={(e) => setFormUnits(e.target.value)}
                    required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                    placeholder="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={formUrgency}
                    onChange={(e) => setFormUrgency(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  >
                    {["Critical", "High", "Medium", "Low"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors shadow-[0_0_15px_rgba(225,29,72,0.2)] mt-2"
              >
                Create Emergency Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

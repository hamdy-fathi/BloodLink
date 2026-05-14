"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { mapApi, emergenciesApi } from "@/lib/api";
import {
  MapPin,
  Filter,
  AlertCircle,
  Users,
  Droplet,
  HeartPulse,
  Loader2,
} from "lucide-react";

// Dynamically import the map component (Leaflet needs window)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const MarkerComp = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

interface MapDonor {
  id: string;
  name: string;
  bloodType: string;
  city: string;
  lat: number;
  lng: number;
  available: boolean;
  eligible: boolean;
  reliability: number;
}

interface MapEmergency {
  id: string;
  hospital: string;
  department: string;
  requiredType: string;
  unitsNeeded: number;
  urgency: string;
  lat: number;
  lng: number;
}

interface MapDistrict {
  name: string;
  lat: number;
  lng: number;
  donorCount: number;
}

interface MatchedDonor {
  id: string;
  name: string;
  city: string;
  score: number;
  distanceKm: number;
}

const BLOOD_COLORS: Record<string, string> = {
  "O+": "#ef4444", "O-": "#dc2626",
  "A+": "#3b82f6", "A-": "#2563eb",
  "B+": "#22c55e", "B-": "#16a34a",
  "AB+": "#a855f7", "AB-": "#9333ea",
};

const URGENCY_COLORS: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f59e0b",
  Medium: "#3b82f6",
  Low: "#22c55e",
};

export default function MapPage() {
  const { currentUser } = useAppContext();
  const router = useRouter();
  const [mapData, setMapData] = useState<{
    districts: MapDistrict[];
    donors: MapDonor[];
    emergencies: MapEmergency[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [matchedDonors, setMatchedDonors] = useState<MatchedDonor[]>([]);
  const [filterType, setFilterType] = useState("All");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
    if (currentUser?.role === "donor") router.replace("/");
  }, [currentUser, router]);

  useEffect(() => {
    mapApi
      .getData()
      .then((res) => setMapData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // When an emergency is selected, run the matching engine
  useEffect(() => {
    if (!selectedEmergency) {
      setMatchedDonors([]);
      return;
    }
    emergenciesApi
      .match(selectedEmergency)
      .then((res) => {
        setMatchedDonors(res.data.donors || []);
      })
      .catch(() => {});
  }, [selectedEmergency]);

  const filteredDonors = useMemo(() => {
    if (!mapData) return [];
    return mapData.donors.filter((d) => {
      if (filterType !== "All" && d.bloodType !== filterType) return false;
      if (showAvailableOnly && !d.available) return false;
      return true;
    });
  }, [mapData, filterType, showAvailableOnly]);

  if (currentUser?.role === "donor") return null;

  // Get selected emergency data for drawing lines
  const selectedEmergencyData = mapData?.emergencies.find((e) => e.id === selectedEmergency);

  // Get matched donor IDs for highlighting
  const matchedDonorIds = new Set(matchedDonors.map((d) => d.id));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-brand" />
              Network Map
            </h1>
            <p className="text-zinc-400">
              Visualize donor locations, hospitals, and emergency connections across Cairo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-panel border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
            >
              <option value="All">All Types</option>
              {Object.keys(BLOOD_COLORS).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                showAvailableOnly
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              Available Only
            </button>
          </div>
        </div>

        {/* Map Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Total Donors</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              {mapData?.donors.length ?? 0}
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Active Emergencies</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              {mapData?.emergencies.length ?? 0}
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Districts</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              {mapData?.districts.length ?? 0}
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Matched Donors</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-brand" />
              {matchedDonors.length}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-panel border border-border rounded-2xl overflow-hidden relative" style={{ height: "520px" }}>
          {loading ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading map data...
            </div>
          ) : !isClient ? (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Initializing map...
            </div>
          ) : (
            <>
              <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              />
              <MapContainer
                center={[30.0444, 31.2357]}
                zoom={11}
                style={{ height: "100%", width: "100%", background: "#18181b" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* District circles */}
                {mapData?.districts.map((d) => (
                  <CircleMarker
                    key={d.name}
                    center={[d.lat, d.lng]}
                    radius={d.donorCount > 0 ? 8 + d.donorCount * 3 : 5}
                    pathOptions={{
                      fillColor: d.donorCount > 0 ? "#3b82f6" : "#3f3f46",
                      fillOpacity: 0.15,
                      color: d.donorCount > 0 ? "#3b82f6" : "#3f3f46",
                      weight: 1,
                    }}
                  >
                    <Popup>
                      <div style={{ color: "#fff", background: "#18181b", padding: "8px 12px", borderRadius: "8px", minWidth: "120px" }}>
                        <strong>{d.name}</strong>
                        <br />
                        <span style={{ color: "#a1a1aa" }}>{d.donorCount} donors</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Donor markers */}
                {filteredDonors.map((donor) => (
                  <CircleMarker
                    key={donor.id}
                    center={[donor.lat, donor.lng]}
                    radius={matchedDonorIds.has(donor.id) ? 8 : 5}
                    pathOptions={{
                      fillColor: matchedDonorIds.has(donor.id)
                        ? "#22c55e"
                        : donor.available
                        ? BLOOD_COLORS[donor.bloodType] || "#71717a"
                        : "#52525b",
                      fillOpacity: matchedDonorIds.has(donor.id) ? 1 : 0.8,
                      color: matchedDonorIds.has(donor.id) ? "#22c55e" : "transparent",
                      weight: matchedDonorIds.has(donor.id) ? 3 : 0,
                    }}
                  >
                    <Popup>
                      <div style={{ color: "#fff", background: "#18181b", padding: "10px 14px", borderRadius: "10px", minWidth: "160px" }}>
                        <strong style={{ fontSize: "14px" }}>{donor.name}</strong>
                        <br />
                        <span style={{ color: BLOOD_COLORS[donor.bloodType], fontWeight: "bold" }}>
                          {donor.bloodType}
                        </span>
                        {" • "}
                        <span style={{ color: "#a1a1aa" }}>{donor.city}</span>
                        <br />
                        <span style={{ color: donor.reliability >= 90 ? "#22c55e" : "#f59e0b" }}>
                          {donor.reliability}% reliability
                        </span>
                        <br />
                        <span style={{ color: donor.available ? "#22c55e" : "#ef4444" }}>
                          {donor.available ? "● Available" : "● Unavailable"}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {/* Emergency markers */}
                {L && mapData?.emergencies.map((em) => {
                  const isSelected = selectedEmergency === em.id;
                  const color = URGENCY_COLORS[em.urgency] || "#ef4444";
                  
                  const hospitalIcon = L.divIcon({
                    className: "hospital-marker",
                    html: `<div style="
                      background-color: #18181b;
                      border: 3px solid ${color};
                      width: 36px;
                      height: 36px;
                      border-radius: 10px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 20px;
                      box-shadow: 0 0 15px ${isSelected ? color : 'rgba(0,0,0,0.5)'};
                      transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                      transition: all 0.2s;
                      z-index: ${isSelected ? 1000 : 500};
                    ">🏥</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  });

                  return (
                    <MarkerComp
                      key={em.id}
                      position={[em.lat, em.lng]}
                      icon={hospitalIcon}
                      eventHandlers={{
                        click: () =>
                          setSelectedEmergency(
                            selectedEmergency === em.id ? null : em.id
                          ),
                      }}
                    >
                      <Popup>
                        <div style={{ color: "#fff", background: "#18181b", padding: "10px 14px", borderRadius: "10px", minWidth: "180px" }}>
                          <strong style={{ fontSize: "14px", color: URGENCY_COLORS[em.urgency] }}>
                            🏥 {em.hospital}
                          </strong>
                          <br />
                          <span style={{ color: "#a1a1aa" }}>{em.department}</span>
                          <br />
                          <span style={{ fontWeight: "bold" }}>
                            {em.requiredType} — {em.unitsNeeded} units
                          </span>
                          <br />
                          <span style={{ color: URGENCY_COLORS[em.urgency], fontWeight: "bold", fontSize: "12px" }}>
                            {em.urgency} Urgency
                          </span>
                          <br />
                          <button
                            style={{
                              marginTop: "6px",
                              padding: "4px 10px",
                              background: "#e11d48",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                            onClick={() =>
                              setSelectedEmergency(
                                selectedEmergency === em.id ? null : em.id
                              )
                            }
                          >
                            {selectedEmergency === em.id ? "Hide Matches" : "Show Matches"}
                          </button>
                        </div>
                      </Popup>
                    </MarkerComp>
                  );
                })}

                {/* Match lines: connect emergency to matched donors */}
                {selectedEmergencyData &&
                  matchedDonors.map((md) => {
                    const donorData = mapData?.donors.find((d) => d.id === md.id);
                    if (!donorData) return null;
                    return (
                      <Polyline
                        key={md.id}
                        positions={[
                          [selectedEmergencyData.lat, selectedEmergencyData.lng],
                          [donorData.lat, donorData.lng],
                        ]}
                        pathOptions={{
                          color: "#22c55e",
                          weight: 2,
                          opacity: 0.6,
                          dashArray: "8 4",
                        }}
                      />
                    );
                  })}
              </MapContainer>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="bg-panel border border-border rounded-xl p-4 flex flex-wrap items-center gap-6 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300">Legend:</span>
          {Object.entries(BLOOD_COLORS).map(([type, color]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
              {type}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-zinc-900 border-2 border-red-500 rounded flex items-center justify-center text-[10px]">🏥</div>
            Hospital / Emergency
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500/30"></span>
            Matched
          </span>
        </div>
      </main>
    </div>
  );
}

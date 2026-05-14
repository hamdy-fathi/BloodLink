"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { auditApi } from "@/lib/api";
import {
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  HeartPulse,
  Bell,
  LogIn,
  UserPlus,
  CheckCircle,
  ToggleRight,
  Filter,
  Search,
} from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  details: string;
  timestamp: string;
}

const ACTION_ICONS: Record<string, any> = {
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
  MATCH: HeartPulse,
  NOTIFY: Bell,
  LOGIN: LogIn,
  REGISTER: UserPlus,
  RESOLVE: CheckCircle,
  TOGGLE: ToggleRight,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  UPDATE: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  DELETE: "text-red-500 bg-red-500/10 border-red-500/20",
  MATCH: "text-brand bg-brand/10 border-brand/20",
  NOTIFY: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  LOGIN: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  REGISTER: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
  RESOLVE: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  TOGGLE: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
};

const ENTITY_LABELS: Record<string, string> = {
  donor: "Donor",
  inventory: "Inventory",
  emergency: "Emergency",
  notification: "Notification",
  user: "User",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ActivityPage() {
  const { currentUser } = useAppContext();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("All");
  const [filterEntity, setFilterEntity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") router.replace("/");
  }, [currentUser, router]);

  useEffect(() => {
    auditApi
      .getAll({ limit: "200" })
      .then((res) => setLogs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== "All" && log.action !== filterAction) return false;
      if (filterEntity !== "All" && log.entity !== filterEntity) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.details.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, filterAction, filterEntity, searchQuery]);

  if (currentUser && currentUser.role !== "admin") return null;

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity))];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-brand" />
            Activity Log
          </h1>
          <p className="text-zinc-400">
            Audit trail of all system actions performed by users.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by description, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-panel border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-panel border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
          >
            <option value="All">All Actions</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="bg-panel border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
          >
            <option value="All">All Modules</option>
            {uniqueEntities.map((e) => (
              <option key={e} value={e}>{ENTITY_LABELS[e] || e}</option>
            ))}
          </select>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="bg-panel border border-border rounded-lg px-3 py-1.5">
            <span className="font-semibold text-white">{filtered.length}</span> entries
          </span>
          <span className="bg-panel border border-border rounded-lg px-3 py-1.5">
            <span className="font-semibold text-white">{logs.length}</span> total
          </span>
        </div>

        {/* Activity List */}
        <div className="bg-panel border border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-zinc-500">Loading activity log...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <ScrollText className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
              <p>No activity entries found.</p>
              <p className="text-xs text-zinc-600 mt-1">Actions will appear here as users interact with the system.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((log) => {
                const IconComp = ACTION_ICONS[log.action] || ScrollText;
                const colorClass = ACTION_COLORS[log.action] || "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";

                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${colorClass}`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colorClass}`}>
                          {log.action}
                        </span>
                        <span className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-400">
                          {ENTITY_LABELS[log.entity] || log.entity}
                        </span>
                        <span className="text-xs text-zinc-500">
                          by <span className="text-zinc-300 font-medium">{log.userName}</span>
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 mt-1">{log.details}</p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-zinc-500 shrink-0 mt-1">
                      {timeAgo(log.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

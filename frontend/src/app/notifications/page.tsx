"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { useToast } from "@/components/Toast";
import { NotificationType } from "@/lib/types";
import {
  AlertCircle,
  Package,
  Heart,
  ArrowRightLeft,
  Settings,
  Check,
  X,
  CheckCheck,
  Trash2,
  Filter,
} from "lucide-react";

function notificationIcon(type: NotificationType) {
  const map: Record<NotificationType, { icon: React.ReactNode; bg: string }> = {
    emergency: { icon: <AlertCircle className="w-5 h-5 text-red-500" />, bg: "bg-red-500/10 border-red-500/20" },
    shortage: { icon: <Package className="w-5 h-5 text-amber-500" />, bg: "bg-amber-500/10 border-amber-500/20" },
    donation: { icon: <Heart className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-500/10 border-emerald-500/20" },
    transfer: { icon: <ArrowRightLeft className="w-5 h-5 text-blue-500" />, bg: "bg-blue-500/10 border-blue-500/20" },
    system: { icon: <Settings className="w-5 h-5 text-zinc-400" />, bg: "bg-zinc-500/10 border-zinc-500/20" },
  };
  return map[type];
}

const TYPE_LABELS: { value: string; label: string }[] = [
  { value: "All", label: "All Types" },
  { value: "emergency", label: "Emergency" },
  { value: "shortage", label: "Shortage" },
  { value: "donation", label: "Donation" },
  { value: "transfer", label: "Transfer" },
  { value: "system", label: "System" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    dismissNotification,
    clearAllNotifications,
  } = useAppContext();
  const { toast } = useToast();

  const [filterType, setFilterType] = useState("All");
  const [filterRead, setFilterRead] = useState<"All" | "Unread" | "Read">("All");

  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const filtered = notifications.filter((n) => {
    const matchType = filterType === "All" || n.type === filterType;
    const matchRead =
      filterRead === "All" ||
      (filterRead === "Unread" && !n.read) ||
      (filterRead === "Read" && n.read);
    return matchType && matchRead;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Notifications</h1>
            <p className="text-sm text-zinc-400">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => { markAllRead(); toast("success", "All Read", "All notifications marked as read."); }}
                className="px-3 py-2 rounded-lg bg-panel border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => { clearAllNotifications(); toast("success", "Cleared", "All notifications have been cleared."); }}
                className="px-3 py-2 rounded-lg bg-red-600/10 border border-red-500/30 text-red-500 text-sm font-medium hover:bg-red-600/20 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-panel border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
            >
              {TYPE_LABELS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value as "All" | "Unread" | "Read")}
            className="bg-panel border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
          >
            <option value="All">All Status</option>
            <option value="Unread">Unread Only</option>
            <option value="Read">Read Only</option>
          </select>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="bg-panel border border-border rounded-2xl p-16 text-center">
              <div className="text-4xl mb-3">🔔</div>
              <p className="text-zinc-400 text-sm">No notifications match your filters.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const { icon, bg } = notificationIcon(n.type);
              return (
                <div
                  key={n.id}
                  className={`bg-panel border rounded-xl p-5 flex gap-4 transition-all hover:shadow-lg ${
                    !n.read ? "border-brand/30 shadow-[0_0_10px_rgba(225,29,72,0.05)]" : "border-border"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${bg} border flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${!n.read ? "text-white" : "text-zinc-300"}`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{n.message}</p>
                    <span className="text-xs text-zinc-500 mt-2 block">{n.timestamp}</span>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => { markNotificationRead(n.id); toast("info", "Marked Read", n.title); }}
                        className="p-2 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => { dismissNotification(n.id); toast("info", "Dismissed", n.title); }}
                      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

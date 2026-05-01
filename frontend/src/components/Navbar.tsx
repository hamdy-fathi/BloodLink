"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import {
  Droplet,
  BellRing,
  LogOut,
  User,
  ChevronDown,
  AlertCircle,
  Package,
  Heart,
  ArrowRightLeft,
  Settings,
  X,
  Check,
  CheckCheck,
} from "lucide-react";
import { NotificationType } from "@/lib/types";

const allNavLinks = [
  { href: "/", label: "Dashboard", roles: ["admin", "staff", "manager", "donor"] },
  { href: "/inventory", label: "Inventory", roles: ["admin", "staff", "manager"] },
  { href: "/donors", label: "Donors", roles: ["admin", "staff", "manager"] },
  { href: "/emergencies", label: "Emergencies", roles: ["admin", "staff", "manager"] },
  { href: "/notifications", label: "My Requests", roles: ["donor"] },
];

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "emergency": return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "shortage": return <Package className="w-4 h-4 text-amber-500" />;
    case "donation": return <Heart className="w-4 h-4 text-emerald-500" />;
    case "transfer": return <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
    case "system": return <Settings className="w-4 h-4 text-zinc-400" />;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    logout,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllRead,
    dismissNotification,
  } = useAppContext();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    setShowProfileMenu(false);
    router.push("/login");
  }

  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-brand" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Blood<span className="text-brand">Link</span>
            </span>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
            <Droplet className="w-5 h-5 text-brand" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Blood<span className="text-brand">Link</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          {allNavLinks
            .filter((link) => link.roles.includes(currentUser?.role ?? "staff"))
            .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                pathname === link.href ? "text-foreground" : "hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="p-2 text-zinc-400 hover:text-foreground transition-colors relative"
            >
              <BellRing className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white px-1 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-panel border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-zinc-900/50">
                  <h3 className="text-sm font-bold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-brand hover:text-brand-hover transition-colors font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-zinc-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 transition-colors hover:bg-zinc-800/40 ${!n.read ? "bg-brand/5" : ""}`}
                      >
                        <div className="mt-0.5 shrink-0">{notificationIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium truncate ${!n.read ? "text-white" : "text-zinc-300"}`}>
                              {n.title}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              {!n.read && (
                                <button
                                  onClick={() => markNotificationRead(n.id)}
                                  className="text-zinc-500 hover:text-emerald-500 transition-colors p-0.5"
                                  title="Mark as read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => dismissNotification(n.id)}
                                className="text-zinc-500 hover:text-red-500 transition-colors p-0.5"
                                title="Dismiss"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-zinc-500 mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-border bg-zinc-900/50 text-center">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-medium text-brand hover:text-brand-hover transition-colors"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-800/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-panel border border-border flex items-center justify-center text-sm font-semibold text-zinc-300">
                {currentUser?.avatar}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-panel border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-white truncate">{currentUser?.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentUser?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-brand/10 text-brand border border-brand/20">
                    {currentUser?.role}
                  </span>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <BellRing className="w-4 h-4" /> Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-brand text-white px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

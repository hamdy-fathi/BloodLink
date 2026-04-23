"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Shield,
  Pencil,
  X,
  Save,
  LogOut,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, updateProfile, logout } = useAppContext();

  const [editing, setEditing] = useState(false);
  const [formName, setFormName] = useState(currentUser?.name || "");
  const [formEmail, setFormEmail] = useState(currentUser?.email || "");
  const [formPhone, setFormPhone] = useState(currentUser?.phone || "");
  const [formHospital, setFormHospital] = useState(currentUser?.hospital || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) router.push("/login");
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile({
      name: formName,
      email: formEmail,
      phone: formPhone,
      hospital: formHospital,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const roleBadgeColor: Record<string, string> = {
    admin: "bg-brand/10 text-brand border-brand/20",
    staff: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    manager: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    donor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          {!editing && (
            <button
              onClick={() => {
                setFormName(currentUser.name);
                setFormEmail(currentUser.email);
                setFormPhone(currentUser.phone);
                setFormHospital(currentUser.hospital);
                setEditing(true);
              }}
              className="px-4 py-2 rounded-lg bg-panel border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        {/* Saved toast */}
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-sm animate-in">
            <Save className="w-4 h-4" /> Profile updated successfully.
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-panel border border-border rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-28 bg-zinc-900 relative">
            <div className="absolute -bottom-10 left-6">
              <div className="w-20 h-20 rounded-full bg-background border-4 border-panel flex items-center justify-center text-2xl font-bold text-zinc-300 shadow-lg">
                {currentUser.avatar}
              </div>
            </div>
          </div>

          <div className="pt-14 pb-6 px-6">
            {!editing ? (
              <>
                {/* View Mode */}
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold uppercase rounded-full border ${
                      roleBadgeColor[currentUser.role] || roleBadgeColor.donor
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-6">{currentUser.hospital}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-border flex items-center justify-center">
                      <Mail className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block">Email</span>
                      <span className="text-zinc-200 font-medium">{currentUser.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-border flex items-center justify-center">
                      <Phone className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block">Phone</span>
                      <span className="text-zinc-200 font-medium">{currentUser.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-border flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block">Organization</span>
                      <span className="text-zinc-200 font-medium">{currentUser.hospital}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-border flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block">Member Since</span>
                      <span className="text-zinc-200 font-medium">{currentUser.joinedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-border flex items-center justify-center">
                      <Shield className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <span className="text-xs text-zinc-500 block">Role & Permissions</span>
                      <span className="text-zinc-200 font-medium capitalize">{currentUser.role} — Full Access</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode */}
                <form onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        required
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        required
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Organization</label>
                    <input
                      type="text"
                      value={formHospital}
                      onChange={(e) => setFormHospital(e.target.value)}
                      required
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors shadow-[0_0_15px_rgba(225,29,72,0.2)] flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-panel border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-500 mb-2">Danger Zone</h3>
          <p className="text-sm text-zinc-400 mb-4">Sign out of your account. You will need to log back in.</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/10 border border-red-500/30 text-red-500 rounded-lg text-sm font-medium hover:bg-red-600/20 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </main>
    </div>
  );
}

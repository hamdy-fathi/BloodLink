"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { usersApi } from "@/lib/api";
import { Donor } from "@/lib/types";
import { useToast } from "@/components/Toast";
import {
  Search,
  Plus,
  X,
  Pencil,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Heart,
  ToggleLeft,
  ToggleRight,
  KeyRound,
} from "lucide-react";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export default function DonorsPage() {
  const { donors, addDonor, updateDonor, deleteDonor, toggleDonorAvailability, currentUser } = useAppContext();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentUser?.role === "donor") router.replace("/");
  }, [currentUser, router]);

  if (currentUser?.role === "donor") return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterAvailability, setFilterAvailability] = useState<"All" | "Available" | "Unavailable">("All");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBloodType, setFormBloodType] = useState(BLOOD_TYPES[0]);
  const [formAge, setFormAge] = useState("");
  const [formCity, setFormCity] = useState("");
  const [createAccount, setCreateAccount] = useState(false);
  const [formPassword, setFormPassword] = useState("");

  // Actions
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Detail
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // ── Filtering ──
  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || d.bloodType === filterType;
      const matchesAvail =
        filterAvailability === "All" ||
        (filterAvailability === "Available" && d.available) ||
        (filterAvailability === "Unavailable" && !d.available);
      return matchesSearch && matchesType && matchesAvail;
    });
  }, [donors, searchQuery, filterType, filterAvailability]);

  // ── Stats ──
  const totalDonors = donors.length;
  const availableCount = donors.filter((d) => d.available).length;
  const eligibleCount = donors.filter((d) => d.eligible).length;

  // ── Modal ──
  function openAddModal() {
    setEditingDonor(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormBloodType(BLOOD_TYPES[0]);
    setFormAge("");
    setFormCity("");
    setCreateAccount(false);
    setFormPassword("");
    setShowModal(true);
  }

  function openEditModal(donor: Donor) {
    setEditingDonor(donor);
    setFormName(donor.name);
    setFormEmail(donor.email);
    setFormPhone(donor.phone);
    setFormBloodType(donor.bloodType);
    setFormAge(String(donor.age));
    setFormCity(donor.city);
    setShowModal(true);
    setOpenActionId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 10);

    try {
      if (editingDonor) {
        await updateDonor(editingDonor.id, {
          name: formName,
          email: formEmail,
          phone: formPhone,
          bloodType: formBloodType,
          age: parseInt(formAge) || 0,
          city: formCity,
        });
        toast("success", "Donor Updated", `${formName}'s information has been updated.`);
      } else {
        // Create donor record
        await addDonor({
          name: formName,
          email: formEmail,
          phone: formPhone,
          bloodType: formBloodType,
          age: parseInt(formAge) || 0,
          city: formCity,
          lastDonation: now,
          totalDonations: 0,
          reliability: 50,
          available: true,
          eligible: true,
        });

        // Also create user account if toggled
        if (createAccount && formPassword) {
          try {
            await usersApi.create({
              name: formName,
              email: formEmail,
              phone: formPhone,
              password: formPassword,
              role: "donor",
            });
            toast("success", "Donor Registered + Account Created", `${formName} (${formBloodType}) has been added with a login account.`);
          } catch {
            toast("info", "Donor Added, Account Failed", `${formName} was registered but the user account could not be created (email may already exist).`);
          }
        } else {
          toast("success", "Donor Registered", `${formName} (${formBloodType}) has been added.`);
        }
      }
      setShowModal(false);
    } catch {
      toast("error", "Operation Failed", "Could not save donor. Please try again.");
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setOpenActionId(null);
  }

  async function handleDelete() {
    if (deletingId) {
      const donor = donors.find((d) => d.id === deletingId);
      try {
        await deleteDonor(deletingId);
        toast("success", "Donor Removed", `${donor?.name ?? "Donor"} has been removed.`);
        if (selectedDonor?.id === deletingId) setSelectedDonor(null);
      } catch {
        toast("error", "Delete Failed", "Could not remove the donor.");
      }
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Donor Management</h1>
            <p className="text-zinc-400">View, manage, and contact registered blood donors.</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-brand-hover transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Register Donor
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Total Donors</span>
            <span className="text-2xl font-bold">{totalDonors}</span>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Available Now</span>
            <span className="text-2xl font-bold text-emerald-500">{availableCount}</span>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Eligible to Donate</span>
            <span className="text-2xl font-bold text-blue-500">{eligibleCount}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Donor List */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search donors by name, email, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-panel border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-panel border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
              >
                <option value="All">All Types</option>
                {BLOOD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as "All" | "Available" | "Unavailable")}
                className="bg-panel border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            {/* Donor Cards */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-panel border border-border rounded-xl p-12 text-center text-zinc-500">No donors found.</div>
              ) : (
                filtered.map((donor) => (
                  <div
                    key={donor.id}
                    onClick={() => setSelectedDonor(donor)}
                    className={`bg-panel border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                      selectedDonor?.id === donor.id
                        ? "border-brand/50 shadow-[0_0_15px_rgba(225,29,72,0.1)]"
                        : "border-border hover:border-zinc-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-zinc-800 border border-border flex items-center justify-center font-bold text-sm text-zinc-300 shrink-0">
                          {donor.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{donor.name}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {donor.city}</span>
                            <span>•</span>
                            <span className="font-medium">{donor.bloodType}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                          donor.available
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-zinc-700/50 text-zinc-400 border border-zinc-600"
                        }`}>
                          {donor.available ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {donor.available ? "Available" : "Unavailable"}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenActionId(openActionId === donor.id ? null : donor.id); }}
                            className="text-zinc-400 hover:text-white transition-colors p-1"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {openActionId === donor.id && (
                            <div className="absolute right-0 top-8 w-44 bg-panel border border-border rounded-lg shadow-xl z-20" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => openEditModal(donor)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors rounded-t-lg"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </button>
                              <button
                                onClick={async () => { try { await toggleDonorAvailability(donor.id); toast("success", "Status Updated", `${donor.name} is now ${donor.available ? "unavailable" : "available"}.`); } catch { toast("error", "Update Failed", "Could not update donor status."); } setOpenActionId(null); }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                              >
                                {donor.available ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                                {donor.available ? "Set Unavailable" : "Set Available"}
                              </button>
                              <button
                                onClick={() => confirmDelete(donor.id)}
                                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-800 transition-colors rounded-b-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Donor Detail Panel */}
          <div className="w-full lg:w-96 shrink-0">
            {selectedDonor ? (
              <div className="bg-panel border border-border rounded-2xl p-6 sticky top-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 border border-border flex items-center justify-center font-bold text-lg text-zinc-300">
                    {selectedDonor.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedDonor.name}</h2>
                    <span className={`text-xs font-semibold ${selectedDonor.available ? "text-emerald-500" : "text-zinc-400"}`}>
                      {selectedDonor.available ? "● Available" : "● Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Mail className="w-4 h-4 text-zinc-500" />
                    {selectedDonor.email}
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Phone className="w-4 h-4 text-zinc-500" />
                    {selectedDonor.phone}
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    {selectedDonor.city}
                  </div>
                </div>

                <div className="h-px bg-border my-5"></div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-background border border-border rounded-lg p-3">
                    <span className="text-xs text-zinc-400 block mb-1">Blood Type</span>
                    <span className="text-lg font-bold text-brand">{selectedDonor.bloodType}</span>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-3">
                    <span className="text-xs text-zinc-400 block mb-1">Age</span>
                    <span className="text-lg font-bold">{selectedDonor.age}</span>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-3">
                    <span className="text-xs text-zinc-400 block mb-1">Total Donations</span>
                    <span className="text-lg font-bold flex items-center gap-1">
                      <Heart className="w-4 h-4 text-brand" /> {selectedDonor.totalDonations}
                    </span>
                  </div>
                  <div className="bg-background border border-border rounded-lg p-3">
                    <span className="text-xs text-zinc-400 block mb-1">Reliability</span>
                    <span className={`text-lg font-bold ${selectedDonor.reliability >= 90 ? "text-emerald-500" : selectedDonor.reliability >= 70 ? "text-amber-500" : "text-red-500"}`}>
                      {selectedDonor.reliability}%
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border my-5"></div>

                <div className="text-sm">
                  <span className="text-xs text-zinc-400">Last Donation</span>
                  <p className="text-zinc-300 font-medium">{selectedDonor.lastDonation}</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={async () => { try { await toggleDonorAvailability(selectedDonor.id); toast("success", "Status Updated", `${selectedDonor.name} is now ${selectedDonor.available ? "unavailable" : "available"}.`); } catch { toast("error", "Update Failed", "Could not update donor status."); } }}
                    className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {selectedDonor.available ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                    Toggle Status
                  </button>
                  <button
                    onClick={() => openEditModal(selectedDonor)}
                    className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors"
                  >
                    Edit Donor
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-panel border border-border rounded-2xl p-8 text-center text-zinc-500 sticky top-24">
                <UserCheck className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
                <p className="text-sm">Select a donor to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-panel border border-border rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingDonor ? "Edit Donor" : "Register New Donor"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Full Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                  <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Phone</label>
                  <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="+1-555-0100" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Blood Type</label>
                  <select value={formBloodType} onChange={(e) => setFormBloodType(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand">
                    {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Age</label>
                  <input type="number" min="18" max="65" value={formAge} onChange={(e) => setFormAge(e.target.value)} required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">City</label>
                  <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} required
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" placeholder="Downtown" />
                </div>
              </div>
              {/* Create Account Toggle (only for new donors) */}
              {!editingDonor && (
                <div className="border border-zinc-700 rounded-lg p-4 bg-zinc-900/30">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <KeyRound className="w-4 h-4 text-brand" />
                      Create Login Account
                    </span>
                    <button
                      type="button"
                      onClick={() => setCreateAccount(!createAccount)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        createAccount ? "bg-brand" : "bg-zinc-700"
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        createAccount ? "translate-x-5" : ""
                      }`} />
                    </button>
                  </label>
                  {createAccount && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Password (min 6 characters)</label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        required={createAccount}
                        minLength={6}
                        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                        placeholder="••••••••"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1">Donor will use their email + this password to log in.</p>
                    </div>
                  )}
                </div>
              )}

              <button type="submit"
                className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors shadow-[0_0_15px_rgba(225,29,72,0.2)] mt-2">
                {editingDonor ? "Save Changes" : createAccount ? "Register Donor & Create Account" : "Register Donor"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}>
          <div className="bg-panel border border-border rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Remove Donor</h2>
            <p className="text-sm text-zinc-400 mb-6">Are you sure you want to remove this donor from the system?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

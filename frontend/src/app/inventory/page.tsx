"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/lib/context";
import { BloodInventoryItem } from "@/lib/types";
import { useToast } from "@/components/Toast";
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  AlertTriangle,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const STATUS_OPTIONS: BloodInventoryItem["status"][] = ["Healthy", "Warning", "Critical"];

function getStatusFromUnits(units: number): BloodInventoryItem["status"] {
  if (units <= 30) return "Critical";
  if (units <= 80) return "Warning";
  return "Healthy";
}

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppContext();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BloodInventoryItem | null>(null);
  const [formType, setFormType] = useState(BLOOD_TYPES[0]);
  const [formUnits, setFormUnits] = useState("");
  const [formExpiring, setFormExpiring] = useState("0");

  // Actions dropdown
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Confirm delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Filtering ──
  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  // ── Stats ──
  const totalUnits = inventory.reduce((acc, i) => acc + i.units, 0);
  const criticalCount = inventory.filter((i) => i.status === "Critical").length;
  const expiringCount = inventory.reduce((acc, i) => acc + i.expiringIn48h, 0);

  // ── Modal Controls ──
  function openAddModal() {
    setEditingItem(null);
    setFormType(BLOOD_TYPES[0]);
    setFormUnits("");
    setFormExpiring("0");
    setShowModal(true);
  }

  function openEditModal(item: BloodInventoryItem) {
    setEditingItem(item);
    setFormType(item.type);
    setFormUnits(String(item.units));
    setFormExpiring(String(item.expiringIn48h));
    setShowModal(true);
    setOpenActionId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const units = parseInt(formUnits) || 0;
    const expiring = parseInt(formExpiring) || 0;

    try {
      if (editingItem) {
        await updateInventoryItem(editingItem.id, {
          type: formType,
          units,
          expiringIn48h: expiring,
        });
        toast("success", "Inventory Updated", `${formType} updated to ${units} units.`);
      } else {
        await addInventoryItem({
          type: formType,
          units,
          trend: "+0%",
          expiringIn48h: expiring,
        } as any);
        toast("success", "Blood Units Added", `${units} units of ${formType} added to inventory.`);
      }
      setShowModal(false);
    } catch {
      toast("error", "Failed", "Could not save inventory item. Please try again.");
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setOpenActionId(null);
  }

  async function handleDelete() {
    if (deletingId) {
      const item = inventory.find((i) => i.id === deletingId);
      try {
        await deleteInventoryItem(deletingId);
        toast("success", "Item Removed", `${item?.type ?? "Blood type"} removed from inventory.`);
      } catch {
        toast("error", "Delete Failed", "Could not remove the item.");
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
            <h1 className="text-3xl font-bold tracking-tight mb-2">Blood Inventory</h1>
            <p className="text-zinc-400">Monitor real-time stock levels, expiration dates, and distribution.</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium shadow-[0_0_15px_rgba(225,29,72,0.3)] hover:bg-brand-hover transition-colors flex items-center gap-2 w-fit"
          >
            <Plus className="w-4 h-4" />
            Add Blood Units
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Network Supply</span>
            <span className="text-2xl font-bold">{totalUnits.toLocaleString()} <span className="text-sm text-zinc-500 font-normal">Units</span></span>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((totalUnits / 2000) * 100, 100)}%` }}></div>
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
            <span className="text-sm font-medium text-zinc-400">Critical Shortages</span>
            <span className="text-2xl font-bold text-red-500">{criticalCount} <span className="text-sm text-zinc-500 font-normal">Blood Types</span></span>
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-400">Expiring in 48h</span>
            <span className="text-2xl font-bold text-amber-500">{expiringCount} <span className="text-sm text-zinc-500 font-normal">Units</span></span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-panel border border-border rounded-2xl overflow-hidden flex flex-col">
          {/* Controls */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/50">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search blood type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors text-white"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {statusFilter === "All" ? "All Status" : statusFilter}
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-panel border border-border rounded-lg shadow-xl z-20">
                  {["All", ...STATUS_OPTIONS].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setStatusFilter(opt); setShowFilterMenu(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 transition-colors first:rounded-t-lg last:rounded-b-lg ${statusFilter === opt ? "text-brand font-semibold" : "text-zinc-300"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table Body */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Blood Type</th>
                  <th className="px-6 py-4 font-medium">Available Units</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">7-Day Trend</th>
                  <th className="px-6 py-4 font-medium">Expiring (48h)</th>
                  <th className="px-6 py-4 font-medium">Last Updated</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No inventory records found.</td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${item.critical ? "bg-red-500/20 text-red-500 border border-red-500/30" : "bg-zinc-800 text-zinc-300 border border-border"}`}>
                          {item.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-lg">{item.units}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1 ${
                          item.status === "Healthy" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                          item.status === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {item.critical && <AlertTriangle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${item.trend.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}>
                          {item.trend.startsWith("+") ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          <span className="font-medium">{item.trend}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{item.expiringIn48h}</td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">{item.lastUpdated}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setOpenActionId(openActionId === item.id ? null : item.id)}
                          className="text-zinc-400 hover:text-white transition-colors p-2"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openActionId === item.id && (
                          <div className="absolute right-6 top-12 w-36 bg-panel border border-border rounded-lg shadow-xl z-20">
                            <button
                              onClick={() => openEditModal(item)}
                              className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors rounded-t-lg"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(item.id)}
                              className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-zinc-800 transition-colors rounded-b-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
            <h2 className="text-xl font-bold mb-6">{editingItem ? "Edit Blood Units" : "Add Blood Units"}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Blood Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                >
                  {BLOOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Units Available</label>
                <input
                  type="number"
                  min="0"
                  value={formUnits}
                  onChange={(e) => setFormUnits(e.target.value)}
                  required
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="e.g. 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Expiring in 48h</label>
                <input
                  type="number"
                  min="0"
                  value={formExpiring}
                  onChange={(e) => setFormExpiring(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
                  placeholder="0"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors shadow-[0_0_15px_rgba(225,29,72,0.2)]"
              >
                {editingItem ? "Save Changes" : "Add to Inventory"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeletingId(null)}>
          <div className="bg-panel border border-border rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Confirm Deletion</h2>
            <p className="text-sm text-zinc-400 mb-6">Are you sure you want to remove this blood type from the inventory? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2 border border-border rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

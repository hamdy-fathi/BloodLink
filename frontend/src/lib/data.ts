import { BloodInventoryItem, Donor, User, AppNotification } from "./types";

// ── Mock users for login ──
export const mockUsers: { email: string; password: string; user: User }[] = [
  {
    email: "admin@bloodlink.org",
    password: "admin123",
    user: {
      id: "u-1",
      name: "Dr. Ahmed Fathi",
      email: "admin@bloodlink.org",
      phone: "+20-100-900-1001",
      role: "admin",
      avatar: "AF",
      hospital: "National Blood Bank of Egypt",
      joinedAt: "2024-01-15",
    },
  },
  {
    email: "staff@qasr.org",
    password: "staff123",
    user: {
      id: "u-2",
      name: "Nurse Salma Nour",
      email: "staff@qasr.org",
      phone: "+20-112-300-2002",
      role: "staff",
      avatar: "SN",
      hospital: "Qasr Al-Ainy Hospital",
      joinedAt: "2025-03-10",
    },
  },
  {
    email: "manager@dar-elfouad.org",
    password: "manager123",
    user: {
      id: "u-3",
      name: "Dr. Hana Mostafa",
      email: "manager@dar-elfouad.org",
      phone: "+20-128-500-3003",
      role: "manager",
      avatar: "HM",
      hospital: "Dar El Fouad Hospital",
      joinedAt: "2024-08-22",
    },
  },
];

// ── Mock notifications ──
export const initialNotifications: AppNotification[] = [
  { id: "n-1", type: "emergency", title: "Emergency: O- Needed", message: "Trauma Unit at Qasr Al-Ainy Hospital requires 6 units of O- immediately.", timestamp: "2026-04-05 20:45", read: false, response: "pending" },
  { id: "n-2", type: "shortage", title: "AB- Critical Shortage", message: "AB- stock is below 10% safety threshold across all Cairo facilities.", timestamp: "2026-04-05 19:30", read: false, response: "pending" },
  { id: "n-3", type: "donation", title: "Donation Completed", message: "Mohamed Tarek completed a successful O- donation at Nasr City Blood Center.", timestamp: "2026-04-05 18:15", read: false, response: "pending" },
  { id: "n-4", type: "transfer", title: "Transfer Dispatched", message: "12 units of AB- dispatched to Ain Shams Specialized Hospital. ETA 15 min.", timestamp: "2026-04-05 17:00", read: true, response: "pending" },
  { id: "n-5", type: "system", title: "System Maintenance", message: "Scheduled maintenance window tonight 02:00–04:00 (Cairo Time).", timestamp: "2026-04-05 14:00", read: true, response: "pending" },
  { id: "n-6", type: "shortage", title: "B- Warning Level", message: "B- inventory dropped to warning level (30 units) at Alexandria Regional Bank.", timestamp: "2026-04-05 12:30", read: true, response: "pending" },
  { id: "n-7", type: "donation", title: "New Donor Registered", message: "Aya Hesham registered as a B- donor in Zamalek, Cairo.", timestamp: "2026-04-04 16:45", read: true, response: "pending" },
];

export const initialInventory: BloodInventoryItem[] = [
  { id: "inv-1", type: "O+", units: 420, status: "Healthy", trend: "+5%", critical: false, expiringIn48h: 12, lastUpdated: "2026-04-05 18:30" },
  { id: "inv-2", type: "O-", units: 85, status: "Critical", trend: "-12%", critical: true, expiringIn48h: 3, lastUpdated: "2026-04-05 17:45" },
  { id: "inv-3", type: "A+", units: 310, status: "Healthy", trend: "+2%", critical: false, expiringIn48h: 8, lastUpdated: "2026-04-05 19:00" },
  { id: "inv-4", type: "A-", units: 45, status: "Warning", trend: "-8%", critical: false, expiringIn48h: 2, lastUpdated: "2026-04-05 16:10" },
  { id: "inv-5", type: "B+", units: 190, status: "Healthy", trend: "+1%", critical: false, expiringIn48h: 5, lastUpdated: "2026-04-05 18:00" },
  { id: "inv-6", type: "B-", units: 30, status: "Warning", trend: "-4%", critical: false, expiringIn48h: 1, lastUpdated: "2026-04-05 15:30" },
  { id: "inv-7", type: "AB+", units: 120, status: "Healthy", trend: "+8%", critical: false, expiringIn48h: 4, lastUpdated: "2026-04-05 19:15" },
  { id: "inv-8", type: "AB-", units: 15, status: "Critical", trend: "-20%", critical: true, expiringIn48h: 0, lastUpdated: "2026-04-05 14:00" },
];

export const initialDonors: Donor[] = [
  { id: "d-1", name: "Mohamed Tarek", email: "mtarek@mail.com", phone: "+20-100-555-0101", bloodType: "O-", age: 32, lastDonation: "2026-03-10", totalDonations: 14, reliability: 98, available: true, city: "Nasr City", eligible: true },
  { id: "d-2", name: "Sara El-Sayed", email: "sara.elsayed@mail.com", phone: "+20-112-555-0102", bloodType: "A+", age: 28, lastDonation: "2026-02-22", totalDonations: 8, reliability: 95, available: true, city: "Zamalek", eligible: true },
  { id: "d-3", name: "Youssef Kamal", email: "ykamal@mail.com", phone: "+20-128-555-0103", bloodType: "O+", age: 41, lastDonation: "2026-01-15", totalDonations: 22, reliability: 82, available: false, city: "Heliopolis", eligible: true },
  { id: "d-4", name: "Nour Hassan", email: "nhassan@mail.com", phone: "+20-100-555-0104", bloodType: "B+", age: 35, lastDonation: "2026-03-28", totalDonations: 5, reliability: 90, available: true, city: "Maadi", eligible: false },
  { id: "d-5", name: "Omar Abdelrahman", email: "omar.a@mail.com", phone: "+20-112-555-0105", bloodType: "AB-", age: 50, lastDonation: "2025-12-01", totalDonations: 30, reliability: 99, available: true, city: "Dokki", eligible: true },
  { id: "d-6", name: "Laila Mahmoud", email: "lmahmoud@mail.com", phone: "+20-128-555-0106", bloodType: "A-", age: 26, lastDonation: "2026-03-05", totalDonations: 3, reliability: 75, available: true, city: "6th of October City", eligible: true },
  { id: "d-7", name: "Ahmed Mostafa", email: "a.mostafa@mail.com", phone: "+20-100-555-0107", bloodType: "O+", age: 38, lastDonation: "2026-02-14", totalDonations: 18, reliability: 88, available: false, city: "Mohandessin", eligible: true },
  { id: "d-8", name: "Aya Hesham", email: "ayah@mail.com", phone: "+20-112-555-0108", bloodType: "B-", age: 29, lastDonation: "2026-03-20", totalDonations: 7, reliability: 92, available: true, city: "New Cairo", eligible: true },
];

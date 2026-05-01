export interface BloodInventoryItem {
  id: string;
  type: string;
  units: number;
  status: "Healthy" | "Warning" | "Critical";
  trend: string;
  critical: boolean;
  expiringIn48h: number;
  lastUpdated: string;
}

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  age: number;
  lastDonation: string;
  totalDonations: number;
  reliability: number;
  available: boolean;
  city: string;
  eligible: boolean;
}

export type UserRole = "admin" | "staff" | "manager" | "donor";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string; // initials
  hospital: string;
  joinedAt: string;
}

export type NotificationType = "emergency" | "shortage" | "donation" | "system" | "transfer";

export type DonorResponse = "pending" | "accepted" | "refused";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  response: DonorResponse;
}

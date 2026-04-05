"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { BloodInventoryItem, Donor, User, AppNotification } from "./types";
import { initialInventory, initialDonors, initialNotifications, mockUsers } from "./data";

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => string | null; // returns error or null
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Inventory
  inventory: BloodInventoryItem[];
  addInventoryItem: (item: Omit<BloodInventoryItem, "id">) => void;
  updateInventoryItem: (id: string, item: Partial<BloodInventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Donors
  donors: Donor[];
  addDonor: (donor: Omit<Donor, "id">) => void;
  updateDonor: (id: string, donor: Partial<Donor>) => void;
  deleteDonor: (id: string) => void;
  toggleDonorAvailability: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

let nextInvId = 9;
let nextDonorId = 9;

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0].user); // auto-login as admin for dev
  const isAuthenticated = currentUser !== null;

  const login = useCallback((email: string, password: string): string | null => {
    const match = mockUsers.find((u) => u.email === email && u.password === password);
    if (!match) return "Invalid email or password.";
    setCurrentUser(match.user);
    return null;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Inventory
  const [inventory, setInventory] = useState<BloodInventoryItem[]>(initialInventory);
  const [donors, setDonors] = useState<Donor[]>(initialDonors);

  const addInventoryItem = useCallback((item: Omit<BloodInventoryItem, "id">) => {
    setInventory((prev) => [...prev, { ...item, id: `inv-${nextInvId++}` }]);
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<BloodInventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Donors
  const addDonor = useCallback((donor: Omit<Donor, "id">) => {
    setDonors((prev) => [...prev, { ...donor, id: `d-${nextDonorId++}` }]);
  }, []);

  const updateDonor = useCallback((id: string, updates: Partial<Donor>) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const deleteDonor = useCallback((id: string) => {
    setDonors((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const toggleDonorAvailability = useCallback((id: string) => {
    setDonors((prev) => prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllRead,
        dismissNotification,
        clearAllNotifications,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        donors,
        addDonor,
        updateDonor,
        deleteDonor,
        toggleDonorAvailability,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}

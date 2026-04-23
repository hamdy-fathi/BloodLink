"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { BloodInventoryItem, Donor, User, AppNotification } from "./types";
import {
  authApi,
  usersApi,
  donorsApi,
  inventoryApi,
  notificationsApi,
} from "./api";

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;

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

  // Loading
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = currentUser !== null;

  // Data
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Boot: restore session from stored token ──
  useEffect(() => {
    const token = localStorage.getItem("bloodlink_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then((res) => {
        setCurrentUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("bloodlink_token");
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch data when authenticated ──
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAll = async () => {
      try {
        const [invRes, donorRes, notifRes] = await Promise.all([
          inventoryApi.getAll(),
          donorsApi.getAll(),
          notificationsApi.getAll(),
        ]);
        setInventory(
          invRes.data.map((item: any) => ({
            ...item,
            lastUpdated:
              typeof item.lastUpdated === "string"
                ? item.lastUpdated
                : new Date(item.lastUpdated).toISOString().slice(0, 16).replace("T", " "),
          }))
        );
        setDonors(donorRes.data);
        setNotifications(
          notifRes.data.map((n: any) => ({
            ...n,
            timestamp:
              typeof n.timestamp === "string"
                ? n.timestamp
                : new Date(n.timestamp).toISOString().slice(0, 16).replace("T", " "),
          }))
        );
      } catch {
        // silently fail for now
      }
    };

    fetchAll();
  }, [isAuthenticated]);

  // ── Auth ──
  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const res = await authApi.login(email, password);
        localStorage.setItem("bloodlink_token", res.data.access_token);
        setCurrentUser(res.data.user);
        return null;
      } catch (err: any) {
        return err?.response?.data?.message || "Invalid email or password.";
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("bloodlink_token");
    setCurrentUser(null);
    setNotifications([]);
    setInventory([]);
    setDonors([]);
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;
      try {
        const res = await usersApi.update(currentUser.id, updates as Record<string, unknown>);
        setCurrentUser(res.data);
      } catch {
        // silently fail
      }
    },
    [currentUser]
  );

  // ── Notifications ──
  const markNotificationRead = useCallback((id: string) => {
    notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    notificationsApi.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    notificationsApi.dismiss(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    notificationsApi.clearAll().catch(() => {});
    setNotifications([]);
  }, []);

  // ── Inventory ──
  const addInventoryItem = useCallback(
    async (item: Omit<BloodInventoryItem, "id">) => {
      const res = await inventoryApi.create(item as Record<string, unknown>);
      const newItem = res.data;
      newItem.lastUpdated =
        typeof newItem.lastUpdated === "string"
          ? newItem.lastUpdated
          : new Date(newItem.lastUpdated).toISOString().slice(0, 16).replace("T", " ");
      setInventory((prev) => [...prev, newItem]);
    },
    []
  );

  const updateInventoryItem = useCallback(
    async (id: string, updates: Partial<BloodInventoryItem>) => {
      const res = await inventoryApi.update(id, updates as Record<string, unknown>);
      const updated = res.data;
      updated.lastUpdated =
        typeof updated.lastUpdated === "string"
          ? updated.lastUpdated
          : new Date(updated.lastUpdated).toISOString().slice(0, 16).replace("T", " ");
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    },
    []
  );

  const deleteInventoryItem = useCallback(async (id: string) => {
    await inventoryApi.remove(id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // ── Donors ──
  const addDonor = useCallback(
    async (donor: Omit<Donor, "id">) => {
      try {
        const res = await donorsApi.create(donor as Record<string, unknown>);
        setDonors((prev) => [...prev, res.data]);
      } catch {
        // silently fail
      }
    },
    []
  );

  const updateDonor = useCallback(
    async (id: string, updates: Partial<Donor>) => {
      try {
        const res = await donorsApi.update(id, updates as Record<string, unknown>);
        setDonors((prev) =>
          prev.map((d) => (d.id === id ? res.data : d))
        );
      } catch {
        // silently fail
      }
    },
    []
  );

  const deleteDonor = useCallback(async (id: string) => {
    try {
      await donorsApi.remove(id);
      setDonors((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // silently fail
    }
  }, []);

  const toggleDonorAvailability = useCallback(async (id: string) => {
    try {
      const res = await donorsApi.toggleAvailability(id);
      setDonors((prev) =>
        prev.map((d) => (d.id === id ? res.data : d))
      );
    } catch {
      // silently fail
    }
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
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within an AppProvider");
  return context;
}

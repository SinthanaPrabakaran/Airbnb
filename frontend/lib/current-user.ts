"use client";

import { User } from "@/types";

// User 4 is the primary guest seeded with saved favorites & trips
export const CURRENT_USER_ID = 4;
// User 1 is the primary host (Elena Rostova)
export const CURRENT_HOST_ID = 1;

export const DEFAULT_CURRENT_USER: User = {
  id: 4,
  name: "Alex Morgan",
  email: "alex.morgan@airbnb-clone.local",
  role: "guest",
  avatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
};

export const DEFAULT_CURRENT_HOST: User = {
  id: 1,
  name: "Elena Rostova",
  email: "elena.rostova@airbnb-clone.local",
  role: "host",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
};

const USER_STORAGE_KEY = "stayhub_current_user_id";
const HOST_STORAGE_KEY = "stayhub_current_host_id";

export function getCurrentUserId(): number {
  if (typeof window === "undefined") return CURRENT_USER_ID;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    // If parsed is a valid guest user (or any valid seeded user 1-6)
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
      // If it's a host id (1, 2, 3) stored by accident as a guest, default to CURRENT_USER_ID (4)
      if (parsed <= 3) return CURRENT_USER_ID;
      return parsed;
    }
  }
  return CURRENT_USER_ID;
}

export function setCurrentUserId(userId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, String(userId));
}

export function getCurrentHostId(): number {
  if (typeof window === "undefined") return CURRENT_HOST_ID;
  const stored = localStorage.getItem(HOST_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 3) return parsed;
  }
  return CURRENT_HOST_ID;
}

export function setCurrentHostId(hostId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOST_STORAGE_KEY, String(hostId));
}

"use client";

import { User } from "@/types";

export const CURRENT_USER_ID = 1;
export const CURRENT_HOST_ID = 1;

export const DEFAULT_CURRENT_USER: User = {
  id: 1,
  name: "Sarah Jenkins",
  email: "sarah.j@example.com",
  role: "guest",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
};

export const DEFAULT_CURRENT_HOST: User = {
  id: 1,
  name: "Elena Rostova",
  email: "elena@example.com",
  role: "host",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
};

const USER_STORAGE_KEY = "stayhub_current_user_id";
const HOST_STORAGE_KEY = "stayhub_current_host_id";

export function getCurrentUserId(): number {
  if (typeof window === "undefined") return CURRENT_USER_ID;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (stored) {
    const parsed = parseInt(stored, 10);
    if (!isNaN(parsed)) return parsed;
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
    if (!isNaN(parsed)) return parsed;
  }
  return CURRENT_HOST_ID;
}

export function setCurrentHostId(hostId: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HOST_STORAGE_KEY, String(hostId));
}

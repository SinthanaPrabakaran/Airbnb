"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Heart,
  Home,
  Check,
  Search,
  SlidersHorizontal,
  Compass,
  HelpCircle,
  LogOut,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { User } from "@/types";
import { HelpModal } from "./HelpModal";
import { DEFAULT_CURRENT_USER, setCurrentUserId } from "@/lib/current-user";
import { useToast } from "./ui/toast";

interface HeaderProps {
  currentUser: User | null;
  users: User[];
  onSelectUser: (user: User) => void;
  favoritesCount: number;
  onOpenFavorites?: () => void;
  onOpenFilters?: () => void;
  filterCount?: number;
  onSearchClick?: () => void;
  searchSummary?: string;
}

export function Header({
  currentUser,
  users,
  onSelectUser,
  favoritesCount,
  onOpenFavorites,
  onOpenFilters,
  filterCount = 0,
  onSearchClick,
  searchSummary = "Anywhere · Any week · Add guests",
}: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutReset = () => {
    setCurrentUserId(DEFAULT_CURRENT_USER.id);
    onSelectUser(DEFAULT_CURRENT_USER);
    setIsMenuOpen(false);
    showToast(`Logged out. Active account reset to ${DEFAULT_CURRENT_USER.name} (Guest)`, "info");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* 1. Logo Treatment */}
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform active:scale-95"
              aria-label="Stayhub Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#E00B41] to-[#FF385C] text-white shadow-sm shadow-[#FF385C]/30 transition-transform group-hover:scale-105">
                <svg
                  viewBox="0 0 32 32"
                  className="h-6 w-6 fill-current"
                  aria-hidden="true"
                >
                  <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 4.12 8.423 5.485 12.015 1.157 3.045 1.731 5.419 1.731 7.191 0 4.159-2.99 7.5-7.5 7.5-3.052 0-5.467-1.442-7-3.92-1.533 2.478-3.948 3.92-7 3.92-4.51 0-7.5-3.341-7.5-7.5 0-1.772.574-4.146 1.731-7.191 1.365-3.592 3.531-8.185 5.485-12.015l.533-1.025C8.037 1.963 9.492 1 11.5 1c1.583 0 3.01.65 4.5 2.138C17.49 1.65 18.917 1 20.5 1H16zm0 4.887c-.896 0-1.758.552-2.529 1.838l-.488.941c-1.93 3.774-4.084 8.337-5.433 11.899C6.467 23.018 6 25.105 6 26.5c0 2.485 1.791 4.5 4.5 4.5 2.502 0 4.398-1.579 5.5-4.5h.001c1.102 2.921 2.998 4.5 5.5 4.5 2.709 0 4.5-2.015 4.5-4.5 0-1.395-.467-3.482-1.55-5.822-1.349-3.562-3.503-8.125-5.433-11.899l-.488-.941C17.758 6.439 16.896 5.887 16 5.887zm0 12.113c1.657 0 3 1.343 3 3 0 1.977-1.791 3.5-3 4.5-1.209-1-3-2.523-3-4.5 0-1.657 1.343-3 3-3z" />
                </svg>
              </div>
              <span className="hidden text-xl font-black tracking-tight text-[#FF385C] sm:inline-block">
                stayhub
              </span>
            </Link>

            {/* 2. Compact Search Bar Pill (Desktop / Tablet) */}
            <div className="hidden md:flex items-center">
              <button
                onClick={onSearchClick}
                type="button"
                className="flex items-center divide-x divide-neutral-200 rounded-full border border-neutral-300 bg-white py-2 pl-5 pr-2 text-sm font-semibold text-neutral-800 shadow-xs transition hover:shadow-md hover:border-neutral-400 active:scale-98"
                aria-label="Search places"
              >
                <span className="pr-4 text-neutral-900 font-medium truncate max-w-[120px]">
                  {searchSummary.split("·")[0]?.trim() || "Anywhere"}
                </span>
                <span className="px-4 text-neutral-900 font-medium truncate max-w-[120px]">
                  {searchSummary.split("·")[1]?.trim() || "Any week"}
                </span>
                <span className="pl-4 pr-3 text-neutral-500 font-normal truncate max-w-[100px]">
                  {searchSummary.split("·")[2]?.trim() || "Add guests"}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF385C] text-white transition hover:bg-[#E00B41] shrink-0">
                  <Search className="h-4 w-4" />
                </div>
              </button>
            </div>

            {/* 3. Right Navigation & User Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Host Dashboard Link */}
              <Link
                href="/host"
                className="hidden md:inline-flex items-center rounded-full px-3.5 py-2 text-xs font-bold text-neutral-800 transition hover:bg-neutral-100"
              >
                Airbnb your home
              </Link>

              {/* Wishlist Link with Badge */}
              <Link
                href="/wishlists"
                className="relative flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                aria-label={`Wishlists with ${favoritesCount} saved stays`}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    favoritesCount > 0
                      ? "fill-[#FF385C] text-[#FF385C]"
                      : "text-neutral-700"
                  }`}
                />
                <span className="hidden sm:inline">Wishlists</span>
                {favoritesCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF385C] px-1 text-xs font-bold text-white">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Mobile Filter Trigger Button */}
              {onOpenFilters && (
                <button
                  onClick={onOpenFilters}
                  type="button"
                  className="relative flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 shadow-xs transition hover:bg-neutral-50 md:hidden"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                  {filterCount > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                      {filterCount}
                    </span>
                  )}
                </button>
              )}

              {/* Persona & Profile Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  type="button"
                  className="flex items-center gap-2.5 rounded-full border border-neutral-300 bg-white p-1 pl-3.5 transition hover:shadow-md active:scale-98 focus:outline-none focus:ring-2 focus:ring-[#FF385C]/30"
                  aria-expanded={isMenuOpen}
                  aria-label="User profile and navigation menu"
                >
                  <Menu className="h-4 w-4 text-neutral-600" />
                  <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-white font-bold text-xs ring-1 ring-neutral-200">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{currentUser?.name?.[0] || "U"}</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white py-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 z-50">
                    {/* Active User Header */}
                    <div className="border-b border-neutral-100 px-4 py-3 bg-neutral-50/50">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Current Account
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="truncate mr-2">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {currentUser?.name || "Sarah Jenkins"}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {currentUser?.email}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          currentUser?.role === "host"
                            ? "bg-rose-100 text-[#FF385C]"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {currentUser?.role || "guest"}
                        </span>
                      </div>
                    </div>

                    {/* Primary Application Links */}
                    <div className="px-2 py-1.5 space-y-0.5">
                      <Link
                        href="/trips"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                      >
                        <Compass className="h-4 w-4 text-[#FF385C]" />
                        <span>Trips</span>
                      </Link>

                      <Link
                        href="/wishlists"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Heart className="h-4 w-4 text-[#FF385C]" />
                          <span>Wishlists</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        href="/host"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                      >
                        <Home className="h-4 w-4 text-[#FF385C]" />
                        <span>Host dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsHelpOpen(true);
                        }}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-100 transition"
                      >
                        <HelpCircle className="h-4 w-4 text-neutral-600" />
                        <span>Help & FAQ</span>
                      </button>
                    </div>

                    {/* Persona Switcher Section */}
                    <div className="border-t border-neutral-100 px-2 pt-2 pb-1">
                      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Switch Mock Persona
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-0.5 mt-0.5">
                        {users.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSelectUser(u);
                              setIsMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                              currentUser?.id === u.id
                                ? "bg-neutral-100 font-bold text-neutral-900"
                                : "text-neutral-700 hover:bg-neutral-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold">
                                {u.name[0]}
                              </span>
                              <span className="truncate">{u.name}</span>
                              <span className="text-[10px] text-neutral-400 capitalize">
                                ({u.role})
                              </span>
                            </div>
                            {currentUser?.id === u.id && (
                              <Check className="h-3.5 w-3.5 text-[#FF385C]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mock Logout Option */}
                    <div className="border-t border-neutral-100 px-2 pt-1.5">
                      <button
                        onClick={handleLogoutReset}
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-neutral-600 hover:text-rose-600 hover:bg-rose-50/60 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Reset to default guest</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar Pill (shows on small screens below header) */}
          <div className="pb-3 md:hidden">
            <button
              onClick={onSearchClick}
              type="button"
              className="flex w-full items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-left shadow-xs transition hover:shadow-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF385C] text-white">
                <Search className="h-4 w-4" />
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-bold text-neutral-900 truncate">
                  Where to?
                </span>
                <span className="text-[11px] text-neutral-500 truncate">
                  {searchSummary}
                </span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Global Help & Demo Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}

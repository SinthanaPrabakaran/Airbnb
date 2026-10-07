"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Users, X, Plus, Minus } from "lucide-react";

interface SearchBarProps {
  location: string;
  onLocationChange: (val: string) => void;
  checkIn: string;
  onCheckInChange: (val: string) => void;
  checkOut: string;
  onCheckOutChange: (val: string) => void;
  guests: number;
  onGuestsChange: (val: number) => void;
  onSearch: () => void;
  onClear: () => void;
  isExpanded?: boolean;
}

const POPULAR_DESTINATIONS = [
  { city: "Anywhere", label: "I'm flexible" },
  { city: "Paris", country: "France" },
  { city: "Amalfi", country: "Italy" },
  { city: "Kyoto", country: "Japan" },
  { city: "Aspen", country: "United States" },
  { city: "Bali", country: "Indonesia" },
  { city: "Santorini", country: "Greece" },
  { city: "Tulum", country: "Mexico" },
  { city: "Banff", country: "Canada" },
];

export function SearchBar({
  location,
  onLocationChange,
  checkIn,
  onCheckInChange,
  checkOut,
  onCheckOutChange,
  guests,
  onGuestsChange,
  onSearch,
  onClear,
  isExpanded = true,
}: SearchBarProps) {
  const [activeTab, setActiveTab] = useState<"where" | "checkin" | "checkout" | "who" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close active dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters = Boolean(location || checkIn || checkOut || guests > 1);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* Segmented Search Bar Container */}
      <div className="flex flex-col md:flex-row items-center rounded-3xl md:rounded-full border border-neutral-300 bg-white shadow-md hover:shadow-lg transition-all p-1.5 md:p-2">
        {/* 1. Where Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "where" ? null : "where")}
          className={`w-full md:flex-1 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "where" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            Where
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none truncate"
          />
        </div>

        <div className="hidden md:block h-8 w-[1px] bg-neutral-200" />

        {/* 2. Check-in Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "checkin" ? null : "checkin")}
          className={`w-full md:w-40 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "checkin" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            Check in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => onCheckInChange(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="hidden md:block h-8 w-[1px] bg-neutral-200" />

        {/* 3. Check-out Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "checkout" ? null : "checkout")}
          className={`w-full md:w-40 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "checkout" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            Check out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => onCheckOutChange(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-neutral-900 focus:outline-none"
          />
        </div>

        <div className="hidden md:block h-8 w-[1px] bg-neutral-200" />

        {/* 4. Who / Guests Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "who" ? null : "who")}
          className={`w-full md:w-44 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "who" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            Who
          </label>
          <div className="text-sm font-semibold text-neutral-900 truncate">
            {guests > 1 ? `${guests} guests` : "Add guests"}
          </div>
        </div>

        {/* 5. Buttons: Clear & Search */}
        <div className="flex items-center gap-2 p-1.5 w-full md:w-auto justify-end">
          {hasActiveFilters && (
            <button
              onClick={onClear}
              type="button"
              className="p-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab(null);
              onSearch();
            }}
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#FF385C] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#E00B41] active:scale-95"
            aria-label="Submit search"
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Popover: Destinations Quick Selection */}
      {activeTab === "where" && (
        <div className="absolute left-0 mt-3 w-full md:w-96 rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
            Search by destination
          </p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.city}
                type="button"
                onClick={() => {
                  onLocationChange(dest.city === "Anywhere" ? "" : dest.city);
                  setActiveTab("checkin");
                }}
                className="flex items-center gap-2.5 rounded-xl border border-neutral-200 p-2.5 text-left text-xs font-semibold text-neutral-800 transition hover:border-neutral-900 hover:bg-neutral-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <div className="truncate">{dest.city}</div>
                  {dest.country && (
                    <div className="text-[10px] text-neutral-400 truncate">
                      {dest.country}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popover: Guests Counter */}
      {activeTab === "who" && (
        <div className="absolute right-0 mt-3 w-full md:w-80 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-bold text-neutral-900">Guests</p>
              <p className="text-xs text-neutral-500">Ages 13 or above</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={guests <= 1}
                onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-neutral-900">
                {guests}
              </span>
              <button
                type="button"
                disabled={guests >= 16}
                onClick={() => onGuestsChange(guests + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 hover:border-neutral-900"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab(null)}
              className="rounded-lg px-3 py-1 text-xs font-bold text-neutral-900 hover:bg-neutral-100"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

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
  { city: "Goa", country: "India" },
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
  const [activeTab, setActiveTab] = useState<"where" | "dates" | "who" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calendar month state
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Close active dropdowns on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const hasActiveFilters = Boolean(location || checkIn || checkOut || guests > 1);

  // Calendar logic
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (dateStr < todayStr) return;

    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(dateStr);
      onCheckOutChange("");
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        onCheckInChange(dateStr);
      } else {
        onCheckOutChange(dateStr);
        // Automatically advance to guests or close calendar
        setActiveTab("who");
      }
    }
  };

  const formatDisplayDate = (dStr: string) => {
    if (!dStr) return "";
    try {
      const parts = dStr.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dStr;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      {/* Segmented Search Bar Container */}
      <div className="flex flex-col md:flex-row items-center rounded-3xl md:rounded-full border border-neutral-300 bg-white shadow-md hover:shadow-lg transition-all p-1.5 md:p-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
        {/* 1. Where Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "where" ? null : "where")}
          className={`w-full md:flex-1 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "where" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Search destination"
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 pointer-events-none">
            Where
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none truncate"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("where");
            }}
          />
        </div>

        {/* 2. Check-in & Check-out Combined Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "dates" ? null : "dates")}
          className={`w-full md:w-64 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "dates" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select dates"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                Check in
              </label>
              <div className="text-xs font-semibold text-neutral-900 truncate">
                {checkIn ? formatDisplayDate(checkIn) : "Add date"}
              </div>
            </div>
            <div className="h-6 w-[1px] bg-neutral-200 mx-2" />
            <div className="flex-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
                Check out
              </label>
              <div className="text-xs font-semibold text-neutral-900 truncate">
                {checkOut ? formatDisplayDate(checkOut) : "Add date"}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Who / Guests Segment */}
        <div
          onClick={() => setActiveTab(activeTab === "who" ? null : "who")}
          className={`w-full md:w-44 cursor-pointer rounded-2xl md:rounded-full px-5 py-2.5 transition ${
            activeTab === "who" ? "bg-neutral-100 shadow-inner" : "hover:bg-neutral-50"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select guests"
        >
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800">
            Who
          </label>
          <div className="text-sm font-semibold text-neutral-900 truncate">
            {guests > 1 ? `${guests} guests` : "Add guests"}
          </div>
        </div>

        {/* 4. Action Buttons: Clear & Search */}
        <div className="flex items-center gap-2 p-1.5 w-full md:w-auto justify-end">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                setActiveTab(null);
              }}
              type="button"
              className="p-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition"
              title="Clear search"
              aria-label="Clear all search parameters"
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
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#FF385C]/25 transition hover:brightness-105 active:scale-95"
            aria-label="Submit search"
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Popover 1: Destinations Quick Selection */}
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
                  setActiveTab("dates");
                }}
                className="flex items-center gap-2.5 rounded-xl border border-neutral-200 p-2.5 text-left text-xs font-semibold text-neutral-800 transition hover:border-neutral-900 hover:bg-neutral-50"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <div className="truncate font-bold">{dest.city}</div>
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

      {/* Popover 2: Calendar Date Range Picker */}
      {activeTab === "dates" && (
        <div className="absolute left-0 md:left-1/4 mt-3 w-full md:w-[360px] rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h4 className="text-sm font-bold text-neutral-900">
              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-neutral-400 py-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-full" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isPast = dateStr < todayStr;
              const isStart = checkIn === dateStr;
              const isEnd = checkOut === dateStr;
              const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateClick(dateStr)}
                  className={`h-9 w-full rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isPast
                      ? "text-neutral-300 cursor-not-allowed"
                      : isStart || isEnd
                      ? "bg-neutral-900 text-white shadow-xs"
                      : isInRange
                      ? "bg-neutral-100 text-neutral-900 rounded-none"
                      : "text-neutral-800 hover:bg-neutral-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Date Actions */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onCheckInChange("");
                onCheckOutChange("");
              }}
              className="text-neutral-500 hover:text-neutral-900 font-semibold underline"
            >
              Reset dates
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("who")}
              className="rounded-xl bg-neutral-900 px-3.5 py-1.5 font-bold text-white hover:bg-neutral-800"
            >
              Next: Guests
            </button>
          </div>
        </div>
      )}

      {/* Popover 3: Guests Counter */}
      {activeTab === "who" && (
        <div className="absolute right-0 mt-3 w-full md:w-80 rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-bold text-neutral-900">Adults & Guests</p>
              <p className="text-xs text-neutral-500">Ages 13 or above</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={guests <= 1}
                onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900 active:scale-95"
                aria-label="Decrease guest count"
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
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 hover:border-neutral-900 active:scale-95"
                aria-label="Increase guest count"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Max 16 guests</span>
            <button
              type="button"
              onClick={() => {
                setActiveTab(null);
                onSearch();
              }}
              className="rounded-xl bg-[#FF385C] px-4 py-2 text-xs font-bold text-white hover:bg-[#E00B41] transition"
            >
              Apply & Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

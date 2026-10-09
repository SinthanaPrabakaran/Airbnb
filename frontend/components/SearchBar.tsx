"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  X,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface SearchBarProps {
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
  activeCategoryTab?: string;
  onCategoryTabChange?: (tab: string) => void;
  onTabChange?: (tab: "where" | "dates" | "who" | null) => void;
}

const SEARCH_TABS = [
  { id: "all", label: "All", icon: "🌐" },
  { id: "homes", label: "Homes", icon: "🏡" },
  { id: "experiences", label: "Experiences", icon: "🎈" },
  { id: "services", label: "Services", icon: "🛎️" },
];

const POPULAR_DESTINATIONS = [
  { city: "Anywhere", label: "I'm flexible", country: "Search all listings" },
  { city: "Paris", country: "France" },
  { city: "Amalfi", country: "Italy" },
  { city: "Kyoto", country: "Japan" },
  { city: "Aspen", country: "United States" },
  { city: "Bali", country: "Indonesia" },
  { city: "Santorini", country: "Greece" },
  { city: "Goa", country: "India" },
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
  activeCategoryTab = "all",
  onCategoryTabChange,
  onTabChange,
}: SearchBarProps) {
  const [activeTab, setActiveTab] = useState<"where" | "dates" | "who" | null>(null);
  const [activeCategory, setActiveCategory] = useState(activeCategoryTab);
  const containerRef = useRef<HTMLDivElement>(null);

  // Month navigation for date calendar
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Guest counters breakdown
  const [adults, setAdults] = useState(() => Math.max(1, guests));
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Sync internal activeTab with parent if callback provided
  const handleTabChange = (tab: "where" | "dates" | "who" | null) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // Close active dropdowns on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleTabChange(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleTabChange(null);
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

  // Format date helper (e.g., "7 Oct")
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

  // Dynamic quick date helpers matching Airbnb screenshot
  const quickDates = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const todayLabel = now.toLocaleDateString("en-US", { day: "numeric", month: "short" });

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    const tomorrowLabel = tomorrow.toLocaleDateString("en-US", { day: "numeric", month: "short" });

    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = `${dayAfter.getFullYear()}-${String(dayAfter.getMonth() + 1).padStart(2, "0")}-${String(dayAfter.getDate()).padStart(2, "0")}`;

    // Calculate next weekend (Friday to Sunday)
    const dayOfWeek = now.getDay();
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0 && dayOfWeek !== 5) daysUntilFriday = 7;

    const friday = new Date(now);
    friday.setDate(now.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    const fridayStr = `${friday.getFullYear()}-${String(friday.getMonth() + 1).padStart(2, "0")}-${String(friday.getDate()).padStart(2, "0")}`;
    const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

    let weekendLabel = "";
    if (friday.getMonth() === sunday.getMonth()) {
      weekendLabel = `${friday.getDate()}–${sunday.getDate()} ${friday.toLocaleDateString("en-US", { month: "short" })}`;
    } else {
      weekendLabel = `${friday.getDate()} ${friday.toLocaleDateString("en-US", { month: "short" })} – ${sunday.getDate()} ${sunday.toLocaleDateString("en-US", { month: "short" })}`;
    }

    return {
      today: { start: todayStr, end: tomorrowStr, label: todayLabel },
      tomorrow: { start: tomorrowStr, end: dayAfterStr, label: tomorrowLabel },
      weekend: { start: fridayStr, end: sundayStr, label: weekendLabel },
      todayStr,
    };
  }, []);

  // Calendar dates math
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isCurrentMonthOrPast = useMemo(() => {
    const now = new Date();
    return year < now.getFullYear() || (year === now.getFullYear() && month <= now.getMonth());
  }, [year, month]);

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentMonthOrPast) return;
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (dateStr < quickDates.todayStr) return;

    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(dateStr);
      onCheckOutChange("");
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        onCheckInChange(dateStr);
      } else {
        onCheckOutChange(dateStr);
        // Advance to Who tab
        handleTabChange("who");
      }
    }
  };

  const applyQuickDate = (start: string, end: string) => {
    onCheckInChange(start);
    onCheckOutChange(end);
    handleTabChange("who");
  };

  // Update total guests
  const updateGuests = (newAdults: number, newChildren: number) => {
    const total = Math.max(1, newAdults + newChildren);
    setAdults(newAdults);
    setChildren(newChildren);
    onGuestsChange(total);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* 1. Category Tabs Row (All / Homes / Experiences / Services) */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 pb-4 transition-all duration-300">
        {SEARCH_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveCategory(tab.id);
                onCategoryTabChange?.(tab.id);
              }}
              className={`group flex items-center gap-2 pb-2.5 transition-all text-sm font-semibold cursor-pointer relative ${
                isActive
                  ? "text-neutral-900 font-bold"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-neutral-900 rounded-full animate-in fade-in zoom-in-95 duration-200" />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Unified Morphing Search Capsule Bar */}
      <div
        className={`relative w-full flex items-center rounded-full transition-all duration-300 border ${
          activeTab !== null
            ? "bg-[#EBEBEB] border-transparent shadow-md"
            : "bg-white border-neutral-300 shadow-[0_3px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
        }`}
      >
        {/* Where Segment */}
        <div
          onClick={() => handleTabChange(activeTab === "where" ? null : "where")}
          className={`flex-1 cursor-pointer rounded-full px-7 py-3 transition-all duration-200 ${
            activeTab === "where"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] z-10"
              : activeTab !== null
              ? "hover:bg-neutral-200/60"
              : "hover:bg-neutral-100"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Search destination"
        >
          <div className="text-[12px] font-bold text-neutral-800 tracking-tight">
            Where
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-500 focus:outline-none truncate"
            onClick={(e) => {
              e.stopPropagation();
              handleTabChange("where");
            }}
          />
        </div>

        {/* Divider 1 (Hidden if adjacent tab active) */}
        <div
          className={`h-8 w-[1px] bg-neutral-200 transition-opacity duration-200 ${
            activeTab === "where" || activeTab === "dates" ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* When Segment */}
        <div
          onClick={() => handleTabChange(activeTab === "dates" ? null : "dates")}
          className={`flex-1 cursor-pointer rounded-full px-7 py-3 transition-all duration-200 ${
            activeTab === "dates"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] z-10"
              : activeTab !== null
              ? "hover:bg-neutral-200/60"
              : "hover:bg-neutral-100"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select dates"
        >
          <div className="text-[12px] font-bold text-neutral-800 tracking-tight">
            When
          </div>
          <div className="text-sm font-medium text-neutral-900 truncate">
            {checkIn && checkOut ? (
              <span className="font-semibold text-neutral-900">
                {formatDisplayDate(checkIn)} – {formatDisplayDate(checkOut)}
              </span>
            ) : checkIn ? (
              <span className="font-semibold text-neutral-900">
                {formatDisplayDate(checkIn)} – Add check out
              </span>
            ) : (
              <span className="text-neutral-500 font-normal">Add dates</span>
            )}
          </div>
        </div>

        {/* Divider 2 (Hidden if adjacent tab active) */}
        <div
          className={`h-8 w-[1px] bg-neutral-200 transition-opacity duration-200 ${
            activeTab === "dates" || activeTab === "who" ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Who Segment */}
        <div
          onClick={() => handleTabChange(activeTab === "who" ? null : "who")}
          className={`flex-1 cursor-pointer rounded-full px-7 py-3 transition-all duration-200 flex items-center justify-between ${
            activeTab === "who"
              ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.14)] z-10"
              : activeTab !== null
              ? "hover:bg-neutral-200/60"
              : "hover:bg-neutral-100"
          }`}
          role="button"
          tabIndex={0}
          aria-label="Select guests"
        >
          <div>
            <div className="text-[12px] font-bold text-neutral-800 tracking-tight">
              Who
            </div>
            <div className="text-sm font-medium truncate">
              {guests > 1 ? (
                <span className="font-semibold text-neutral-900">{guests} guests</span>
              ) : (
                <span className="text-neutral-500 font-normal">Add guests</span>
              )}
            </div>
          </div>

          {/* Clear Button (If active filters exist) */}
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
                handleTabChange(null);
              }}
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition mr-1"
              title="Clear search"
              aria-label="Clear all parameters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Button (Animates/Morphs from Circle into Pill with "Search") */}
        <div className="pr-2 pl-1 py-2 shrink-0">
          <button
            onClick={() => {
              handleTabChange(null);
              onSearch();
            }}
            type="button"
            className={`flex items-center justify-center font-bold text-white bg-[#FF385C] hover:bg-[#E00B41] transition-all duration-300 shadow-md shadow-[#FF385C]/25 active:scale-95 ${
              activeTab !== null
                ? "h-12 px-6 rounded-full gap-2.5"
                : "h-12 w-12 rounded-full"
            }`}
            aria-label="Search"
          >
            <Search className="h-4 w-4 stroke-[3]" />
            {activeTab !== null && (
              <span className="text-sm tracking-wide animate-in fade-in duration-200">
                Search
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Floating Popovers / Dropdowns */}

      {/* Popover A: Where / Destinations */}
      {activeTab === "where" && (
        <div className="absolute top-full mt-4 left-0 w-full max-w-md rounded-[32px] border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] z-50 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 px-1">
            Search by destination
          </p>
          <div className="grid grid-cols-2 gap-2">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.city}
                type="button"
                onClick={() => {
                  onLocationChange(dest.city === "Anywhere" ? "" : dest.city);
                  handleTabChange("dates");
                }}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3 text-left transition hover:border-neutral-900 hover:bg-neutral-50 active:scale-98"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-neutral-900 truncate">{dest.city}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{dest.country}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popover B: When / Dual-Column Calendar Dropdown (Matching Screenshot 2 Exactly) */}
      {activeTab === "dates" && (
        <div className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-full max-w-2xl rounded-[32px] border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] z-50 flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Left Column: Quick Selection Cards (Today / Tomorrow / This weekend) */}
          <div className="w-full md:w-52 flex flex-col gap-3 shrink-0">
            {/* 1. Today Card */}
            <button
              type="button"
              onClick={() => applyQuickDate(quickDates.today.start, quickDates.today.end)}
              className="rounded-2xl border border-neutral-200 p-4 text-left transition hover:border-neutral-900 hover:shadow-xs active:scale-98 bg-white cursor-pointer group"
            >
              <div className="text-sm font-bold text-neutral-900 group-hover:text-black">
                Today
              </div>
              <div className="text-xs font-medium text-neutral-500 mt-1">
                {quickDates.today.label}
              </div>
            </button>

            {/* 2. Tomorrow Card */}
            <button
              type="button"
              onClick={() => applyQuickDate(quickDates.tomorrow.start, quickDates.tomorrow.end)}
              className="rounded-2xl border border-neutral-200 p-4 text-left transition hover:border-neutral-900 hover:shadow-xs active:scale-98 bg-white cursor-pointer group"
            >
              <div className="text-sm font-bold text-neutral-900 group-hover:text-black">
                Tomorrow
              </div>
              <div className="text-xs font-medium text-neutral-500 mt-1">
                {quickDates.tomorrow.label}
              </div>
            </button>

            {/* 3. This weekend Card */}
            <button
              type="button"
              onClick={() => applyQuickDate(quickDates.weekend.start, quickDates.weekend.end)}
              className="rounded-2xl border border-neutral-200 p-4 text-left transition hover:border-neutral-900 hover:shadow-xs active:scale-98 bg-white cursor-pointer group"
            >
              <div className="text-sm font-bold text-neutral-900 group-hover:text-black">
                This weekend
              </div>
              <div className="text-xs font-medium text-neutral-500 mt-1">
                {quickDates.weekend.label}
              </div>
            </button>
          </div>

          {/* Right Column: Month Calendar (Matching Screenshot 2 Exactly) */}
          <div className="flex-1 border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
            {/* Calendar Navigation Header */}
            <div className="flex items-center justify-between pb-3">
              <button
                onClick={prevMonth}
                type="button"
                disabled={isCurrentMonthOrPast}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  isCurrentMonthOrPast
                    ? "text-neutral-300 cursor-not-allowed"
                    : "text-neutral-700 hover:bg-neutral-100 active:scale-95"
                }`}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <h4 className="text-sm font-bold text-neutral-900">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h4>

              <button
                onClick={nextMonth}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 transition active:scale-95"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday Single-Letter Headers (S M T W T F S) */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-neutral-400 py-2">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-medium">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-9 w-full" />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isPast = dateStr < quickDates.todayStr;
                const isStart = checkIn === dateStr;
                const isEnd = checkOut === dateStr;
                const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                return (
                  <div key={dateStr} className="relative flex items-center justify-center py-0.5">
                    {/* Continuous range highlight background */}
                    {isInRange && (
                      <div className="absolute inset-y-0.5 inset-x-0 bg-neutral-100" />
                    )}
                    {isStart && checkOut && (
                      <div className="absolute inset-y-0.5 left-1/2 right-0 bg-neutral-100" />
                    )}
                    {isEnd && checkIn && (
                      <div className="absolute inset-y-0.5 left-0 right-1/2 bg-neutral-100" />
                    )}

                    <button
                      type="button"
                      disabled={isPast}
                      onClick={() => handleDateClick(dateStr)}
                      className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPast
                          ? "text-neutral-300 cursor-not-allowed"
                          : isStart || isEnd
                          ? "bg-neutral-900 text-white font-bold shadow-xs scale-105"
                          : isInRange
                          ? "text-neutral-900 font-semibold hover:bg-neutral-200"
                          : "text-neutral-800 hover:border hover:border-neutral-900 font-medium"
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Popover C: Who / Guest Stepper */}
      {activeTab === "who" && (
        <div className="absolute top-full mt-4 right-0 w-full max-w-sm rounded-[32px] border border-neutral-100 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.16)] z-50 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-neutral-900">Adults</div>
              <div className="text-xs text-neutral-400">Ages 13 or above</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={adults <= 1}
                onClick={() => updateGuests(adults - 1, children)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease adults"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-neutral-900">
                {adults}
              </span>
              <button
                type="button"
                disabled={adults >= 16}
                onClick={() => updateGuests(adults + 1, children)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900"
                aria-label="Increase adults"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-100" />

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-neutral-900">Children</div>
              <div className="text-xs text-neutral-400">Ages 2–12</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={children <= 0}
                onClick={() => updateGuests(adults, children - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease children"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-neutral-900">
                {children}
              </span>
              <button
                type="button"
                disabled={children >= 8}
                onClick={() => updateGuests(adults, children + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900"
                aria-label="Increase children"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-neutral-100" />

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-neutral-900">Infants</div>
              <div className="text-xs text-neutral-400">Under 2</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={infants <= 0}
                onClick={() => setInfants(Math.max(0, infants - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease infants"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-neutral-900">
                {infants}
              </span>
              <button
                type="button"
                disabled={infants >= 5}
                onClick={() => setInfants(infants + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition hover:border-neutral-900"
                aria-label="Increase infants"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

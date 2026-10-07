"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
  unavailableDates: string[]; // ISO date strings (YYYY-MM-DD)
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onSelectDates,
  unavailableDates,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Compute month days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dateStr: string) => {
    if (unavailableSet.has(dateStr) || dateStr < todayStr) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start new range
      onSelectDates(dateStr, "");
    } else if (checkIn && !checkOut) {
      if (dateStr <= checkIn) {
        // If clicked earlier or equal date, restart check_in
        onSelectDates(dateStr, "");
      } else {
        // Check if interval has unavailable dates
        let hasBlocked = false;
        const curr = new Date(checkIn);
        const end = new Date(dateStr);
        while (curr < end) {
          curr.setDate(curr.getDate() + 1);
          const iso = curr.toISOString().split("T")[0];
          if (curr < end && unavailableSet.has(iso)) {
            hasBlocked = true;
            break;
          }
        }

        if (hasBlocked) {
          // Blocked: start new range
          onSelectDates(dateStr, "");
        } else {
          onSelectDates(checkIn, dateStr);
          setIsOpen(false);
        }
      }
    }
  };

  return (
    <div className="relative">
      {/* 2-Cell Segmented Input Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="grid grid-cols-2 rounded-xl border border-neutral-300 bg-white cursor-pointer divide-x divide-neutral-200 transition focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900"
      >
        <div className="p-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800">
            CHECK-IN
          </label>
          <div className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
            {checkIn ? checkIn : "Add date"}
          </div>
        </div>

        <div className="p-2.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-800">
            CHECKOUT
          </label>
          <div className="text-xs font-semibold text-neutral-900 truncate mt-0.5">
            {checkOut ? checkOut : "Add date"}
          </div>
        </div>
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-40 w-80 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-neutral-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition ml-1"
                aria-label="Close calendar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-neutral-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Days of Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              // Local ISO string YYYY-MM-DD
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

              const isPast = dateStr < todayStr;
              const isBlocked = unavailableSet.has(dateStr);
              const isDisabled = isPast || isBlocked;

              const isStart = dateStr === checkIn;
              const isEnd = dateStr === checkOut;
              const inRange =
                checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(dateStr)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition ${
                    isStart || isEnd
                      ? "bg-neutral-900 text-white shadow-xs"
                      : inRange
                      ? "bg-neutral-100 text-neutral-900 rounded-none font-bold"
                      : isDisabled
                      ? "text-neutral-300 line-through cursor-not-allowed"
                      : "text-neutral-800 hover:border hover:border-neutral-900"
                  }`}
                  title={isBlocked ? "Already booked" : undefined}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => onSelectDates("", "")}
              className="text-neutral-500 font-semibold underline hover:text-neutral-900"
            >
              Clear dates
            </button>
            <span className="text-neutral-400">
              {checkIn && !checkOut ? "Select check-out" : "Click to select range"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  // Today in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // If checkIn exists, set current month to checkIn month on initial open
  useEffect(() => {
    if (checkIn && isOpen) {
      const parts = checkIn.split("-");
      if (parts.length === 3) {
        setCurrentMonth(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
      }
    }
  }, [isOpen, checkIn]);

  // Compute month days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
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
          const iso = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
          if (curr < end && unavailableSet.has(iso)) {
            hasBlocked = true;
            break;
          }
        }

        if (hasBlocked) {
          // Restart selection at clicked date
          onSelectDates(dateStr, "");
        } else {
          onSelectDates(checkIn, dateStr);
          setIsOpen(false);
        }
      }
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* 2-Cell Segmented Input Trigger (Inside outer card border) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="grid grid-cols-2 rounded-t-2xl cursor-pointer divide-x divide-neutral-200 transition hover:bg-neutral-50/70"
      >
        <div className="p-3">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-800">
            CHECK-IN
          </label>
          <div
            className={`text-xs font-semibold truncate mt-0.5 ${
              checkIn ? "text-neutral-900 font-bold" : "text-neutral-500 font-normal"
            }`}
          >
            {checkIn ? checkIn : "Add date"}
          </div>
        </div>

        <div className="p-3">
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-800">
            CHECKOUT
          </label>
          <div
            className={`text-xs font-semibold truncate mt-0.5 ${
              checkOut ? "text-neutral-900 font-bold" : "text-neutral-500 font-normal"
            }`}
          >
            {checkOut ? checkOut : "Add date"}
          </div>
        </div>
      </div>

      {/* Popover Calendar Modal (Positioned cleanly on top of all elements) */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 w-full sm:w-[330px] rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Calendar Header with Month/Year & Navigation */}
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-neutral-900">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition ml-1"
                aria-label="Close calendar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-neutral-400 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Calendar Days 7xN Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-9" />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;

              const isPast = dateStr < todayStr;
              const isBlocked = unavailableSet.has(dateStr);
              const isDisabled = isPast || isBlocked;

              const isStart = dateStr === checkIn;
              const isEnd = dateStr === checkOut;
              const inRange =
                Boolean(checkIn && checkOut && dateStr > checkIn && dateStr < checkOut);

              return (
                <div
                  key={dateStr}
                  className={`relative flex items-center justify-center h-9 w-full ${
                    inRange ? "bg-neutral-100" : ""
                  } ${isStart && checkOut ? "rounded-l-full bg-neutral-100" : ""} ${
                    isEnd && checkIn ? "rounded-r-full bg-neutral-100" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(dateStr)}
                    className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition ${
                      isStart || isEnd
                        ? "bg-neutral-900 text-white shadow-md z-10"
                        : isDisabled
                        ? "text-neutral-300 line-through cursor-not-allowed"
                        : "text-neutral-800 hover:bg-neutral-200/70"
                    }`}
                    title={
                      isBlocked
                        ? "Date unavailable / booked"
                        : isPast
                        ? "Past date"
                        : undefined
                    }
                  >
                    {dayNum}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => onSelectDates("", "")}
              className="text-neutral-500 font-semibold underline hover:text-neutral-900 transition"
            >
              Clear dates
            </button>
            <span className="text-[11px] text-neutral-400 font-medium">
              {!checkIn
                ? "Select check-in"
                : !checkOut
                ? "Select checkout"
                : "Dates selected"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

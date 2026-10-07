"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Minus, X } from "lucide-react";

interface GuestSelectorProps {
  guests: number;
  onGuestsChange: (guests: number) => void;
  maxGuests: number;
}

export function GuestSelector({
  guests,
  onGuestsChange,
  maxGuests,
}: GuestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-b-2xl bg-white p-3 text-left transition hover:bg-neutral-50/70 focus:outline-none"
      >
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-800">
            GUESTS
          </label>
          <div className="text-xs font-semibold text-neutral-900 mt-0.5">
            {guests} {guests === 1 ? "guest" : "guests"}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-full rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-neutral-900">Total Guests</p>
              <p className="text-[11px] text-neutral-500">
                Max {maxGuests} {maxGuests === 1 ? "guest" : "guests"} allowed
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={guests <= 1}
                onClick={() => onGuestsChange(Math.max(1, guests - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900"
                aria-label="Decrease guest count"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>

              <span className="w-4 text-center text-xs font-bold text-neutral-900">
                {guests}
              </span>

              <button
                type="button"
                disabled={guests >= maxGuests}
                onClick={() => onGuestsChange(Math.min(maxGuests, guests + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-900"
                aria-label="Increase guest count"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
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

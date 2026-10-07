"use client";

import React from "react";
import { X, Check } from "lucide-react";
import { Amenity } from "@/types";

interface AmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenities: Amenity[];
}

export function AmenitiesModal({
  isOpen,
  onClose,
  amenities,
}: AmenitiesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[85vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
            aria-label="Close amenities modal"
          >
            <X className="h-4 w-4" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">
            What this place offers
          </h2>
          <div className="w-8" />
        </div>

        {/* List of all amenities */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {amenities.length} Included Amenities
          </p>

          <div className="divide-y divide-neutral-100">
            {amenities.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 text-sm font-medium text-neutral-800"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
                  <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                </div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-neutral-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MapPin, Navigation, Compass, Plus, Minus } from "lucide-react";

interface LocationSectionProps {
  location: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function LocationSection({
  location,
  city,
  country,
}: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Where you'll be
        </h2>
        <p className="mt-1 text-sm text-neutral-600 font-medium">
          {location}, {city}, {country}
        </p>
      </div>

      {/* Polished Stylized Map Container */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-3xl border border-neutral-200 bg-emerald-50/40 shadow-xs">
        {/* Stylized SVG Map Graphics representing topography & roads */}
        <svg
          className="absolute inset-0 h-full w-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Stylized river path */}
          <path
            d="M -50 150 Q 150 80 350 220 T 750 180 T 1100 300"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Stylized road arteries */}
          <path
            d="M 100 -50 L 300 450 M -50 200 L 900 200 M 200 400 L 800 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <path
            d="M 50 100 Q 250 300 600 250"
            fill="none"
            stroke="#fde047"
            strokeWidth="4"
          />
        </svg>

        {/* Center Glowing Pin Marker */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            {/* Pulsing radius circle */}
            <div className="absolute h-28 w-28 rounded-full bg-[#FF385C]/15 animate-ping duration-1000" />
            <div className="absolute h-20 w-20 rounded-full bg-[#FF385C]/25" />

            {/* Pin Badge */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#FF385C] text-white shadow-xl shadow-[#FF385C]/40 border-2 border-white">
              <MapPin className="h-6 w-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3 rounded-full bg-white/95 px-4 py-1.5 shadow-md backdrop-blur-xs text-xs font-bold text-neutral-900 border border-neutral-200">
            {city}, {country}
          </div>
        </div>

        {/* Map Control Buttons (Mocked zoom & compass) */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
            <button
              type="button"
              className="p-2 text-neutral-700 hover:bg-neutral-100 transition border-b border-neutral-100"
              title="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-2 text-neutral-700 hover:bg-neutral-100 transition"
              title="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 shadow-xs border border-neutral-200 text-[11px] font-semibold text-neutral-600">
          <Navigation className="h-3 w-3 text-neutral-500" />
          <span>Neighborhood view</span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed font-normal">
        Exact location and check-in instructions provided after booking confirmation. The neighborhood offers peaceful walks, local cafes, artisan shops, and scenic vistas within easy walking distance.
      </p>
    </div>
  );
}

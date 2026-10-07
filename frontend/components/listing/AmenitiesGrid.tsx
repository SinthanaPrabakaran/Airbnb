"use client";

import React, { useState } from "react";
import {
  Wifi,
  Waves,
  Bath,
  SquareParking,
  Wind,
  Laptop,
  Utensils,
  Tv,
  Disc,
  Flame,
  Umbrella,
  Mountain,
  PawPrint,
  Zap,
  Sun,
  Key,
  Dumbbell,
  CheckCircle,
} from "lucide-react";
import { Amenity } from "@/types";
import { AmenitiesModal } from "./AmenitiesModal";

interface AmenitiesGridProps {
  amenities: Amenity[];
}

function getAmenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi")) return Wifi;
  if (lower.includes("pool")) return Waves;
  if (lower.includes("hot tub")) return Bath;
  if (lower.includes("parking")) return SquareParking;
  if (lower.includes("air condition") || lower.includes("ac")) return Wind;
  if (lower.includes("workspace") || lower.includes("desk")) return Laptop;
  if (lower.includes("kitchen")) return Utensils;
  if (lower.includes("tv")) return Tv;
  if (lower.includes("washer") || lower.includes("dryer")) return Disc;
  if (lower.includes("fire")) return Flame;
  if (lower.includes("beach")) return Umbrella;
  if (lower.includes("mountain") || lower.includes("view")) return Mountain;
  if (lower.includes("pet")) return PawPrint;
  if (lower.includes("charger") || lower.includes("ev")) return Zap;
  if (lower.includes("balcony") || lower.includes("terrace") || lower.includes("patio")) return Sun;
  if (lower.includes("check-in") || lower.includes("key")) return Key;
  if (lower.includes("gym") || lower.includes("fitness")) return Dumbbell;
  return CheckCircle;
}

export function AmenitiesGrid({ amenities }: AmenitiesGridProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (amenities.length === 0) return null;

  const displayList = amenities.slice(0, 10);

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          What this place offers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
          {displayList.map((item) => {
            const Icon = getAmenityIcon(item.name);
            return (
              <div key={item.id} className="flex items-center gap-3.5 text-sm font-medium text-neutral-800">
                <Icon className="h-5 w-5 text-neutral-700 shrink-0 stroke-[1.75]" />
                <span>{item.name}</span>
              </div>
            );
          })}
        </div>

        {amenities.length > 6 && (
          <div className="pt-2">
            <button
              onClick={() => setModalOpen(true)}
              type="button"
              className="rounded-xl border border-neutral-900 bg-white px-5 py-3 text-xs font-bold text-neutral-900 shadow-2xs transition hover:bg-neutral-50 active:scale-95"
            >
              Show all {amenities.length} amenities
            </button>
          </div>
        )}
      </div>

      <AmenitiesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amenities={amenities}
      />
    </>
  );
}

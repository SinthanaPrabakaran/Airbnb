"use client";

import React, { useRef } from "react";
import {
  Umbrella,
  Mountain,
  Home,
  Flame,
  Waves,
  Sparkles,
  Building2,
  TreePine,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sun,
  Crown,
  Trees,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  propertyType?: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "All homes", icon: Sparkles },
  { id: "beach", label: "Beachfront", icon: Umbrella, propertyType: "Beachfront" },
  { id: "views", label: "Amazing views", icon: Mountain },
  { id: "cabins", label: "Cabins", icon: TreePine, propertyType: "Cabin" },
  { id: "villas", label: "Villas", icon: Crown, propertyType: "Villa" },
  { id: "pools", label: "Amazing pools", icon: Waves },
  { id: "apartments", label: "Apartments", icon: Building2, propertyType: "Apartment" },
  { id: "houses", label: "Houses", icon: Home, propertyType: "House" },
  { id: "chalets", label: "Chalets", icon: Trees, propertyType: "Chalet" },
  { id: "lofts", label: "Lofts", icon: Sun, propertyType: "Loft" },
  { id: "treehouse", label: "Treehouses", icon: Flame, propertyType: "Treehouse" },
];

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (id: string, propertyType?: string) => void;
  onOpenFilters: () => void;
  filterCount?: number;
}

export function CategoryNav({
  activeCategory,
  onSelectCategory,
  onOpenFilters,
  filterCount = 0,
}: CategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <div className="relative border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-3">
          {/* Categories Horizontal Carousel Container */}
          <div className="relative flex-1 overflow-hidden">
            {/* Left Scroll Arrow */}
            <button
              onClick={() => scroll("left")}
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-105 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 text-neutral-700" />
            </button>

            {/* Scrollable Items */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-6 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
            >
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id, cat.propertyType)}
                    type="button"
                    className={`group flex shrink-0 flex-col items-center gap-1.5 pb-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-b-2 border-neutral-900 text-neutral-900 font-semibold"
                        : "border-b-2 border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300 font-medium"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-700"
                      }`}
                    />
                    <span className="text-xs whitespace-nowrap tracking-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Scroll Arrow */}
            <button
              onClick={() => scroll("right")}
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-105 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 text-neutral-700" />
            </button>
          </div>

          {/* Filters Button (Desktop) */}
          <div className="shrink-0 pl-2">
            <button
              onClick={onOpenFilters}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-bold text-neutral-800 shadow-sm transition hover:border-neutral-900 active:scale-98"
              aria-label="Open filter settings modal"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {filterCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-bold text-white">
                  {filterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Check, SlidersHorizontal, Bed, Bath, Home, Sparkles } from "lucide-react";
import { Amenity } from "@/types";

export interface FilterState {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  selectedAmenities: string[];
  sortBy?: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
  initialFilters: FilterState;
  amenitiesList: Amenity[];
  totalMatchesCount?: number;
}

const PROPERTY_TYPES = [
  "All types",
  "Villa",
  "Cabin",
  "Loft",
  "Chalet",
  "Treehouse",
  "Apartment",
  "House",
  "Beachfront",
  "Mansion",
];

const SORT_OPTIONS = [
  { id: "", label: "Recommended" },
  { id: "price_asc", label: "Price: Low to high" },
  { id: "price_desc", label: "Price: High to low" },
  { id: "rating", label: "Highest rated" },
  { id: "newest", label: "Newest listings" },
];

const ROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "5+", value: 5 },
  { label: "6+", value: 6 },
];

const BATH_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1+", value: 1 },
  { label: "2+", value: 2 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
];

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  onReset,
  initialFilters,
  amenitiesList,
  totalMatchesCount,
}: FilterModalProps) {
  const [minPrice, setMinPrice] = useState<string>(
    initialFilters.minPrice ? String(initialFilters.minPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    initialFilters.maxPrice ? String(initialFilters.maxPrice) : ""
  );
  const [propertyType, setPropertyType] = useState<string>(
    initialFilters.propertyType || "All types"
  );
  const [guests, setGuests] = useState<number>(initialFilters.guests || 1);
  const [bedrooms, setBedrooms] = useState<number | undefined>(initialFilters.bedrooms);
  const [beds, setBeds] = useState<number | undefined>(initialFilters.beds);
  const [bathrooms, setBathrooms] = useState<number | undefined>(initialFilters.bathrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.selectedAmenities || []
  );
  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy || "");

  // Sync state when opened with initial filters
  useEffect(() => {
    if (isOpen) {
      setMinPrice(initialFilters.minPrice ? String(initialFilters.minPrice) : "");
      setMaxPrice(initialFilters.maxPrice ? String(initialFilters.maxPrice) : "");
      setPropertyType(initialFilters.propertyType || "All types");
      setGuests(initialFilters.guests || 1);
      setBedrooms(initialFilters.bedrooms);
      setBeds(initialFilters.beds);
      setBathrooms(initialFilters.bathrooms);
      setSelectedAmenities(initialFilters.selectedAmenities || []);
      setSortBy(initialFilters.sortBy || "");
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleApply = () => {
    onApply({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      propertyType: propertyType === "All types" ? undefined : propertyType,
      guests: guests > 1 ? guests : undefined,
      bedrooms,
      beds,
      bathrooms,
      selectedAmenities,
      sortBy: sortBy || undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("All types");
    setGuests(1);
    setBedrooms(undefined);
    setBeds(undefined);
    setBathrooms(undefined);
    setSelectedAmenities([]);
    setSortBy("");
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-white sticky top-0 z-10">
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#FF385C]" />
            <h2 className="text-base font-bold text-neutral-900">Filters</h2>
          </div>
          <div className="w-8" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-neutral-100">
          {/* Section 1: Price Range */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Price range</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Nightly prices in Indian Rupee (₹) before taxes and cleaning
            </p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1 rounded-2xl border border-neutral-300 px-4 py-2.5 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Minimum
                </label>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-neutral-600 mr-1">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full text-sm font-bold text-neutral-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <span className="text-neutral-400 font-bold text-lg">–</span>

              <div className="flex-1 rounded-2xl border border-neutral-300 px-4 py-2.5 focus-within:border-neutral-900 focus-within:ring-1 focus-within:ring-neutral-900 transition">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Maximum
                </label>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-neutral-600 mr-1">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="10,000+"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full text-sm font-bold text-neutral-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Property Type */}
          <div className="pt-6">
            <h3 className="text-sm font-bold text-neutral-900">Property type</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Filter by entire homes, apartments, villas, and more
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPropertyType(type)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isSelected
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Rooms and Beds (Bedrooms, Beds, Bathrooms) */}
          <div className="pt-6 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Rooms and beds</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Set minimum bedroom, bed, and bathroom counts
              </p>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Bedrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {ROOM_OPTIONS.map((opt) => {
                  const isSelected = bedrooms === opt.value;
                  return (
                    <button
                      key={`br-${opt.label}`}
                      type="button"
                      onClick={() => setBedrooms(opt.value)}
                      className={`h-9 min-w-12 px-3 rounded-full text-xs font-bold transition ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Beds */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Beds
              </label>
              <div className="flex flex-wrap gap-2">
                {ROOM_OPTIONS.map((opt) => {
                  const isSelected = beds === opt.value;
                  return (
                    <button
                      key={`beds-${opt.label}`}
                      type="button"
                      onClick={() => setBeds(opt.value)}
                      className={`h-9 min-w-12 px-3 rounded-full text-xs font-bold transition ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bathrooms */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-2">
                Bathrooms
              </label>
              <div className="flex flex-wrap gap-2">
                {BATH_OPTIONS.map((opt) => {
                  const isSelected = bathrooms === opt.value;
                  return (
                    <button
                      key={`bath-${opt.label}`}
                      type="button"
                      onClick={() => setBathrooms(opt.value)}
                      className={`h-9 min-w-12 px-3 rounded-full text-xs font-bold transition ${
                        isSelected
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "border border-neutral-300 text-neutral-700 hover:border-neutral-900 hover:bg-neutral-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Guests */}
          <div className="pt-6">
            <h3 className="text-sm font-bold text-neutral-900">Minimum guests</h3>
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3, 4, 6, 8].map((count) => {
                const isSelected = guests === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setGuests(count)}
                    className={`flex h-10 w-12 items-center justify-center rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:border-neutral-900"
                    }`}
                  >
                    {count}+
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Amenities Checklist */}
          <div className="pt-6">
            <h3 className="text-sm font-bold text-neutral-900">Amenities</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select desired comforts and features
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {amenitiesList.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.name);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.name)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition ${
                      isChecked
                        ? "border-neutral-900 bg-neutral-50 text-neutral-900 ring-1 ring-neutral-900"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <span>{amenity.name}</span>
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        isChecked
                          ? "border-neutral-900 bg-neutral-900 text-white"
                          : "border-neutral-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Sort By */}
          <div className="pt-6">
            <h3 className="text-sm font-bold text-neutral-900">Sort results</h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`rounded-xl border p-3 text-left text-xs font-semibold transition ${
                      isSelected
                        ? "border-[#FF385C] bg-rose-50/50 text-[#FF385C] font-bold ring-1 ring-[#FF385C]"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
          <button
            onClick={handleClear}
            type="button"
            className="text-xs font-bold text-neutral-800 underline underline-offset-4 hover:text-neutral-950 transition"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            type="button"
            className="rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-7 py-3 text-xs font-bold text-white shadow-md shadow-[#FF385C]/25 transition hover:brightness-105 active:scale-95"
          >
            Show stays {totalMatchesCount !== undefined ? `(${totalMatchesCount})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

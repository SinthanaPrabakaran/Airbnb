"use client";

import React, { useMemo } from "react";
import { Star, ShieldAlert, Sparkles } from "lucide-react";
import { ListingDetail } from "@/types";
import { DateRangePicker } from "./DateRangePicker";
import { GuestSelector } from "./GuestSelector";
import { PriceBreakdown } from "./PriceBreakdown";

interface BookingCardProps {
  listing: ListingDetail;
  checkIn: string;
  checkOut: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
  guests: number;
  onGuestsChange: (guests: number) => void;
  unavailableDates: string[];
  onReserve: () => void;
}

export function BookingCard({
  listing,
  checkIn,
  checkOut,
  onSelectDates,
  guests,
  onGuestsChange,
  unavailableDates,
  onReserve,
}: BookingCardProps) {
  // Compute nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [checkIn, checkOut]);

  // Validation
  const hasDates = Boolean(checkIn && checkOut && nights > 0);
  const isValid = hasDates && guests <= listing.max_guests;

  return (
    <>
      {/* DESKTOP STICKY BOOKING CARD */}
      <aside className="hidden lg:block sticky top-28 z-20 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-5">
        {/* Price & Rating Header */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-neutral-900">
              ₹{Math.round(listing.price_per_night).toLocaleString()}
            </span>
            <span className="text-sm font-normal text-neutral-500">night</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-neutral-900">
            <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
            <span>
              {listing.average_rating ? listing.average_rating.toFixed(2) : "New"}
            </span>
            {listing.review_count > 0 && (
              <span className="text-neutral-500 font-normal">
                ({listing.review_count})
              </span>
            )}
          </div>
        </div>

        {/* Picker Inputs: Date Range & Guests */}
        <div className="rounded-2xl border border-neutral-300 overflow-hidden divide-y divide-neutral-200">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onSelectDates={onSelectDates}
            unavailableDates={unavailableDates}
          />

          <GuestSelector
            guests={guests}
            onGuestsChange={onGuestsChange}
            maxGuests={listing.max_guests}
          />
        </div>

        {/* Reserve CTA Button */}
        <div>
          <button
            onClick={onReserve}
            type="button"
            className="w-full rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] py-3.5 text-sm font-bold text-white shadow-md shadow-[#FF385C]/30 transition hover:brightness-105 active:scale-98"
          >
            {hasDates ? "Reserve" : "Check availability"}
          </button>

          <p className="mt-2.5 text-center text-xs text-neutral-500 font-normal">
            You won't be charged yet
          </p>
        </div>

        {/* Transparent Price Breakdown */}
        {hasDates && (
          <PriceBreakdown
            pricePerNight={listing.price_per_night}
            cleaningFee={listing.cleaning_fee}
            serviceFeeRate={listing.service_fee}
            nights={nights}
          />
        )}

        {/* Rare Find / High Demand Note */}
        <div className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3.5 border border-neutral-100">
          <Sparkles className="h-4 w-4 text-[#FF385C] shrink-0 mt-0.5" />
          <p className="text-[11px] text-neutral-600 leading-snug">
            <span className="font-bold text-neutral-900">Rare find!</span> This property is usually booked weeks in advance.
          </p>
        </div>
      </aside>

      {/* MOBILE STICKY BOTTOM BAR (visible on screens smaller than lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 px-5 py-3.5 shadow-2xl backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-neutral-900">
                ₹{Math.round(listing.price_per_night).toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-normal">night</span>
            </div>
            <p className="text-[11px] font-semibold text-neutral-700 underline truncate">
              {hasDates ? `${checkIn.slice(5)} – ${checkOut.slice(5)}` : "Select dates"}
            </p>
          </div>

          <button
            onClick={onReserve}
            type="button"
            className="rounded-xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#FF385C]/30 transition active:scale-95"
          >
            {hasDates ? "Reserve" : "Check availability"}
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import React from "react";

interface PriceBreakdownProps {
  pricePerNight: number;
  cleaningFee: number;
  serviceFeeRate?: number;
  nights: number;
}

export function PriceBreakdown({
  pricePerNight,
  cleaningFee,
  serviceFeeRate = 0.14,
  nights,
}: PriceBreakdownProps) {
  if (nights <= 0) return null;

  const nightlyTotal = Math.round(pricePerNight * nights);
  const calculatedServiceFee = Math.round(nightlyTotal * (serviceFeeRate > 0 ? serviceFeeRate : 0.14));
  const total = Math.round(nightlyTotal + cleaningFee + calculatedServiceFee);

  return (
    <div className="space-y-3 pt-4 text-xs font-normal text-neutral-600">
      {/* 1. Nightly Rate x Nights */}
      <div className="flex items-center justify-between">
        <span className="underline decoration-dotted underline-offset-4">
          ₹{Math.round(pricePerNight).toLocaleString()} × {nights} {nights === 1 ? "night" : "nights"}
        </span>
        <span className="font-semibold text-neutral-900">
          ₹{nightlyTotal.toLocaleString()}
        </span>
      </div>

      {/* 2. Cleaning Fee */}
      {cleaningFee > 0 && (
        <div className="flex items-center justify-between">
          <span className="underline decoration-dotted underline-offset-4">
            Cleaning fee
          </span>
          <span className="font-semibold text-neutral-900">
            ₹{Math.round(cleaningFee).toLocaleString()}
          </span>
        </div>
      )}

      {/* 3. Service Fee */}
      <div className="flex items-center justify-between">
        <span className="underline decoration-dotted underline-offset-4">
          Service fee
        </span>
        <span className="font-semibold text-neutral-900">
          ₹{calculatedServiceFee.toLocaleString()}
        </span>
      </div>

      {/* 4. Total Before Taxes */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-extrabold text-neutral-900">
        <span>Total</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import {
  X,
  HelpCircle,
  Sparkles,
  CreditCard,
  Users,
  Compass,
  Heart,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-[#FF385C]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2 id="help-modal-title" className="text-base font-bold text-neutral-900">
              Help & Demo Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition"
            aria-label="Close help modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Persona Switcher */}
          <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Users className="h-4 w-4 text-[#FF385C]" />
              <span>Multi-Persona System</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              You can toggle between <strong>Guest</strong> (Sarah, Alex, Liam) and <strong>Host</strong> (Elena, Marcus, Chloe) at any time via the profile dropdown. Switching personas immediately updates your trips, host listings, and permissions.
            </p>
          </div>

          {/* Section 2: Bookings & Checkout */}
          <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <span>Realistic Checkout & Sandbox Payments</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Test bookings with instant pre-filled test cards. All calculations (nights, cleaning fees, 14% service fees, and totals in ₹) are authoritatively computed and enforced by the backend database.
            </p>
          </div>

          {/* Section 3: Wishlists & Favorites */}
          <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <Heart className="h-4 w-4 text-[#FF385C]" />
              <span>Live Wishlists & Instant Updates</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Tap the heart icon on any listing to save it to your personal wishlist at <code className="bg-neutral-200 px-1 py-0.5 rounded text-[11px]">/wishlists</code>. Un-favoriting updates the grid optimistically with instant toast feedback.
            </p>
          </div>

          {/* Section 4: Host Mode */}
          <div className="rounded-2xl border border-neutral-200 p-4 bg-neutral-50/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Host Suite & Security</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Access the Host Dashboard at <code className="bg-neutral-200 px-1 py-0.5 rounded text-[11px]">/host</code> to publish new listings, view active reservations, edit details, and track estimated revenue. Only listing owners can edit or delete their properties.
            </p>
          </div>

          {/* Quick FAQ summary */}
          <div className="border-t border-neutral-100 pt-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Quick FAQ
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Free cancellation:</strong> Available up to 48 hours prior to check-in on confirmed stays.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Currency standard:</strong> All marketplace rates and pricing breakdowns use Indian Rupee (₹).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-neutral-800"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

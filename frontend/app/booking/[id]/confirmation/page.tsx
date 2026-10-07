"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  CreditCard,
  Printer,
  ChevronRight,
  Compass,
  Home,
  MessageSquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { BookingDetail } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const resolvedParams = use(params);
  const bookingId = Number(resolvedParams.id);
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId || isNaN(bookingId)) {
      setError("Invalid reservation ID");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api.bookings
      .getById(bookingId)
      .then((data) => {
        if (!isMounted) return;
        setBooking(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load reservation confirmation");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Spinner size="lg" className="mx-auto text-[#FF385C]" />
          <h2 className="text-sm font-bold text-neutral-800">Finalizing confirmation...</h2>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-3">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-neutral-900">Reservation Not Found</h1>
        <p className="mt-1 text-xs text-neutral-500 max-w-sm">{error || "Unable to find confirmation details."}</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const reservationCode = `HM-${(booking.id * 7393 + 10420).toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-neutral-50/60 text-neutral-900 antialiased flex flex-col">
      {/* Top Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-[#FF385C]">
            stayhub
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition"
            >
              <Printer className="h-3.5 w-3.5 text-neutral-500" />
              <span>Print Receipt</span>
            </button>
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              <Compass className="h-3.5 w-3.5 text-white" />
              <span>My Trips</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-8">
        {/* Success Banner */}
        <div className="rounded-3xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 mb-1">
                  Confirmed & Paid
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                  Reservation confirmed! You're going to {booking.listing_city || "your destination"}.
                </h1>
                <p className="mt-1 text-xs text-neutral-500">
                  A receipt and full check-in guide has been sent to {booking.guest_email || "your email"}.
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0 rounded-2xl bg-neutral-50 p-3 sm:p-3.5 border border-neutral-100">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Confirmation Code
              </span>
              <span className="text-sm sm:text-base font-mono font-black text-neutral-900 tracking-wider">
                {reservationCode}
              </span>
            </div>
          </div>

          {/* Property Card Highlight */}
          <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-neutral-50 p-4 sm:p-5 border border-neutral-200/70">
            <div className="relative h-40 w-full sm:w-56 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
              {booking.cover_image ? (
                <Image
                  src={booking.cover_image}
                  alt={booking.listing_title || "Stay"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                />
              ) : null}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FF385C]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{booking.property_type || "Entire Home"}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 line-clamp-2">
                {booking.listing_title}
              </h2>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span>
                  {booking.listing_location ? `${booking.listing_location}, ` : ""}
                  {booking.listing_city}, {booking.listing_country}
                </span>
              </p>
              {booking.host_name && (
                <div className="flex items-center gap-2 pt-1 text-xs text-neutral-600 font-medium">
                  {booking.host_avatar ? (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full">
                      <Image
                        src={booking.host_avatar}
                        alt={booking.host_name}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                  ) : null}
                  <span>Hosted by <strong>{booking.host_name}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Key Reservation Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="rounded-2xl border border-neutral-200 p-4 bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-[#FF385C]" />
                <span>Check-in</span>
              </div>
              <p className="text-sm font-extrabold text-neutral-900">{booking.check_in}</p>
              <p className="text-[11px] text-neutral-400">After 3:00 PM</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4 bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Calendar className="h-4 w-4 text-[#FF385C]" />
                <span>Checkout</span>
              </div>
              <p className="text-sm font-extrabold text-neutral-900">{booking.check_out}</p>
              <p className="text-[11px] text-neutral-400">11:00 AM</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-4 bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Users className="h-4 w-4 text-[#FF385C]" />
                <span>Guests</span>
              </div>
              <p className="text-sm font-extrabold text-neutral-900">
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </p>
              <p className="text-[11px] text-neutral-400">{booking.nights} nights total</p>
            </div>
          </div>

          {/* Total Paid Summary */}
          <div className="rounded-2xl bg-neutral-50 p-5 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-neutral-500">Total amount paid</span>
              <p className="text-xl font-black text-neutral-900">
                ₹{Math.round(booking.total_price).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold">
              <CreditCard className="h-4 w-4" />
              <span>Simulated payment authorization verified</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
            >
              <Home className="h-4 w-4" />
              <span>Explore more stays</span>
            </Link>

            <Link
              href="/trips"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-[#FF385C]/25 transition active:scale-95 text-center"
            >
              <span>View in My Trips</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

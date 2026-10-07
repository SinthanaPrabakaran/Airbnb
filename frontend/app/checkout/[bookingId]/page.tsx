"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  Star,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { BookingDetail } from "@/types";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

interface CheckoutPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = use(params);
  const bookingId = Number(resolvedParams.bookingId);
  const router = useRouter();
  const { showToast } = useToast();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "paypal">("card");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [cardholderName, setCardholderName] = useState("Sarah Jenkins");
  const [zipCode, setZipCode] = useState("10001");
  const [upiId, setUpiId] = useState("sarah@okhdfcbank");

  // Load Booking on mount
  useEffect(() => {
    if (!bookingId || isNaN(bookingId)) {
      setError("Invalid booking ID");
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
        if (data.guest_name) {
          setCardholderName(data.guest_name);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load booking details");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  // Autofill mock test card
  const handleAutofill = () => {
    setCardNumber("4242 4242 4242 4242");
    setExpiry("12/28");
    setCvv("888");
    setCardholderName(booking?.guest_name || "Sarah Jenkins");
    setZipCode("560001");
    showToast("Filled demo card credentials", "info");
  };

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(raw);
  };

  // Handle Pay and Confirm simulation
  const handlePayAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 15) {
        showToast("Please enter a valid 16-digit card number", "error");
        return;
      }
      if (!expiry || expiry.length < 4) {
        showToast("Please enter a valid expiry date (MM/YY)", "error");
        return;
      }
      if (!cvv || cvv.length < 3) {
        showToast("Please enter a valid 3-digit CVV", "error");
        return;
      }
      if (!cardholderName.trim()) {
        showToast("Please enter cardholder name", "error");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId.includes("@")) {
        showToast("Please enter a valid UPI ID (e.g. name@bank)", "error");
        return;
      }
    }

    try {
      setIsProcessing(true);
      showToast("Simulating payment authorization with bank...", "info");

      // Short delay for realistic simulation
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Call backend payment confirmation
      const confirmedBooking = await api.bookings.pay(bookingId);
      setBooking(confirmedBooking);

      showToast("Payment successful! Reservation confirmed.", "success");
      router.push(`/booking/${bookingId}/confirmation`);
    } catch (err: any) {
      showToast(err?.message || "Payment simulation failed. Please try again.", "error");
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-neutral-200 py-6 px-4 sm:px-8">
          <div className="mx-auto max-w-6xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-[#FF385C]">Staybnb</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-4xl py-20 px-4 text-center">
          <Spinner size="lg" className="mx-auto text-[#FF385C]" />
          <h2 className="mt-4 text-base font-bold text-neutral-800">Preparing your reservation...</h2>
          <p className="mt-1 text-xs text-neutral-500">Checking pricing and dates with server</p>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-neutral-200 py-6 px-4 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <Link href="/" className="text-xl font-black text-[#FF385C]">Staybnb</Link>
          </div>
        </header>
        <main className="mx-auto max-w-md py-20 px-4 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">Booking Not Found</h1>
          <p className="text-xs text-neutral-500">{error || "The requested reservation could not be retrieved."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Return to Explore</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/listings/${booking.listing_id}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 transition"
              aria-label="Back to listing"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-700" />
            </Link>
            <Link href="/" className="text-xl font-black tracking-tight text-[#FF385C]">
              Staybnb
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bank-grade 256-bit SSL encryption</span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Confirm and pay
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Reservation #{booking.id} · Created securely
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT COLUMN: Trip summary & Mock Payment Form */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Trip details review */}
            <section className="rounded-3xl border border-neutral-200 p-6 space-y-5 bg-neutral-50/50">
              <h2 className="text-base font-bold text-neutral-900">Your trip</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-neutral-200/80 shadow-xs">
                  <Calendar className="h-5 w-5 text-[#FF385C] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Dates</h3>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      {booking.check_in} to {booking.check_out}
                    </p>
                    <span className="text-[11px] text-neutral-400">
                      {booking.nights} {booking.nights === 1 ? "night" : "nights"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-white p-4 border border-neutral-200/80 shadow-xs">
                  <Users className="h-5 w-5 text-[#FF385C] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Guests</h3>
                    <p className="text-xs text-neutral-600 font-medium mt-0.5">
                      {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                    </p>
                    <span className="text-[11px] text-neutral-400">Entire property</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Mock Payment Section */}
            <section className="space-y-6">
              {/* Highlight Banner clearly stating MOCK PAYMENT */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4.5 flex items-start justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Sandbox Demonstration:</span> This application does NOT process real financial payments. No real card will ever be charged.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutofill}
                  className="shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-[11px] font-bold text-white transition shadow-xs"
                >
                  Autofill test data
                </button>
              </div>

              {/* Payment Method Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-neutral-900">Pay with</h2>
                  <span className="text-xs text-neutral-500 font-medium">Demo gateway</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition ${
                      paymentMethod === "card"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition ${
                      paymentMethod === "upi"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-sm">⚡</span>
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition ${
                      paymentMethod === "paypal"
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <span className="text-sm">🌐</span>
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayAndConfirm} className="space-y-4">
                {paymentMethod === "card" ? (
                  <div className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-4 shadow-xs">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                        Card number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm font-mono tracking-wide text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                        <CreditCard className="absolute right-3.5 top-3 h-4 w-4 text-neutral-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          value={expiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                          placeholder="123"
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                          Cardholder name
                        </label>
                        <input
                          type="text"
                          required
                          value={cardholderName}
                          onChange={(e) => setCardholderName(e.target.value)}
                          placeholder="Name on card"
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                          Postal code
                        </label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="560001"
                          className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : paymentMethod === "upi" ? (
                  <div className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Virtual Payment Address (UPI ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    />
                    <p className="text-[11px] text-neutral-500">
                      A simulated instant notification will confirm this payment.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-300 bg-white p-5 space-y-3">
                    <p className="text-xs text-neutral-600">
                      Selected: <strong>Instant Bank Net Banking (Demo Sandbox)</strong>. You will be redirected after confirmation.
                    </p>
                  </div>
                )}

                {/* Ground Rules & Cancellation Policy */}
                <div className="pt-4 space-y-3 text-xs text-neutral-500">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Free cancellation</strong> within 48 hours of booking. Cancel directly from My Trips.
                    </p>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    By clicking the button below, you agree to the Host's House Rules, Ground Rules for Guests, and Staybnb's Terms of Service.
                  </p>
                </div>

                {/* Submit Pay and Confirm Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] py-4 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/30 transition hover:brightness-105 active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authorizing payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Pay ₹{Math.round(booking.total_price).toLocaleString()} and confirm</span>
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* RIGHT COLUMN: Sticky Listing Summary & Price Breakdown */}
          <div className="lg:col-span-5">
            <aside className="sticky top-28 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-6">
              {/* Listing Card Preview */}
              <div className="flex gap-4 items-start pb-6 border-b border-neutral-200">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                  {booking.cover_image ? (
                    <Image
                      src={booking.cover_image}
                      alt={booking.listing_title || "Property"}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      Stay
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    {booking.property_type || "Entire place"}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug line-clamp-2">
                    {booking.listing_title || "Beautiful Stay"}
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    {booking.listing_city}, {booking.listing_country}
                  </p>
                  {booking.host_name && (
                    <p className="text-[11px] text-neutral-400">
                      Hosted by {booking.host_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Price Details Breakdown */}
              <div className="space-y-3.5 text-xs">
                <h3 className="font-bold text-neutral-900 text-sm">Price details</h3>

                <div className="flex items-center justify-between text-neutral-600">
                  <span>
                    ₹{Math.round(booking.nightly_total / (booking.nights || 1)).toLocaleString()} × {booking.nights} {booking.nights === 1 ? "night" : "nights"}
                  </span>
                  <span className="font-semibold text-neutral-900">
                    ₹{Math.round(booking.nightly_total).toLocaleString()}
                  </span>
                </div>

                {booking.cleaning_fee > 0 && (
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Cleaning fee</span>
                    <span className="font-semibold text-neutral-900">
                      ₹{Math.round(booking.cleaning_fee).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600">
                  <span>Service fee (14%)</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{Math.round(booking.service_fee).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-extrabold text-neutral-900">
                  <span>Total (INR)</span>
                  <span>₹{Math.round(booking.total_price).toLocaleString()}</span>
                </div>
              </div>

              {/* Security & Guarantee Note */}
              <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-100 flex items-start gap-3 text-xs text-neutral-600">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-neutral-900 text-xs">AirCover Protection</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    Your booking includes free protection from Host cancellations, listing inaccuracies, and other check-in issues.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

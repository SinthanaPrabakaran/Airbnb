"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Calendar,
  Users,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  ExternalLink,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { BookingDetail } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

interface BookingDetailsModalProps {
  booking: BookingDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingCancelled?: (cancelledBooking: BookingDetail) => void;
  currentUserId?: number;
}

export function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onBookingCancelled,
  currentUserId = 1,
}: BookingDetailsModalProps) {
  const { showToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!isOpen || !booking) return null;

  const reservationCode = `HM-${(booking.id * 7393 + 10420).toString(36).toUpperCase()}`;

  const handleCancelBooking = async () => {
    try {
      setIsCancelling(true);
      const updated = await api.bookings.cancel(booking.id, currentUserId);
      showToast("Reservation successfully cancelled", "info");
      setShowConfirmCancel(false);
      if (onBookingCancelled) {
        onBookingCancelled(updated);
      }
      onClose();
    } catch (err: any) {
      showToast(err?.message || "Failed to cancel booking", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending Payment</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600">
            <Ban className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-neutral-200">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-neutral-900">Reservation Details</h2>
            {getStatusBadge(booking.status)}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Property Banner */}
          <div className="flex flex-col sm:flex-row gap-4 items-start rounded-2xl bg-neutral-50 p-4 border border-neutral-200/80">
            <div className="relative h-28 w-full sm:w-36 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
              {booking.cover_image ? (
                <Image
                  src={booking.cover_image}
                  alt={booking.listing_title || "Property"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 144px"
                />
              ) : null}
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {booking.property_type || "Entire place"}
              </span>
              <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2">
                {booking.listing_title}
              </h3>
              <p className="flex items-center gap-1 text-xs text-neutral-500 font-medium">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                <span>
                  {booking.listing_city}, {booking.listing_country}
                </span>
              </p>
              <div className="pt-2">
                <Link
                  href={`/listings/${booking.listing_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF385C] hover:underline"
                >
                  <span>View listing page</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Key Stay Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-neutral-200 p-3.5 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Calendar className="h-3.5 w-3.5 text-[#FF385C]" />
                <span>Check-in</span>
              </div>
              <p className="mt-1 text-sm font-bold text-neutral-900">{booking.check_in}</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-3.5 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Calendar className="h-3.5 w-3.5 text-[#FF385C]" />
                <span>Check-out</span>
              </div>
              <p className="mt-1 text-sm font-bold text-neutral-900">{booking.check_out}</p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-neutral-200 p-3.5 bg-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                <Users className="h-3.5 w-3.5 text-[#FF385C]" />
                <span>Guests</span>
              </div>
              <p className="mt-1 text-sm font-bold text-neutral-900">
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </p>
            </div>
          </div>

          {/* Reservation Code & Host */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Confirmation code
              </span>
              <p className="font-mono text-sm font-black text-neutral-900">{reservationCode}</p>
            </div>

            {booking.host_name && (
              <div className="flex items-center gap-2.5">
                {booking.host_avatar ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <Image
                      src={booking.host_avatar}
                      alt={booking.host_name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : null}
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 block">Host</span>
                  <span className="text-xs font-bold text-neutral-800">{booking.host_name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl border border-neutral-200 p-4 space-y-3 bg-white text-xs">
            <h4 className="font-bold text-neutral-900 text-xs">Payment Breakdown</h4>

            <div className="flex items-center justify-between text-neutral-600">
              <span>Nightly rate subtotal ({booking.nights} nights)</span>
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
              <span>Service fee</span>
              <span className="font-semibold text-neutral-900">
                ₹{Math.round(booking.service_fee).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-extrabold text-neutral-900">
              <span>Total Price</span>
              <span>₹{Math.round(booking.total_price).toLocaleString()}</span>
            </div>
          </div>

          {/* Cancellation Actions */}
          {booking.status !== "cancelled" && (
            <div className="pt-2">
              {!showConfirmCancel ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmCancel(true)}
                  className="w-full rounded-2xl border border-rose-200 bg-rose-50/50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                >
                  Cancel this reservation
                </button>
              ) : (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-rose-900">
                    <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Are you sure you want to cancel?</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        These dates will immediately be made available to other guests.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmCancel(false)}
                      className="rounded-xl border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      Keep reservation
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={handleCancelBooking}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                    >
                      {isCancelling ? "Cancelling..." : "Confirm cancellation"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

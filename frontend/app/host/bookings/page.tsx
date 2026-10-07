"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Clock,
  Ban,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { BookingDetail, User } from "@/types";
import { HostHeader } from "@/components/host/HostHeader";
import { BookingTable } from "@/components/host/BookingTable";
import { StatsCard } from "@/components/host/StatsCard";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";

export default function HostBookingsPage() {
  const { showToast } = useToast();

  const [currentHost, setCurrentHost] = useState<User>(DEFAULT_CURRENT_HOST);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async (hostId: number) => {
    setIsLoading(true);
    try {
      const data = await api.host.getBookings(hostId);
      setBookings(data);
    } catch (err: any) {
      showToast("Unable to load reservations", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((users) => {
      if (!isMounted) return;
      const hostId = getCurrentHostId();
      const hostUser = users.find((u) => u.id === hostId) || DEFAULT_CURRENT_HOST;
      setCurrentHost(hostUser);
      fetchBookings(hostUser.id);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchBookings]);

  const handleSelectHost = (host: User) => {
    setCurrentHost(host);
    fetchBookings(host.id);
  };

  // Metrics
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const upcomingCount = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.check_in) >= new Date()
  ).length;
  const totalPayout = activeBookings.reduce(
    (acc, b) => acc + (b.total_price ? b.total_price * 0.86 : 0),
    0
  );

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 antialiased flex flex-col">
      <HostHeader currentHost={currentHost} onSelectHost={handleSelectHost} />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Guest Reservations
          </h1>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            Review incoming traveler bookings across all properties you host
          </p>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total Bookings"
            value={bookings.length}
            subtitle={`${activeBookings.length} confirmed stays`}
            icon={Calendar}
            color="rose"
          />
          <StatsCard
            title="Upcoming Stays"
            value={upcomingCount}
            subtitle="Scheduled in the future"
            icon={Clock}
            color="emerald"
          />
          <StatsCard
            title="Total Payouts"
            value={`₹${Math.round(totalPayout).toLocaleString()}`}
            subtitle="Net host earnings"
            icon={DollarSign}
            color="blue"
          />
        </div>

        {/* Reservations Table */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Spinner size="lg" className="mx-auto text-[#FF385C]" />
            <p className="mt-4 text-xs font-bold text-neutral-600">Loading reservations...</p>
          </div>
        ) : (
          <BookingTable bookings={bookings} />
        )}
      </main>
    </div>
  );
}

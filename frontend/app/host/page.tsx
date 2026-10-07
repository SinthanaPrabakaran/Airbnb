"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Layers,
  Calendar,
  DollarSign,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Building,
} from "lucide-react";
import { api } from "@/lib/api";
import { BookingDetail, ListingSummary, User } from "@/types";
import { HostHeader } from "@/components/host/HostHeader";
import { StatsCard } from "@/components/host/StatsCard";
import { HostListingCard } from "@/components/host/HostListingCard";
import { BookingTable } from "@/components/host/BookingTable";
import { ConfirmDialog } from "@/components/host/ConfirmDialog";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";

export default function HostDashboardPage() {
  const { showToast } = useToast();

  const [currentHost, setCurrentHost] = useState<User>(DEFAULT_CURRENT_HOST);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Deletion modal state
  const [listingToDelete, setListingToDelete] = useState<ListingSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch host data
  const fetchHostData = useCallback(async (hostId: number) => {
    setIsLoading(true);
    try {
      const [hostListings, hostBookings] = await Promise.all([
        api.host.getListings(hostId),
        api.host.getBookings(hostId),
      ]);
      setListings(hostListings);
      setBookings(hostBookings);
    } catch (err: any) {
      console.error("Error loading host data", err);
      showToast("Unable to load host dashboard metrics", "error");
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
      fetchHostData(hostUser.id);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchHostData]);

  const handleSelectHost = (host: User) => {
    setCurrentHost(host);
    fetchHostData(host.id);
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      setIsDeleting(true);
      await api.host.deleteListing(listingToDelete.id, currentHost.id);
      showToast(`Property "${listingToDelete.title}" removed successfully`, "success");
      setListings((prev) => prev.filter((l) => l.id !== listingToDelete.id));
      setListingToDelete(null);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to delete listing";
      showToast(msg, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute Metrics
  const totalListings = listings.length;
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const totalBookingsCount = activeBookings.length;
  const upcomingStays = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.check_in) >= new Date()
  ).length;

  const estimatedRevenue = activeBookings.reduce(
    (acc, b) => acc + (b.total_price ? b.total_price * 0.86 : 0),
    0
  );

  const ratedListings = listings.filter((l) => l.average_rating !== null);
  const averageRating =
    ratedListings.length > 0
      ? (
          ratedListings.reduce((acc, l) => acc + (l.average_rating || 0), 0) /
          ratedListings.length
        ).toFixed(2)
      : "5.0";

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 antialiased flex flex-col">
      <HostHeader currentHost={currentHost} onSelectHost={handleSelectHost} />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-10">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Welcome back, {currentHost.name.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Here's how your properties are performing across the marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/host/listings/new"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF385C]/20 transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Listing</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" className="mx-auto text-[#FF385C]" />
            <p className="mt-4 text-xs font-bold text-neutral-600">Loading your hosting statistics...</p>
          </div>
        ) : (
          <>
            {/* KPI Metrics Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatsCard
                title="Total Listings"
                value={totalListings}
                subtitle={`${totalListings} live on explore`}
                icon={Layers}
                color="rose"
              />
              <StatsCard
                title="Active Bookings"
                value={totalBookingsCount}
                subtitle={`${upcomingStays} upcoming stays`}
                icon={Calendar}
                color="emerald"
              />
              <StatsCard
                title="Estimated Revenue"
                value={`₹${Math.round(estimatedRevenue).toLocaleString()}`}
                subtitle="Net host earnings"
                icon={DollarSign}
                color="blue"
              />
              <StatsCard
                title="Average Rating"
                value={averageRating}
                subtitle="Based on guest reviews"
                icon={Star}
                color="amber"
              />
            </section>

            {/* Recent Listings Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Your Properties</h2>
                  <p className="text-xs text-neutral-500">Manage rates, amenities, and photos</p>
                </div>
                <Link
                  href="/host/listings"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF385C] hover:underline"
                >
                  <span>View all ({totalListings})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {listings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-neutral-300 p-10 text-center space-y-3 bg-white">
                  <Building className="h-10 w-10 text-neutral-300 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-800">You haven't published any listings yet</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    List your home, villa, or apartment on staybnb to start receiving reservations.
                  </p>
                  <Link
                    href="/host/listings/new"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition mt-2"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create your first listing</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.slice(0, 3).map((listing) => (
                    <HostListingCard
                      key={listing.id}
                      listing={listing}
                      onDeleteClick={(l) => setListingToDelete(l)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Reservations Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Recent Reservations</h2>
                  <p className="text-xs text-neutral-500">Incoming traveler bookings and occupancy</p>
                </div>
                <Link
                  href="/host/bookings"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF385C] hover:underline"
                >
                  <span>View all reservations ({bookings.length})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <BookingTable bookings={bookings.slice(0, 5)} />
            </section>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(listingToDelete)}
        title="Delete Listing"
        message={`Are you sure you want to permanently delete "${listingToDelete?.title}"? This listing will be immediately removed from the Explore page.`}
        confirmLabel="Delete listing"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteListing}
        onCancel={() => setListingToDelete(null)}
      />
    </div>
  );
}

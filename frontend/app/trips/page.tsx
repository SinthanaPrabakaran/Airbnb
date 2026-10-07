"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  Sparkles,
  Plane,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Ban,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { BookingDetail, User } from "@/types";
import { Header } from "@/components/Header";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { BookingDetailsModal } from "@/components/trips/BookingDetailsModal";
import { MobileNav } from "@/components/MobileNav";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getCurrentUserId, setCurrentUserId } from "@/lib/current-user";

export default function MyTripsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected trip for details modal
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tabs
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "cancelled">("all");

  // Wishlist state for Header integration
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // 1. Initial users load and current user selection
  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((data) => {
      if (!isMounted) return;
      setUsers(data);
      const savedUserId = getCurrentUserId();
      const active = data.find((u) => u.id === savedUserId) || data[0];
      if (active) setCurrentUser(active);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch trips for current user
  const fetchTrips = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const userBookings = await api.bookings.getUserTrips(userId);
      setBookings(userBookings);
    } catch (err: any) {
      console.error("Failed to load user trips", err);
      setError("Unable to load your trips. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      setCurrentUserId(currentUser.id);
      Promise.resolve().then(() => {
        if (isMounted) {
          fetchTrips(currentUser.id);
          api.favorites.getByUser(currentUser.id).then((favs) => {
            if (isMounted) setFavoritesList(favs);
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchTrips]);

  // Handle persona switch
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    showToast(`Switched active profile to ${user.name}`, "info");
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "cancelled") return b.status === "cancelled";
    if (activeTab === "upcoming") return b.status !== "cancelled";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <Clock className="h-3 w-3" />
            <span>Pending Payment</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600">
            <Ban className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 antialiased flex flex-col">
      {/* 1. Global Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        favoritesCount={favoritesList.length}
        onOpenFavorites={() => setIsWishlistOpen(true)}
        onOpenFilters={() => router.push("/")}
      />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 space-y-8">
        {/* Title & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Trips
            </h1>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Manage your upcoming reservations, stay receipts, and itinerary.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 rounded-2xl bg-neutral-100 p-1 text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-1.5 transition ${
                activeTab === "all"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-xl px-4 py-1.5 transition ${
                activeTab === "upcoming"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Upcoming ({bookings.filter((b) => b.status !== "cancelled").length})
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`rounded-xl px-4 py-1.5 transition ${
                activeTab === "cancelled"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-24 text-center">
            <Spinner size="lg" className="mx-auto text-[#FF385C]" />
            <p className="mt-4 text-xs font-bold text-neutral-600">Loading your reservations...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900">{error}</h3>
            <button
              onClick={() => currentUser?.id && fetchTrips(currentUser.id)}
              className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="rounded-3xl border border-dashed border-neutral-300 py-16 px-6 text-center space-y-4 max-w-lg mx-auto my-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-[#FF385C] mx-auto">
              <Compass className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-900">No trips booked... yet!</h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Time to dust off your bags and start planning your next adventure. Explore thousands of unique stays worldwide.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#FF385C]/25 transition"
            >
              <span>Start searching</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && !error && filteredBookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((b) => (
              <article
                key={b.id}
                className="group relative flex flex-col rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300"
              >
                {/* Trip Card Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  {b.cover_image ? (
                    <Image
                      src={b.cover_image}
                      alt={b.listing_title || "Trip stay"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                      Stay
                    </div>
                  )}

                  {/* Status Badge in overlay */}
                  <div className="absolute top-3 left-3 shadow-xs">
                    {getStatusBadge(b.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5 space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      {b.property_type || "Stay"} · #{b.id}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#FF385C] transition">
                      {b.listing_title}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-neutral-500 font-medium mt-1">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">
                        {b.listing_city}, {b.listing_country}
                      </span>
                    </p>
                  </div>

                  {/* Dates & Guests */}
                  <div className="rounded-2xl bg-neutral-50 p-3.5 space-y-2 border border-neutral-100 text-xs">
                    <div className="flex items-center justify-between text-neutral-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#FF385C]" />
                        <span className="font-semibold">{b.check_in} – {b.check_out}</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        {b.nights} {b.nights === 1 ? "night" : "nights"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-600 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{b.guests} {b.guests === 1 ? "guest" : "guests"}</span>
                      </div>
                      <span className="font-extrabold text-neutral-900 text-xs">
                        ₹{Math.round(b.total_price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBooking(b);
                        setIsModalOpen(true);
                      }}
                      className="rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
                    >
                      View details
                    </button>

                    <Link
                      href={`/listings/${b.listing_id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:underline"
                    >
                      <span>Property</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookingCancelled={(cancelledBooking) => {
          setBookings((prev) =>
            prev.map((item) => (item.id === cancelledBooking.id ? cancelledBooking : item))
          );
        }}
        currentUserId={currentUser?.id || 1}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        favorites={favoritesList}
        onRemoveFavorite={async (id) => {
          if (currentUser) {
            await api.favorites.remove(currentUser.id, id);
            setFavoritesList((prev) => prev.filter((f) => f.id !== id));
          }
        }}
        onSelectListing={(l) => {
          setIsWishlistOpen(false);
          router.push(`/listings/${l.id}`);
        }}
        userName={currentUser?.name || "Guest"}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav favoritesCount={favoritesList.length} />
    </div>
  );
}

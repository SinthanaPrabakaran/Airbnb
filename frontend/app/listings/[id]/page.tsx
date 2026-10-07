"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Calendar as CalendarIcon,
  Home,
  AlertTriangle,
  ArrowRight,
  Heart,
} from "lucide-react";
import { api } from "@/lib/api";
import { getCurrentUserId, setCurrentUserId } from "@/lib/current-user";
import { ListingDetail, User } from "@/types";
import { Header } from "@/components/Header";
import { ListingHeader } from "@/components/listing/ListingHeader";
import { ImageGallery } from "@/components/listing/ImageGallery";
import { HostCard } from "@/components/listing/HostCard";
import { AmenitiesGrid } from "@/components/listing/AmenitiesGrid";
import { LocationSection } from "@/components/listing/LocationSection";
import { ReviewsSection } from "@/components/listing/ReviewsSection";
import { BookingCard } from "@/components/listing/BookingCard";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);
  const router = useRouter();
  const { showToast } = useToast();

  // 1. Data States
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. User & Persona States
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());
  const [favoritesList, setFavoritesList] = useState<any[]>([]);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);

  // 3. Description Expand State
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // 4. Booking Selection State
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  // Initial user load
  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((data) => {
      if (!isMounted) return;
      setUsers(data);
      if (data.length > 0) {
        const savedId = getCurrentUserId();
        const active =
          data.find((u) => u.id === savedId) ||
          data.find((u) => u.role === "guest") ||
          data[0];
        setCurrentUser(active);
        setCurrentUserId(active.id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Favorites for current user
  const fetchFavorites = useCallback(async (userId: number) => {
    try {
      const favs = await api.favorites.getByUser(userId);
      setFavoritesList(favs);
      setFavoritesSet(new Set(favs.map((f) => f.id)));
    } catch (err) {
      console.error("Failed to load user favorites", err);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      fetchFavorites(currentUser.id);
    }
  }, [currentUser, fetchFavorites]);

  // Load Listing Details & Availability
  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setError("Invalid listing identifier");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      api.listings.getById(listingId),
      api.listings.getAvailability(listingId),
    ])
      .then(([listingData, availData]) => {
        if (!isMounted) return;
        setListing(listingData);
        setUnavailableDates(availData.unavailable_dates || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load listing details");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  // Toggle Favorite
  const handleToggleFavorite = async () => {
    if (!currentUser || !listing) return;

    const isFav = favoritesSet.has(listing.id);
    try {
      if (isFav) {
        await api.favorites.remove(currentUser.id, listing.id);
        setFavoritesSet((prev) => {
          const next = new Set(prev);
          next.delete(listing.id);
          return next;
        });
        setFavoritesList((prev) => prev.filter((f) => f.id !== listing.id));
        showToast("Removed from wishlist", "info");
      } else {
        await api.favorites.add(currentUser.id, listing.id);
        setFavoritesSet((prev) => new Set(prev).add(listing.id));
        setFavoritesList((prev) => [listing, ...prev]);
        showToast("Saved to wishlist!", "success");
      }
    } catch {
      showToast("Failed to update wishlist", "error");
    }
  };

  // Date selection callback
  const handleSelectDates = (start: string, end: string) => {
    setCheckIn(start);
    setCheckOut(end);
  };

  // Reserve button action: creates authoritative booking in backend and routes to /checkout/[bookingId]
  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      showToast("Please choose check-in and checkout dates to proceed", "info");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      showToast("Checkout date must be strictly after check-in date", "error");
      return;
    }

    if (guests > (listing?.max_guests || 1)) {
      showToast(`Maximum ${listing?.max_guests} guests allowed for this property`, "error");
      return;
    }

    if (!listing) return;

    // Client pre-check for unavailable dates
    const hasOverlap = unavailableDates.some(
      (d) => d >= checkIn && d < checkOut
    );
    if (hasOverlap) {
      showToast("The selected dates overlap with existing bookings. Please select alternative dates.", "error");
      return;
    }

    try {
      setIsReserving(true);
      const guestId = currentUser?.id || getCurrentUserId();

      // Send booking request to backend: POST /api/bookings
      // Payload contains only listing_id, guest_id, check_in, check_out, guests
      const newBooking = await api.bookings.create({
        listing_id: listing.id,
        guest_id: guestId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });

      // Refresh availability for this listing
      try {
        const avail = await api.listings.getAvailability(listing.id);
        setUnavailableDates(avail.unavailable_dates || []);
      } catch {}

      showToast("Reservation started! Proceeding to checkout...", "success");
      router.push(`/checkout/${newBooking.id}`);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to create reservation. Dates may be booked or unavailable.";
      showToast(errorMsg, "error");

      // Refresh availability in case another user just booked the same dates
      try {
        const avail = await api.listings.getAvailability(listing.id);
        setUnavailableDates(avail.unavailable_dates || []);
      } catch {}
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          currentUser={currentUser}
          users={users}
          onSelectUser={(u) => {
          setCurrentUser(u);
          setCurrentUserId(u.id);
        }}
          favoritesCount={favoritesSet.size}
          onOpenFavorites={() => setIsWishlistDrawerOpen(true)}
          onOpenFilters={() => {}}
        />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
          <div className="h-8 w-2/3 rounded-xl bg-neutral-200" />
          <div className="h-4 w-1/3 rounded-lg bg-neutral-200" />
          <div className="aspect-[16/9] md:h-[450px] w-full rounded-3xl bg-neutral-200" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-6 w-1/2 rounded-lg bg-neutral-200" />
              <div className="h-32 w-full rounded-2xl bg-neutral-200" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-96 w-full rounded-3xl bg-neutral-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header
          currentUser={currentUser}
          users={users}
          onSelectUser={(u) => {
          setCurrentUser(u);
          setCurrentUserId(u.id);
        }}
          favoritesCount={favoritesSet.size}
          onOpenFavorites={() => setIsWishlistDrawerOpen(true)}
          onOpenFilters={() => {}}
        />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500 mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">
            Property Not Found
          </h1>
          <p className="mt-1 text-xs text-neutral-500 max-w-sm">
            {error || "The listing you are looking for does not exist or has been removed."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Return to explore</span>
          </Link>
        </main>
      </div>
    );
  }

  const isFavorited = favoritesSet.has(listing.id);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased">
      {/* 1. Consistent Global Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setCurrentUserId(u.id);
        }}
        favoritesCount={favoritesSet.size}
        onOpenFavorites={() => setIsWishlistDrawerOpen(true)}
        onOpenFilters={() => router.push("/")}
      />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 flex-1">
        {/* Back Link Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-neutral-900 transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>All homes</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-700 truncate max-w-xs">{listing.city}</span>
        </div>

        {/* 2. Listing Header with title, ratings, superhost tag, share and favorite */}
        <ListingHeader
          listing={listing}
          isFavorited={isFavorited}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* 3. Image Gallery (Desktop 5-photo grid / Mobile swipeable carousel) */}
        <ImageGallery images={listing.images} title={listing.title} />

        {/* 4. Two-Column Layout (Content on Left, Sticky Booking Card on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-4">
          {/* Left Column (Content & Amenities) */}
          <div className="lg:col-span-7 space-y-10 divide-y divide-neutral-200">
            {/* Highlights & Capacity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                    {listing.property_type} in {listing.city}, {listing.country}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 font-medium">
                    {listing.max_guests} guests · {listing.bedrooms} {listing.bedrooms === 1 ? "bedroom" : "bedrooms"} · {listing.beds} {listing.beds === 1 ? "bed" : "beds"} · {listing.bathrooms} {listing.bathrooms === 1 ? "bath" : "baths"}
                  </p>
                </div>
              </div>

              {/* Host Perks Callout */}
              <div className="space-y-3 pt-3">
                <div className="flex items-start gap-3.5 text-xs">
                  <Sparkles className="h-5 w-5 text-[#FF385C] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-neutral-900">Top 5% of homes</h3>
                    <p className="text-neutral-500">
                      This home is highly ranked based on ratings, reviews, and reliability.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 text-xs">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-neutral-900">Experienced Host</h3>
                    <p className="text-neutral-500">
                      {listing.host?.name || "Host"} has received verified 5-star ratings from past guests.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Description */}
            <div className="pt-8 space-y-3">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                About this space
              </h2>
              <p
                className={`text-sm text-neutral-600 leading-relaxed font-normal whitespace-pre-line ${
                  isDescExpanded ? "" : "line-clamp-4"
                }`}
              >
                {listing.description}
              </p>
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-neutral-900 underline underline-offset-4 hover:text-black transition"
              >
                {isDescExpanded ? "Show less" : "Show more"}
              </button>
            </div>

            {/* Amenities Grid */}
            <div className="pt-8">
              <AmenitiesGrid amenities={listing.amenities} />
            </div>

            {/* Host Section */}
            <div className="pt-8">
              <HostCard host={listing.host} propertyType={listing.property_type} />
            </div>

            {/* Verified Reviews Section */}
            <div className="pt-8">
              <ReviewsSection
                reviews={listing.reviews}
                averageRating={listing.average_rating}
                reviewCount={listing.review_count}
              />
            </div>

            {/* Stylized Location Map Section */}
            <div className="pt-8">
              <LocationSection
                location={listing.location}
                city={listing.city}
                country={listing.country}
                latitude={listing.latitude}
                longitude={listing.longitude}
              />
            </div>
          </div>

          {/* Right Column (Sticky Booking Card) */}
          <div className="lg:col-span-5">
            <BookingCard
              listing={listing}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDates={handleSelectDates}
              guests={guests}
              onGuestsChange={setGuests}
              unavailableDates={unavailableDates}
              onReserve={handleReserve}
              isReserving={isReserving}
            />
          </div>
        </div>
      </main>

      {/* Slide-over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        favorites={favoritesList}
        onRemoveFavorite={async (id) => {
          if (currentUser) {
            await api.favorites.remove(currentUser.id, id);
            setFavoritesSet((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
            setFavoritesList((prev) => prev.filter((f) => f.id !== id));
          }
        }}
        onSelectListing={(l) => {
          setIsWishlistDrawerOpen(false);
          router.push(`/listings/${l.id}`);
        }}
        userName={currentUser?.name || "Guest"}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50/80 py-8 text-neutral-500 text-xs mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© 2026 stayhub, Inc. All rights reserved.</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-neutral-800">
            <span>English (IN)</span>
            <span>₹ INR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

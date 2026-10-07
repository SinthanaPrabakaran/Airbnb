"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Compass,
  ArrowLeft,
  Sparkles,
  Trash2,
  Share2,
  Search,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { ListingSummary, User } from "@/types";
import { Header } from "@/components/Header";
import { ListingCard } from "@/components/ListingCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ListingDetailModal } from "@/components/ListingDetailModal";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/components/ui/toast";
import { getCurrentUserId, setCurrentUserId } from "@/lib/current-user";

export default function WishlistsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ListingSummary | null>(null);

  // 1. Load users & current user persona
  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((data) => {
      if (!isMounted) return;
      setUsers(data);
      const savedUserId = getCurrentUserId();
      const active =
        data.find((u) => u.id === savedUserId) ||
        data.find((u) => u.role === "guest") ||
        data[0];
      if (active) {
        setCurrentUser(active);
        setCurrentUserId(active.id);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch favorites for current user
  const fetchWishlists = useCallback(
    async (userId: number) => {
      setIsLoading(true);
      try {
        const data = await api.favorites.getByUser(userId);
        setFavorites(data);
      } catch (err: any) {
        showToast("Unable to load wishlist items", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      setCurrentUserId(currentUser.id);
      Promise.resolve().then(() => {
        if (isMounted) fetchWishlists(currentUser.id);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchWishlists]);

  // Handle persona switch
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserId(user.id);
    showToast(`Switched active profile to ${user.name}`, "info");
  };

  // Immediate optimistic toggle favorite removal
  const handleToggleFavorite = async (listingId: number) => {
    if (!currentUser) return;

    const removedItem = favorites.find((f) => f.id === listingId);

    // Optimistic UI update: remove immediately
    setFavorites((prev) => prev.filter((f) => f.id !== listingId));
    showToast("Removed from wishlist", "info");

    try {
      await api.favorites.remove(currentUser.id, listingId);
    } catch (err: any) {
      // Revert if error
      if (removedItem) {
        setFavorites((prev) => [removedItem, ...prev]);
      }
      showToast("Failed to remove favorite from server", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased">
      {/* Global Header */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        favoritesCount={favorites.length}
        onOpenFavorites={() => {}}
        onOpenFilters={() => router.push("/")}
        onSearchClick={() => router.push("/")}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Wishlist Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1 hover:text-neutral-900 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Explore</span>
              </Link>
              <span>/</span>
              <span className="text-neutral-800 font-bold">Wishlists</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-[#FF385C]">
                <Heart className="h-5 w-5 fill-[#FF385C]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                  Wishlists
                </h1>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {favorites.length === 1
                    ? "1 stay saved"
                    : `${favorites.length} stays saved`}{" "}
                  for {currentUser?.name || "you"}
                </p>
              </div>
            </div>
          </div>

          {favorites.length > 0 && (
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-800 shadow-xs hover:border-neutral-900 transition active:scale-95"
              >
                <Compass className="h-3.5 w-3.5 text-[#FF385C]" />
                <span>Explore more stays</span>
              </Link>
            </div>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : favorites.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-[#FF385C] mb-6 shadow-xs animate-in zoom-in-75 duration-300">
              <Heart className="h-10 w-10 stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-sm text-neutral-500 leading-relaxed font-normal">
              As you browse accommodations, click the heart icon on any listing card to save your dream stays here for easy access.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-[#FF385C]/25 transition hover:brightness-105 active:scale-95"
              >
                <Compass className="h-4 w-4" />
                <span>Start exploring stays</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Saved Listings Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorited={true}
                onToggleFavorite={handleToggleFavorite}
                onClick={() => router.push(`/listings/${listing.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Quick Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listingSummary={selectedListing}
          onClose={() => setSelectedListing(null)}
          isFavorited={true}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav favoritesCount={favorites.length} />
    </div>
  );
}

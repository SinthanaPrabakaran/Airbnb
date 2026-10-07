"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Layers,
  ArrowUpDown,
  Building,
} from "lucide-react";
import { api } from "@/lib/api";
import { ListingSummary, User } from "@/types";
import { HostHeader } from "@/components/host/HostHeader";
import { HostListingCard } from "@/components/host/HostListingCard";
import { ConfirmDialog } from "@/components/host/ConfirmDialog";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { getCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";

export default function HostListingsPage() {
  const { showToast } = useToast();

  const [currentHost, setCurrentHost] = useState<User>(DEFAULT_CURRENT_HOST);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Sort
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "title">("default");

  // Deletion state
  const [listingToDelete, setListingToDelete] = useState<ListingSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchListings = useCallback(async (hostId: number) => {
    setIsLoading(true);
    try {
      const data = await api.host.getListings(hostId);
      setListings(data);
    } catch (err: any) {
      showToast("Unable to load host listings", "error");
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
      fetchListings(hostUser.id);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchListings]);

  const handleSelectHost = (host: User) => {
    setCurrentHost(host);
    fetchListings(host.id);
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

  // Filter and Sort
  const filteredListings = listings
    .filter((l) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.property_type.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_per_night - b.price_per_night;
      if (sortBy === "price_desc") return b.price_per_night - a.price_per_night;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 antialiased flex flex-col">
      <HostHeader currentHost={currentHost} onSelectHost={handleSelectHost} />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Your Listings
            </h1>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              Manage your {listings.length} published rental properties
            </p>
          </div>

          <Link
            href="/host/listings/new"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF385C]/20 transition active:scale-95 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Listing</span>
          </Link>
        </div>

        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, city, or type..."
              className="w-full rounded-2xl border border-neutral-300 bg-white pl-10 pr-4 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:inline">
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-2xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 focus:border-neutral-900 focus:outline-none"
            >
              <option value="default">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Listings Grid / Empty State */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Spinner size="lg" className="mx-auto text-[#FF385C]" />
            <p className="mt-4 text-xs font-bold text-neutral-600">Loading your properties...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 py-16 px-6 text-center space-y-4 max-w-lg mx-auto my-6 bg-white">
            <Building className="h-12 w-12 text-neutral-300 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-base font-bold text-neutral-900">
                {search ? "No properties match your filter" : "No listings published yet"}
              </h2>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {search
                  ? "Try clearing your search query or sorting options."
                  : "List your property now to start accepting guest bookings."}
              </p>
            </div>
            {!search && (
              <Link
                href="/host/listings/new"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#FF385C] hover:bg-[#E00B41] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF385C]/25 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create listing</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <HostListingCard
                key={listing.id}
                listing={listing}
                onDeleteClick={(l) => setListingToDelete(l)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(listingToDelete)}
        title="Delete Listing"
        message={`Are you sure you want to permanently delete "${listingToDelete?.title}"? This property will be removed immediately from the public Explore page.`}
        confirmLabel="Delete listing"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteListing}
        onCancel={() => setListingToDelete(null)}
      />
    </div>
  );
}

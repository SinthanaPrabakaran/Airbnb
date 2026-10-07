"use client";

import React from "react";
import { ListingSummary } from "@/types";
import { ListingCard } from "./ListingCard";

interface ListingGridProps {
  listings: ListingSummary[];
  favoritesSet: Set<number>;
  onToggleFavorite: (listingId: number) => void;
  onSelectListing?: (listing: ListingSummary) => void;
}

export function ListingGrid({
  listings,
  favoritesSet,
  onToggleFavorite,
  onSelectListing,
}: ListingGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorited={favoritesSet.has(listing.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={() => onSelectListing?.(listing)}
        />
      ))}
    </div>
  );
}

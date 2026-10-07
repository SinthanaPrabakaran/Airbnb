"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ListingSummary } from "@/types";

interface ListingCardProps {
  listing: ListingSummary;
  isFavorited: boolean;
  onToggleFavorite: (listingId: number) => void;
  onClick?: () => void;
}

export function ListingCard({
  listing,
  isFavorited,
  onToggleFavorite,
  onClick,
}: ListingCardProps) {
  // Image carousel state (uses listing.images if available, else falls back to cover_image)
  const images =
    listing.images && listing.images.length > 0
      ? listing.images.map((i) => i.image_url)
      : [
          listing.cover_image ||
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(listing.id);
  };

  const isGuestFavorite =
    (listing.average_rating || 0) >= 4.85 && listing.review_count >= 3;

  const currentImgSrc =
    imageError || !images[currentImageIndex]
      ? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
      : images[currentImageIndex];

  return (
    <article
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#FF385C]/40 rounded-2xl p-1 -m-1"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${listing.title} in ${listing.city}, ${listing.country}`}
    >
      {/* 1. Photo Container with Carousel & Heart Button */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-xs transition duration-300 group-hover:shadow-md">
        <Image
          src={currentImgSrc}
          alt={`${listing.title} photo ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-104"
          onError={() => setImageError(true)}
          unoptimized={!currentImgSrc.includes("unsplash.com")}
        />

        {/* Guest Favourite Badge */}
        {isGuestFavorite && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-neutral-900 shadow-md backdrop-blur-xs">
            <Sparkles className="h-3 w-3 text-[#FF385C]" />
            <span>Guest favourite</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleFavoriteClick}
          type="button"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-75 focus:outline-none"
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-6 w-6 transition-colors duration-200 ${
              isFavorited
                ? "fill-[#FF385C] stroke-[#FF385C] scale-105"
                : "fill-black/35 stroke-white stroke-[2] hover:scale-110"
            }`}
          />
        </button>

        {/* Carousel Arrows (shown on hover if >1 photo) */}
        {images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md backdrop-blur-xs transition hover:scale-110 hover:bg-white active:scale-90"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md backdrop-blur-xs transition hover:scale-110 hover:bg-white active:scale-90"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Carousel Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentImageIndex
                    ? "w-4 bg-white shadow-xs"
                    : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Listing Metadata Content */}
      <div className="mt-3 flex flex-col gap-0.5">
        {/* Row 1: Location & Star Rating */}
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-neutral-900 truncate">
            {listing.city}, {listing.country}
          </h2>
          <div className="flex shrink-0 items-center gap-1 text-xs font-semibold text-neutral-900">
            <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
            <span>
              {listing.average_rating ? listing.average_rating.toFixed(2) : "New"}
            </span>
            {listing.review_count > 0 && (
              <span className="text-neutral-500 font-normal">
                ({listing.review_count})
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Title / Tagline */}
        <p className="text-xs text-neutral-500 line-clamp-1 font-medium">
          {listing.title}
        </p>

        {/* Row 3: Property Type & Capacity */}
        <p className="text-xs text-neutral-500 font-normal">
          {listing.property_type} · Up to {listing.max_guests} guests
          {listing.bedrooms ? ` · ${listing.bedrooms} bed` : ""}
        </p>

        {/* Row 4: Nightly Pricing in ₹ */}
        <div className="mt-1 flex items-baseline gap-1 text-sm">
          <span className="font-extrabold text-neutral-900">
            ₹{Math.round(listing.price_per_night).toLocaleString()}
          </span>
          <span className="text-xs font-normal text-neutral-600">night</span>
        </div>
      </div>
    </article>
  );
}

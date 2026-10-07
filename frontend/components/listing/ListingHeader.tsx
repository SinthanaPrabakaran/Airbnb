"use client";

import React, { useState } from "react";
import { Star, Share2, Heart, Award, MapPin, Check } from "lucide-react";
import { ListingDetail } from "@/types";
import { useToast } from "@/components/ui/toast";

interface ListingHeaderProps {
  listing: ListingDetail;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function ListingHeader({
  listing,
  isFavorited,
  onToggleFavorite,
}: ListingHeaderProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: listing.title,
      text: `Check out this stay on staybnb: ${listing.title} in ${listing.city}, ${listing.country}`,
      url: url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
    }

    // Fallback: clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Listing link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  return (
    <div className="space-y-3 pb-6">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
        {listing.title}
      </h1>

      {/* Subheader: Ratings, Location & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        {/* Left: Star rating, reviews count, Superhost badge, location */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-800 font-semibold">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-neutral-900 text-neutral-900" />
            <span>
              {listing.average_rating ? listing.average_rating.toFixed(2) : "New"}
            </span>
            {listing.review_count > 0 && (
              <span className="text-neutral-500 font-normal">
                ({listing.review_count} reviews)
              </span>
            )}
          </div>

          <span>·</span>

          {listing.host?.role === "host" && (
            <>
              <div className="flex items-center gap-1 text-neutral-700">
                <Award className="h-4 w-4 text-[#FF385C]" />
                <span className="font-semibold text-xs">Superhost</span>
              </div>
              <span>·</span>
            </>
          )}

          <div className="flex items-center gap-1 text-neutral-600 underline font-medium">
            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
            <span>{listing.location}, {listing.city}, {listing.country}</span>
          </div>
        </div>

        {/* Right: Share & Save Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleShare}
            type="button"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-100 active:scale-95"
            aria-label="Share this listing"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Share2 className="h-4 w-4 text-neutral-700" />
            )}
            <span className="underline">{copied ? "Copied" : "Share"}</span>
          </button>

          <button
            onClick={onToggleFavorite}
            type="button"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-neutral-700 transition hover:bg-neutral-100 active:scale-95"
            aria-label={isFavorited ? "Saved to wishlist" : "Save to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "text-neutral-700"
              }`}
            />
            <span className="underline">{isFavorited ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

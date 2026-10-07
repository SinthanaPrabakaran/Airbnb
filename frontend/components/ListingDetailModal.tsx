"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  MapPin,
  Heart,
  Users,
  Bed,
  Bath,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { ListingDetail, ListingSummary } from "@/types";
import { Spinner } from "@/components/ui/spinner";

interface ListingDetailModalProps {
  listingSummary: ListingSummary | null;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (listingId: number) => void;
}

export function ListingDetailModal({
  listingSummary,
  onClose,
  isFavorited,
  onToggleFavorite,
}: ListingDetailModalProps) {
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (!listingSummary) return;

    let isMounted = true;
    setLoading(true);
    setActivePhotoIdx(0);

    api.listings
      .getById(listingSummary.id)
      .then((data) => {
        if (isMounted) setDetail(data);
      })
      .catch((err) => {
        console.error("Failed to load listing detail", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listingSummary]);

  if (!listingSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 md:p-6 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold capitalize text-neutral-800">
              {listingSummary.property_type}
            </span>
            <span className="text-xs text-neutral-500 font-medium truncate">
              {listingSummary.city}, {listingSummary.country}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(listingSummary.id)}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 transition"
              aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorited
                    ? "fill-[#FF385C] text-[#FF385C]"
                    : "text-neutral-700"
                }`}
              />
            </button>
            <button
              onClick={onClose}
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Spinner className="h-8 w-8 text-[#FF385C]" />
              <p className="mt-3 text-xs font-semibold text-neutral-500">
                Loading stay details...
              </p>
            </div>
          ) : (
            <>
              {/* Title & Rating Header */}
              <div>
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {detail?.title || listingSummary.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-700">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-neutral-900 text-neutral-900" />
                    <span>
                      {listingSummary.average_rating
                        ? listingSummary.average_rating.toFixed(2)
                        : "New"}
                    </span>
                    {listingSummary.review_count > 0 && (
                      <span className="text-neutral-500 font-normal">
                        ({listingSummary.review_count} reviews)
                      </span>
                    )}
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1 text-neutral-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{listingSummary.location}</span>
                  </div>
                </div>
              </div>

              {/* Photo Gallery Grid */}
              {detail?.images && detail.images.length > 0 && (
                <div className="space-y-2">
                  <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
                    <img
                      src={detail.images[activePhotoIdx]?.image_url}
                      alt={detail.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {detail.images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition ${
                          activePhotoIdx === idx
                            ? "ring-2 ring-neutral-900 ring-offset-2"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Host & Capacity Overview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-y border-neutral-200 py-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Hosted by {detail?.host?.name || "Superhost"}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-neutral-500">
                    <span>{listingSummary.max_guests} guests</span>
                    <span>·</span>
                    <span>{listingSummary.bedrooms} bedrooms</span>
                    <span>·</span>
                    <span>{listingSummary.beds} beds</span>
                    <span>·</span>
                    <span>{listingSummary.bathrooms} baths</span>
                  </div>
                </div>

                {detail?.host?.avatar && (
                  <img
                    src={detail.host.avatar}
                    alt={detail.host.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                )}
              </div>

              {/* Description */}
              {detail?.description && (
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">
                    About this space
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line font-normal">
                    {detail.description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {detail?.amenities && detail.amenities.length > 0 && (
                <div className="border-t border-neutral-200 pt-5">
                  <h3 className="text-sm font-bold text-neutral-900 mb-3">
                    What this place offers
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {detail.amenities.map((am) => (
                      <div
                        key={am.id}
                        className="flex items-center gap-2 text-xs font-semibold text-neutral-700 bg-neutral-50 rounded-xl p-2.5"
                      >
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{am.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Preview */}
              {detail?.reviews && detail.reviews.length > 0 && (
                <div className="border-t border-neutral-200 pt-5">
                  <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-neutral-900 text-neutral-900" />
                    <span>{detail.reviews.length} Verified Guest Reviews</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {detail.reviews.slice(0, 4).map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-neutral-200 p-3.5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-neutral-900">
                            {r.guest?.name || "Guest"}
                          </p>
                          <div className="flex items-center gap-0.5 text-xs font-bold text-neutral-900">
                            <span>★</span>
                            <span>{r.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-600 line-clamp-3 font-normal">
                          "{r.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Pricing & Reserve CTA */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-neutral-900">
                ₹{Math.round(listingSummary.price_per_night).toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-normal">night</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Total before taxes: ₹{Math.round(listingSummary.price_per_night).toLocaleString()} + fees
            </p>
          </div>

          <a
            href={`/listings/${listingSummary.id}`}
            className="rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-[#FF385C]/30 transition hover:brightness-105 active:scale-95 text-center"
          >
            Check availability
          </a>
        </div>
      </div>
    </div>
  );
}

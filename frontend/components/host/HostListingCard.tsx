"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Edit3,
  Trash2,
  ExternalLink,
  Star,
  MapPin,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import { ListingSummary } from "@/types";

interface HostListingCardProps {
  listing: ListingSummary;
  onDeleteClick: (listing: ListingSummary) => void;
}

export function HostListingCard({ listing, onDeleteClick }: HostListingCardProps) {
  return (
    <article className="group relative flex flex-col rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300">
      {/* Listing Cover Photo */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
        {listing.cover_image ? (
          <Image
            src={listing.cover_image}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No photo
          </div>
        )}

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-800 shadow-xs backdrop-blur-xs">
          {listing.property_type}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{listing.average_rating ? listing.average_rating.toFixed(1) : "New"}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div>
          <h3 className="text-base font-bold text-neutral-900 line-clamp-1 group-hover:text-[#FF385C] transition">
            {listing.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-neutral-500 font-medium mt-1">
            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">
              {listing.city}, {listing.country}
            </span>
          </p>
        </div>

        {/* Price & Specs */}
        <div className="flex items-center justify-between text-xs py-2 border-y border-neutral-100">
          <div>
            <span className="font-extrabold text-neutral-900 text-sm">
              ₹{Math.round(listing.price_per_night).toLocaleString()}
            </span>
            <span className="text-neutral-500 font-normal"> / night</span>
          </div>

          <div className="text-[11px] text-neutral-500 font-medium">
            {listing.max_guests} guests · {listing.bedrooms} bd · {listing.beds} beds
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/host/listings/${listing.id}/edit`}
              className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition"
            >
              <Edit3 className="h-3.5 w-3.5 text-neutral-500" />
              <span>Edit</span>
            </Link>

            <button
              type="button"
              onClick={() => onDeleteClick(listing)}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
              title="Delete property"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <Link
            href={`/listings/${listing.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 hover:underline"
            title="View public live listing"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

"use client";

import React from "react";
import { X, Heart, Trash2, ArrowRight } from "lucide-react";
import { ListingSummary } from "@/types";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: ListingSummary[];
  onRemoveFavorite: (listingId: number) => void;
  onSelectListing: (listing: ListingSummary) => void;
  userName?: string;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onSelectListing,
  userName = "Guest",
}: WishlistDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-[#FF385C] text-[#FF385C]" />
            <h2 className="text-base font-bold text-neutral-900">
              {userName}'s Wishlist
            </h2>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-600 transition"
            aria-label="Close wishlist drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-3">
                <Heart className="h-6 w-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-bold text-neutral-800">
                Your wishlist is empty
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                As you search, tap the heart icon to save your favorite stays and experiences here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {favorites.length} saved {favorites.length === 1 ? "stay" : "stays"}
              </p>

              {favorites.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-3.5 rounded-2xl border border-neutral-200 p-2.5 transition hover:shadow-md hover:border-neutral-300"
                >
                  {/* Photo */}
                  <div
                    onClick={() => {
                      onSelectListing(item);
                      onClose();
                    }}
                    className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 cursor-pointer"
                  >
                    <img
                      src={item.cover_image || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80"}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-baseline justify-between gap-1">
                        <h4
                          onClick={() => {
                            onSelectListing(item);
                            onClose();
                          }}
                          className="text-xs font-bold text-neutral-900 truncate hover:underline cursor-pointer"
                        >
                          {item.city}, {item.country}
                        </h4>
                        <span className="text-xs font-semibold text-neutral-900 shrink-0">
                          ₹{Math.round(item.price_per_night).toLocaleString()}
                          <span className="text-[10px] font-normal text-neutral-500">
                            /nt
                          </span>
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {item.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-medium text-neutral-400">
                        {item.property_type}
                      </span>
                      <button
                        onClick={() => onRemoveFavorite(item.id)}
                        type="button"
                        className="text-neutral-400 hover:text-rose-600 transition p-1"
                        title="Remove from wishlist"
                        aria-label={`Remove ${item.title} from wishlist`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4 bg-neutral-50">
          <button
            onClick={onClose}
            type="button"
            className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}

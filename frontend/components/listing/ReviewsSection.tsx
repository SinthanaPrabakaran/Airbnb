"use client";

import React from "react";
import { Star, ThumbsUp } from "lucide-react";
import { Review } from "@/types";

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating?: number | null;
  reviewCount: number;
}

const CATEGORY_SCORES = [
  { name: "Cleanliness", score: 4.9 },
  { name: "Accuracy", score: 4.9 },
  { name: "Communication", score: 5.0 },
  { name: "Location", score: 4.8 },
  { name: "Check-in", score: 5.0 },
  { name: "Value", score: 4.9 },
];

export function ReviewsSection({
  reviews,
  averageRating,
  reviewCount,
}: ReviewsSectionProps) {
  return (
    <div className="space-y-8">
      {/* Overall Score Header */}
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 fill-neutral-900 text-neutral-900" />
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
          {averageRating ? averageRating.toFixed(2) : "New"} · {reviewCount}{" "}
          {reviewCount === 1 ? "review" : "reviews"}
        </h2>
      </div>

      {/* Category Ratings Bar Grid */}
      {reviewCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3.5 border-b border-neutral-200 pb-8">
          {CATEGORY_SCORES.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <span className="text-neutral-700 font-medium">{cat.name}</span>
              <div className="flex items-center gap-3">
                <div className="h-1 w-24 sm:w-32 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full"
                    style={{ width: `${(cat.score / 5) * 100}%` }}
                  />
                </div>
                <span className="font-bold text-neutral-900 w-6 text-right">
                  {cat.score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Cards Grid */}
      {reviews.length === 0 ? (
        <p className="text-xs text-neutral-500">
          No reviews yet for this listing. Be the first to leave one after your stay!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
          {reviews.map((rev) => (
            <article key={rev.id} className="space-y-3">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                {rev.guest?.avatar ? (
                  <img
                    src={rev.guest.avatar}
                    alt={rev.guest.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-700">
                    {rev.guest?.name?.[0] || "G"}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">
                    {rev.guest?.name || "Verified Guest"}
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {new Date(rev.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Star Rating & Comment */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-900">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-neutral-900 text-neutral-900"
                  />
                ))}
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                "{rev.comment}"
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

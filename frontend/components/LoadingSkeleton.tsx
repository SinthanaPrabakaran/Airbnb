"use client";

import React from "react";

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 12 }: LoadingSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col animate-pulse">
          {/* Image placeholder */}
          <div className="aspect-square w-full rounded-2xl bg-neutral-200" />

          {/* Metadata placeholders */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-2/3 rounded-md bg-neutral-200" />
              <div className="h-4 w-10 rounded-md bg-neutral-200" />
            </div>
            <div className="h-3 w-1/2 rounded-md bg-neutral-200" />
            <div className="h-3 w-1/3 rounded-md bg-neutral-200" />
            <div className="mt-1 h-4 w-24 rounded-md bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { SearchX, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyState({
  title = "No stays found",
  description = "Try adjusting your search criteria, widening your price range, or clearing some filters.",
  onReset,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 mb-4 shadow-inner">
        <SearchX className="h-8 w-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-neutral-500 font-normal leading-relaxed">
        {description}
      </p>
      {onReset && (
        <button
          onClick={onReset}
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear all filters</span>
        </button>
      )}
    </div>
  );
}

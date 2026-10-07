"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <nav
      className="mt-14 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-200 pt-6"
      aria-label="Pagination Navigation"
    >
      <p className="text-xs text-neutral-500 font-medium order-2 sm:order-1">
        Showing <span className="font-bold text-neutral-800">{startItem}</span> to{" "}
        <span className="font-bold text-neutral-800">{endItem}</span> of{" "}
        <span className="font-bold text-neutral-800">{totalItems}</span> total stays
      </p>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          type="button"
          className="flex h-9 items-center gap-1 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            const isCurrent = pageNumber === currentPage;

            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                type="button"
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition ${
                  isCurrent
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
                }`}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isCurrent ? "page" : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          type="button"
          className="flex h-9 items-center gap-1 rounded-xl border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-700 shadow-xs transition hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

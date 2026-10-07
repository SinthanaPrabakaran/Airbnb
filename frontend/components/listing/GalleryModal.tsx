"use client";

import React, { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImage } from "@/types";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ListingImage[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  title: string;
}

export function GalleryModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onSelectIndex,
  title,
}: GalleryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onSelectIndex((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        onSelectIndex((currentIndex + 1) % images.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onSelectIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentImg = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10">
        <button
          onClick={onClose}
          type="button"
          className="flex items-center gap-2 rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
          aria-label="Close fullscreen gallery"
        >
          <X className="h-6 w-6" />
          <span className="text-xs font-bold hidden sm:inline">Close</span>
        </button>

        <span className="text-xs font-semibold text-white/70">
          {currentIndex + 1} / {images.length}
        </span>

        <div className="w-16 text-right text-xs text-white/50 truncate max-w-xs hidden sm:block">
          {title}
        </div>
      </div>

      {/* Main Image Area with Controls */}
      <div className="relative flex flex-1 items-center justify-center p-4 overflow-hidden">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex - 1 + images.length) % images.length)}
            type="button"
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 active:scale-95"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Center Image */}
        <div className="max-h-[75vh] max-w-[85vw] flex items-center justify-center">
          <img
            src={currentImg.image_url}
            alt={`${title} - Photo ${currentIndex + 1}`}
            className="max-h-[75vh] max-w-[85vw] rounded-xl object-contain shadow-2xl transition duration-300"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={() => onSelectIndex((currentIndex + 1) % images.length)}
            type="button"
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/80 hover:scale-105 active:scale-95"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="h-24 shrink-0 border-t border-white/10 bg-black/60 px-4 py-3 flex items-center justify-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-4xl py-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => onSelectIndex(idx)}
                type="button"
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${
                  currentIndex === idx
                    ? "ring-2 ring-white scale-105"
                    : "opacity-40 hover:opacity-80"
                }`}
                aria-label={`View photo ${idx + 1}`}
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
    </div>
  );
}

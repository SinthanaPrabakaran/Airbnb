"use client";

import React, { useState } from "react";
import { Grid, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingImage } from "@/types";
import { GalleryModal } from "./GalleryModal";

interface ImageGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // Mobile carousel state
  const [mobileIdx, setMobileIdx] = useState(0);

  if (images.length === 0) return null;

  const openLightbox = (index: number) => {
    setSelectedPhotoIdx(index);
    setModalOpen(true);
  };

  const heroImage = images[0];
  const sideImages = images.slice(1, 5);

  return (
    <>
      <div className="relative">
        {/* DESKTOP GALLERY (md and up): Classic 5-photo or multi-photo grid */}
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[420px] lg:h-[480px] rounded-2xl overflow-hidden">
          {/* Main Hero Photo (Takes 2 columns and 2 rows) */}
          <div
            onClick={() => openLightbox(0)}
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group bg-neutral-100"
          >
            <img
              src={heroImage.image_url}
              alt={`${title} main view`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-102 group-hover:brightness-95"
            />
          </div>

          {/* Supporting Images */}
          {sideImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => openLightbox(idx + 1)}
              className="relative cursor-pointer overflow-hidden group bg-neutral-100"
            >
              <img
                src={img.image_url}
                alt={`${title} detail view ${idx + 1}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-102 group-hover:brightness-95"
              />
            </div>
          ))}

          {/* If fewer than 5 images, fill remaining slots with hero or blank */}
          {sideImages.length < 4 &&
            Array.from({ length: 4 - sideImages.length }).map((_, i) => (
              <div
                key={i}
                onClick={() => openLightbox(0)}
                className="relative cursor-pointer overflow-hidden group bg-neutral-100"
              >
                <img
                  src={heroImage.image_url}
                  alt={title}
                  className="h-full w-full object-cover opacity-80"
                />
              </div>
            ))}

          {/* "Show all photos" Overlay Button */}
          <button
            onClick={() => openLightbox(0)}
            type="button"
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-xl border border-neutral-900 bg-white/95 px-4 py-2 text-xs font-bold text-neutral-900 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
            aria-label={`Show all ${images.length} photos`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Show all {images.length} photos</span>
          </button>
        </div>

        {/* MOBILE GALLERY (smaller than md): Swipeable / scrollable carousel */}
        <div className="md:hidden relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-100">
          <img
            src={images[mobileIdx].image_url}
            alt={`${title} view ${mobileIdx + 1}`}
            onClick={() => openLightbox(mobileIdx)}
            className="h-full w-full object-cover cursor-pointer"
          />

          {/* Mobile Chevrons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileIdx((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileIdx((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Mobile Counter Pill */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
            {mobileIdx + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <GalleryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={images}
        currentIndex={selectedPhotoIdx}
        onSelectIndex={setSelectedPhotoIdx}
        title={title}
      />
    </>
  );
}

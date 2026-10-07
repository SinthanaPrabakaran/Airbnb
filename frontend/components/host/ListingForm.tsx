"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  Sparkles,
  Info,
  DollarSign,
  MapPin,
  Home,
  Users,
  Bed,
  Bath,
} from "lucide-react";
import { api } from "@/lib/api";
import { Amenity, ListingCreatePayload, ListingDetail } from "@/types";
import { useToast } from "@/components/ui/toast";

interface ListingFormProps {
  initialData?: ListingDetail | null;
  hostId: number;
  isEditing?: boolean;
}

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Cabin",
  "Loft",
  "Chalet",
  "Cottage",
  "Beachfront",
  "Treehouse",
  "Mansion",
];

const SAMPLE_PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
];

export function ListingForm({ initialData, hostId, isEditing = false }: ListingFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [amenitiesCatalog, setAmenitiesCatalog] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "Apartment");

  const [location, setLocation] = useState(initialData?.location || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [country, setCountry] = useState(initialData?.country || "");
  const [latitude, setLatitude] = useState<string>(initialData?.latitude ? String(initialData.latitude) : "48.8566");
  const [longitude, setLongitude] = useState<string>(initialData?.longitude ? String(initialData.longitude) : "2.3522");

  const [pricePerNight, setPricePerNight] = useState<number>(initialData?.price_per_night || 2500);
  const [cleaningFee, setCleaningFee] = useState<number>(initialData?.cleaning_fee || 350);
  const [serviceFee, setServiceFee] = useState<number>(initialData?.service_fee || 0.14);

  const [maxGuests, setMaxGuests] = useState<number>(initialData?.max_guests || 4);
  const [bedrooms, setBedrooms] = useState<number>(initialData?.bedrooms || 2);
  const [beds, setBeds] = useState<number>(initialData?.beds || 2);
  const [bathrooms, setBathrooms] = useState<number>(initialData?.bathrooms || 1.5);

  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<number>>(
    new Set(initialData?.amenities?.map((a) => a.id) || [1, 2, 4, 5, 8])
  );

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.image_url) || [SAMPLE_PHOTO_PRESETS[0], SAMPLE_PHOTO_PRESETS[1]]
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Load Amenities Catalog
  useEffect(() => {
    api.amenities.getAll().then((data) => setAmenitiesCatalog(data)).catch(() => {});
  }, []);

  const toggleAmenity = (id: number) => {
    setSelectedAmenityIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddImage = (urlToAdd?: string) => {
    const url = (urlToAdd || newImageUrl).trim();
    if (!url) return;
    if (imageUrls.includes(url)) {
      showToast("Image URL is already added", "info");
      return;
    }
    setImageUrls([...imageUrls, url]);
    if (!urlToAdd) setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(imageUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.length < 3) {
      showToast("Please enter a listing title (at least 3 characters)", "error");
      return;
    }
    if (!description.trim() || description.length < 10) {
      showToast("Please provide a description (at least 10 characters)", "error");
      return;
    }
    if (!location.trim() || !city.trim() || !country.trim()) {
      showToast("Please fill in location, city, and country", "error");
      return;
    }
    if (pricePerNight <= 0) {
      showToast("Nightly price must be greater than 0", "error");
      return;
    }
    if (imageUrls.length === 0) {
      showToast("Please add at least 1 property photo URL", "error");
      return;
    }

    const payload: ListingCreatePayload = {
      title: title.trim(),
      description: description.trim(),
      property_type: propertyType,
      location: location.trim(),
      city: city.trim(),
      country: country.trim(),
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      price_per_night: Number(pricePerNight),
      cleaning_fee: Number(cleaningFee),
      service_fee: Number(serviceFee),
      max_guests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      beds: Number(beds),
      bathrooms: Number(bathrooms),
      host_id: hostId,
      amenity_ids: Array.from(selectedAmenityIds),
      image_urls: imageUrls,
    };

    try {
      setIsSubmitting(true);
      if (isEditing && initialData) {
        await api.host.updateListing(initialData.id, payload, hostId);
        showToast("Listing updated successfully!", "success");
        router.push("/host/listings");
      } else {
        const created = await api.host.createListing(payload);
        showToast("Property published successfully!", "success");
        router.push("/host/listings");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to save listing";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto pb-16">
      {/* 1. Basic Information */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <Home className="h-5 w-5 text-[#FF385C]" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">1. Property Overview</h2>
            <p className="text-xs text-neutral-500">Provide an engaging title, category, and description</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Listing Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Waterfront Villa with Sunset Terrace & Private Pool"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Property Category *
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 bg-white focus:border-neutral-900 focus:outline-none"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Property Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the architecture, ambiance, views, and unique highlights of your property..."
              className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none leading-relaxed"
            />
          </div>
        </div>
      </section>

      {/* 2. Location Section */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <MapPin className="h-5 w-5 text-[#FF385C]" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">2. Location Details</h2>
            <p className="text-xs text-neutral-500">Where can guests find your home?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Neighborhood or Street Address *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Marina Boulevard / South Beach Area"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              City *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Goa / Paris / Bali"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Country *
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. India / France / Indonesia"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="48.85"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="2.35"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pricing & Fees */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <DollarSign className="h-5 w-5 text-[#FF385C]" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">3. Pricing & Fees</h2>
            <p className="text-xs text-neutral-500">Configure nightly prices and guest fees in ₹</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Nightly Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">₹</span>
              <input
                type="number"
                required
                min={1}
                value={pricePerNight}
                onChange={(e) => setPricePerNight(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 pl-8 pr-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Cleaning Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">₹</span>
              <input
                type="number"
                min={0}
                value={cleaningFee}
                onChange={(e) => setCleaningFee(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-300 pl-8 pr-4 py-2.5 text-sm font-semibold text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Service Fee Rate
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={serviceFee}
              onChange={(e) => setServiceFee(Number(e.target.value))}
              placeholder="0.14"
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-neutral-400">0.14 represents standard 14% platform fee</p>
          </div>
        </div>
      </section>

      {/* 4. Capacity & Rooms */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <Users className="h-5 w-5 text-[#FF385C]" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">4. Capacity & Sleeping Arrangements</h2>
            <p className="text-xs text-neutral-500">Define maximum occupants, bedrooms, and bathrooms</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Max Guests
            </label>
            <input
              type="number"
              required
              min={1}
              value={maxGuests}
              onChange={(e) => setMaxGuests(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Bedrooms
            </label>
            <input
              type="number"
              required
              min={0}
              value={bedrooms}
              onChange={(e) => setBedrooms(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Beds
            </label>
            <input
              type="number"
              required
              min={1}
              value={beds}
              onChange={(e) => setBeds(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
              Bathrooms
            </label>
            <input
              type="number"
              step="0.5"
              required
              min={0.5}
              value={bathrooms}
              onChange={(e) => setBathrooms(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 5. Amenities Multi-Select */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <Sparkles className="h-5 w-5 text-[#FF385C]" />
          <div>
            <h2 className="text-base font-bold text-neutral-900">5. Amenities & Highlights</h2>
            <p className="text-xs text-neutral-500">Select all features available for guests</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {amenitiesCatalog.map((amenity) => {
            const isSelected = selectedAmenityIds.has(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-semibold transition text-left ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-xs"
                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span className="truncate">{amenity.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#FF385C]" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Photos Section */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <ImageIcon className="h-5 w-5 text-[#FF385C]" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">6. Property Photos</h2>
              <p className="text-xs text-neutral-500">Add high-resolution image URLs ({imageUrls.length} added)</p>
            </div>
          </div>
        </div>

        {/* Input Add Image */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAddImage()}
            className="rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition"
          >
            Add Photo
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium">Quick presets:</span>
          {SAMPLE_PHOTO_PRESETS.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddImage(url)}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 hover:bg-neutral-100 transition"
            >
              + Preset Photo {i + 1}
            </button>
          ))}
        </div>

        {/* Image Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {imageUrls.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200"
            >
              <Image
                src={url}
                alt={`Photo ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              {idx === 0 && (
                <span className="absolute top-2 left-2 rounded-md bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                  Cover Photo
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition hover:bg-rose-700"
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/host/listings"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Cancel & Back</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF385C]/30 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting
            ? isEditing
              ? "Saving changes..."
              : "Publishing listing..."
            : isEditing
            ? "Save changes"
            : "Publish listing"}
        </button>
      </div>
    </form>
  );
}

"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { HostHeader } from "@/components/host/HostHeader";
import { ListingForm } from "@/components/host/ListingForm";
import { ListingDetail, User } from "@/types";
import { api } from "@/lib/api";
import { getCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";
import { Spinner } from "@/components/ui/spinner";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);

  const [currentHost, setCurrentHost] = useState<User>(DEFAULT_CURRENT_HOST);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((users) => {
      if (!isMounted) return;
      const hostId = getCurrentHostId();
      const hostUser = users.find((u) => u.id === hostId) || DEFAULT_CURRENT_HOST;
      setCurrentHost(hostUser);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setError("Invalid listing ID");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    api.host
      .getListingDetail(listingId)
      .then((data) => {
        if (!isMounted) return;
        setListing(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Failed to load listing for editing");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900 antialiased flex flex-col">
      <HostHeader currentHost={currentHost} onSelectHost={setCurrentHost} />

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Link
            href="/host/listings"
            className="inline-flex items-center gap-1 hover:text-neutral-900 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>All Listings</span>
          </Link>
          <span>/</span>
          <span className="text-neutral-800">Edit #{listingId}</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Edit Property Listing
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Update pricing, descriptions, capacity, and imagery.
          </p>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Spinner size="lg" className="mx-auto text-[#FF385C]" />
            <p className="mt-4 text-xs font-bold text-neutral-600">Loading listing details...</p>
          </div>
        ) : error || !listing ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900">{error || "Property not found"}</h3>
            <Link
              href="/host/listings"
              className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Return to listings</span>
            </Link>
          </div>
        ) : (
          <ListingForm
            initialData={listing}
            hostId={currentHost.id}
            isEditing={true}
          />
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Plus, Sparkles } from "lucide-react";
import { HostHeader } from "@/components/host/HostHeader";
import { ListingForm } from "@/components/host/ListingForm";
import { User } from "@/types";
import { api } from "@/lib/api";
import { getCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";

export default function NewListingPage() {
  const [currentHost, setCurrentHost] = useState<User>(DEFAULT_CURRENT_HOST);

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
          <span className="text-neutral-800">New Listing</span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            Publish a New Listing
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            Fill in the details below to add your property to the staybnb marketplace.
          </p>
        </div>

        {/* Reusable Listing Form */}
        <ListingForm hostId={currentHost.id} isEditing={false} />
      </main>
    </div>
  );
}

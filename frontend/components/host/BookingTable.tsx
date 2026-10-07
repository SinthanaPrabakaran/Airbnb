"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Ban,
  ExternalLink,
  Search,
} from "lucide-react";
import { BookingDetail } from "@/types";

interface BookingTableProps {
  bookings: BookingDetail[];
}

export function BookingTable({ bookings }: BookingTableProps) {
  const [filter, setFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    if (filter === "confirmed" && b.status === "cancelled") return false;
    if (filter === "cancelled" && b.status !== "cancelled") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = b.listing_title?.toLowerCase().includes(q);
      const matchGuest = b.guest_name?.toLowerCase().includes(q);
      const matchCity = b.listing_city?.toLowerCase().includes(q);
      return matchTitle || matchGuest || matchCity;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            <span>Confirmed</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-bold text-neutral-600">
            <Ban className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 capitalize">
            <Clock className="h-3 w-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest or listing..."
            className="w-full rounded-2xl border border-neutral-300 pl-10 pr-4 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-2xl bg-neutral-100 p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3.5 py-1.5 transition ${
              filter === "all"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`rounded-xl px-3.5 py-1.5 transition ${
              filter === "confirmed"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Confirmed ({bookings.filter((b) => b.status !== "cancelled").length})
          </button>
          <button
            onClick={() => setFilter("cancelled")}
            className={`rounded-xl px-3.5 py-1.5 transition ${
              filter === "cancelled"
                ? "bg-white text-neutral-900 shadow-xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Cancelled ({bookings.filter((b) => b.status === "cancelled").length})
          </button>
        </div>
      </div>

      {/* Table / Cards Container */}
      <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            No reservations found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="border-b border-neutral-200 bg-neutral-50/70 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="py-3.5 px-5">Listing</th>
                  <th className="py-3.5 px-5">Guest</th>
                  <th className="py-3.5 px-5">Dates</th>
                  <th className="py-3.5 px-5">Occupancy</th>
                  <th className="py-3.5 px-5">Total Payout</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-neutral-50/60 transition">
                    {/* Listing Preview */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                          {b.cover_image ? (
                            <Image
                              src={b.cover_image}
                              alt={b.listing_title || "Property"}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : null}
                        </div>
                        <div className="space-y-0.5 max-w-[200px]">
                          <p className="font-bold text-neutral-900 truncate">
                            {b.listing_title}
                          </p>
                          <p className="text-[11px] text-neutral-400 truncate">
                            {b.listing_city}, {b.listing_country}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Guest Information */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <p className="font-bold text-neutral-900">
                          {b.guest_name || `Guest #${b.guest_id}`}
                        </p>
                        <p className="text-[11px] text-neutral-400">{b.guest_email}</p>
                      </div>
                    </td>

                    {/* Stay Dates */}
                    <td className="py-4 px-5">
                      <div className="space-y-0.5 font-medium">
                        <p className="text-neutral-900 font-semibold">
                          {b.check_in} to {b.check_out}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {b.nights} {b.nights === 1 ? "night" : "nights"}
                        </p>
                      </div>
                    </td>

                    {/* Occupancy */}
                    <td className="py-4 px-5 font-semibold text-neutral-800">
                      {b.guests} {b.guests === 1 ? "guest" : "guests"}
                    </td>

                    {/* Total Payout */}
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-neutral-900 text-sm">
                        ₹{Math.round(b.total_price).toLocaleString()}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">{getStatusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

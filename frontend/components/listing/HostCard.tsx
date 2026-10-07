"use client";

import React from "react";
import { Award, ShieldCheck, Star, MessageSquare } from "lucide-react";
import { User } from "@/types";

interface HostCardProps {
  host?: User | null;
  propertyType: string;
}

export function HostCard({ host, propertyType }: HostCardProps) {
  if (!host) return null;

  const isSuperhost = host.role === "host";
  const initial = host.name[0];

  return (
    <div className="rounded-3xl border border-neutral-200 bg-neutral-50/60 p-6 sm:p-8 space-y-6">
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {host.avatar ? (
              <img
                src={host.avatar}
                alt={host.name}
                className="h-16 w-16 rounded-full object-cover shadow-sm ring-2 ring-white"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-xl font-bold text-white">
                {initial}
              </div>
            )}
            {isSuperhost && (
              <div
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#FF385C] text-white shadow-xs"
                title="Superhost"
              >
                <Award className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-neutral-900">
              Hosted by {host.name}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              {isSuperhost ? "Superhost · " : ""}Hosting on staybnb for 3 years
            </p>
          </div>
        </div>

        {/* Superhost / Verified Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Identity verified</span>
          </div>
        </div>
      </div>

      {/* Host Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-y border-neutral-200/80 py-4">
        <div>
          <span className="text-xs font-bold text-neutral-900 block">4.95 ★</span>
          <span className="text-[11px] text-neutral-500">Host Rating</span>
        </div>
        <div>
          <span className="text-xs font-bold text-neutral-900 block">100%</span>
          <span className="text-[11px] text-neutral-500">Response rate</span>
        </div>
        <div>
          <span className="text-xs font-bold text-neutral-900 block">Within an hour</span>
          <span className="text-[11px] text-neutral-500">Response time</span>
        </div>
      </div>

      {/* Host Bio snippet */}
      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
        {host.name} takes immense pride in providing exceptional hospitality for guests exploring {propertyType.toLowerCase()} stays. Dedicated to providing pristine spaces, local dining insider tips, and 24/7 seamless communication.
      </p>

      {/* Contact Host Button */}
      <div>
        <button
          onClick={() => alert(`Messaging with ${host.name} will be enabled in upcoming messaging integration!`)}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-900 bg-white px-5 py-2.5 text-xs font-bold text-neutral-900 shadow-xs transition hover:bg-neutral-900 hover:text-white active:scale-95"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Message host</span>
        </button>
      </div>
    </div>
  );
}

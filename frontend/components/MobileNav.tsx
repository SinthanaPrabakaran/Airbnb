"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Luggage, Home, User } from "lucide-react";

interface MobileNavProps {
  favoritesCount?: number;
}

export function MobileNav({ favoritesCount = 0 }: MobileNavProps) {
  const pathname = usePathname();

  const isExplore = pathname === "/";
  const isWishlists = pathname.startsWith("/wishlists");
  const isTrips = pathname.startsWith("/trips");
  const isHost = pathname.startsWith("/host");

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-neutral-200/90 backdrop-blur-md px-4 py-2 flex items-center justify-around shadow-lg transition-transform"
      aria-label="Mobile Bottom Navigation"
    >
      {/* 1. Explore */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          isExplore
            ? "text-[#FF385C]"
            : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Compass
          className={`h-5 w-5 ${isExplore ? "stroke-[#FF385C] stroke-[2.5]" : ""}`}
        />
        <span className="text-[10px] font-bold">Explore</span>
      </Link>

      {/* 2. Wishlists */}
      <Link
        href="/wishlists"
        className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          isWishlists
            ? "text-[#FF385C]"
            : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <div className="relative">
          <Heart
            className={`h-5 w-5 ${
              isWishlists ? "fill-[#FF385C] stroke-[#FF385C]" : ""
            }`}
          />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF385C] px-1 text-[9px] font-extrabold text-white">
              {favoritesCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold">Wishlists</span>
      </Link>

      {/* 3. Trips */}
      <Link
        href="/trips"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          isTrips
            ? "text-[#FF385C]"
            : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Luggage
          className={`h-5 w-5 ${isTrips ? "stroke-[#FF385C] stroke-[2.5]" : ""}`}
        />
        <span className="text-[10px] font-bold">Trips</span>
      </Link>

      {/* 4. Host */}
      <Link
        href="/host"
        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
          isHost
            ? "text-[#FF385C]"
            : "text-neutral-500 hover:text-neutral-900"
        }`}
      >
        <Home
          className={`h-5 w-5 ${isHost ? "stroke-[#FF385C] stroke-[2.5]" : ""}`}
        />
        <span className="text-[10px] font-bold">Host</span>
      </Link>
    </nav>
  );
}

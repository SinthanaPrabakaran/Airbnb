"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Amenity,
  ListingFilterParams,
  ListingSummary,
  PaginatedListingsResponse,
  User,
} from "@/types";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryNav } from "@/components/CategoryNav";
import { ListingGrid } from "@/components/ListingGrid";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";
import { FilterModal, FilterState } from "@/components/FilterModal";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { ListingDetailModal } from "@/components/ListingDetailModal";
import { MobileNav } from "@/components/MobileNav";
import { useToast } from "@/components/ui/toast";
import { getCurrentUserId, setCurrentUserId } from "@/lib/current-user";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ExplorePage() {
  const router = useRouter();
  const { showToast } = useToast();

  // 1. Data States
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // 2. User & Persona States
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favoritesList, setFavoritesList] = useState<ListingSummary[]>([]);
  const [favoritesSet, setFavoritesSet] = useState<Set<number>>(new Set());

  // 3. Modals & Drawer States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState<ListingSummary | null>(null);
  const [amenitiesCatalog, setAmenitiesCatalog] = useState<Amenity[]>([]);

  // 4. Search & Filter Parameters
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");

  const [filters, setFilters] = useState<FilterState>({
    minPrice: undefined,
    maxPrice: undefined,
    propertyType: undefined,
    guests: undefined,
    bedrooms: undefined,
    beds: undefined,
    bathrooms: undefined,
    selectedAmenities: [],
    sortBy: undefined,
  });

  // Scroll tracking for Airbnb search morph animation
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled(scrolled);
      if (scrolled) {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load initial users and amenities
  useEffect(() => {
    let isMounted = true;
    Promise.all([api.users.getAll(), api.amenities.getAll()])
      .then(([userData, amenitiesData]) => {
        if (!isMounted) return;
        setUsers(userData);
        if (userData.length > 0) {
          const savedId = getCurrentUserId();
          const activeUser =
            userData.find((u) => u.id === savedId) ||
            userData.find((u) => u.role === "guest") ||
            userData[0];
          setCurrentUser(activeUser);
          setCurrentUserId(activeUser.id);
        }
        setAmenitiesCatalog(amenitiesData);
      })
      .catch((err) => {
        console.error("Failed to load initial metadata", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch user favorites when currentUser changes
  const fetchFavorites = useCallback(async (userId: number) => {
    try {
      const favs = await api.favorites.getByUser(userId);
      setFavoritesList(favs);
      setFavoritesSet(new Set(favs.map((f) => f.id)));
    } catch (err) {
      console.error("Failed to load favorites", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      Promise.resolve().then(() => {
        if (isMounted) fetchFavorites(currentUser.id);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, fetchFavorites]);

  // Main Listing Query Builder
  const fetchListings = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setApiError(null);

      const params: ListingFilterParams = {
        page: pageToFetch,
        limit: pageSize,
      };

      if (searchLocation.trim()) params.location = searchLocation.trim();
      if (checkIn) params.check_in = checkIn;
      if (checkOut) params.check_out = checkOut;
      if (guests > 1) params.guests = guests;

      if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
      if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
      if (filters.propertyType) params.property_type = filters.propertyType;
      if (filters.guests) params.guests = filters.guests;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.beds) params.beds = filters.beds;
      if (filters.bathrooms) params.bathrooms = filters.bathrooms;
      if (filters.selectedAmenities.length > 0) {
        params.amenities = filters.selectedAmenities.join(",");
      }
      if (filters.sortBy) params.sort_by = filters.sortBy;

      try {
        const response: PaginatedListingsResponse = await api.listings.getAll(params);
        setListings(response.items);
        setTotalListings(response.total);
        setTotalPages(response.total_pages);
        setCurrentPage(response.page);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load listings from server";
        setApiError(message);
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [searchLocation, checkIn, checkOut, guests, filters, pageSize, showToast]
  );

  // Trigger search on filter / parameter updates
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchListings(1);
    });
    return () => {
      isMounted = false;
    };
  }, [fetchListings]);

  // Toggle Favorite Handler
  const handleToggleFavorite = async (listingId: number) => {
    if (!currentUser) {
      showToast("Please select a user profile first", "info");
      return;
    }

    const isFav = favoritesSet.has(listingId);
    try {
      if (isFav) {
        await api.favorites.remove(currentUser.id, listingId);
        setFavoritesSet((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        setFavoritesList((prev) => prev.filter((f) => f.id !== listingId));
        showToast("Removed from wishlist", "info");
      } else {
        await api.favorites.add(currentUser.id, listingId);
        setFavoritesSet((prev) => new Set(prev).add(listingId));
        const matched = listings.find((l) => l.id === listingId);
        if (matched) {
          setFavoritesList((prev) => [matched, ...prev]);
        }
        showToast("Saved to wishlist!", "success");
      }
    } catch {
      showToast("Failed to update wishlist", "error");
    }
  };

  // Category change handler
  const handleSelectCategory = (categoryId: string, propertyType?: string) => {
    setActiveCategory(categoryId);
    setFilters((prev) => ({
      ...prev,
      propertyType: propertyType,
    }));
  };

  // Clear all filters handler
  const handleClearAll = () => {
    setSearchLocation("");
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setActiveCategory("all");
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: undefined,
      guests: undefined,
      bedrooms: undefined,
      beds: undefined,
      bathrooms: undefined,
      selectedAmenities: [],
      sortBy: undefined,
    });
    showToast("Filters reset to default", "info");
  };

  // Compute active filter badge count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
    if (filters.propertyType) count += 1;
    if (filters.guests) count += 1;
    if (filters.bedrooms) count += 1;
    if (filters.beds) count += 1;
    if (filters.bathrooms) count += 1;
    if (filters.selectedAmenities.length > 0) count += filters.selectedAmenities.length;
    if (filters.sortBy) count += 1;
    return count;
  }, [filters]);

  // Dynamic search summary text for mobile pill
  const searchSummary = useMemo(() => {
    const parts = [];
    if (searchLocation) parts.push(searchLocation);
    else parts.push("Anywhere");

    if (checkIn && checkOut) parts.push(`${checkIn.slice(5)} to ${checkOut.slice(5)}`);
    else parts.push("Any week");

    if (guests > 1) parts.push(`${guests} guests`);
    else parts.push("Add guests");

    return parts.join(" · ");
  }, [searchLocation, checkIn, checkOut, guests]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased">
      {/* 1. Header with Airbnb logo, search summary, persona switcher & wishlist */}
      <Header
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setCurrentUserId(u.id);
          showToast(`Switched active persona to ${u.name}`, "info");
        }}
        favoritesCount={favoritesSet.size}
        onOpenFavorites={() => setIsWishlistDrawerOpen(true)}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        filterCount={activeFilterCount}
        onSearchClick={() => {
          setIsSearchExpanded((prev) => !prev);
        }}
        searchSummary={searchSummary}
      />

      {/* 2. Top Search Bar (When user is near top of page) */}
      {!isScrolled && (
        <section className="hidden md:block pt-3 pb-6 px-4 bg-white border-b border-neutral-100 transition-all duration-300">
          <SearchBar
            location={searchLocation}
            onLocationChange={setSearchLocation}
            checkIn={checkIn}
            onCheckInChange={setCheckIn}
            checkOut={checkOut}
            onCheckOutChange={setCheckOut}
            guests={guests}
            onGuestsChange={setGuests}
            onSearch={() => fetchListings(1)}
            onClear={handleClearAll}
          />
        </section>
      )}

      {/* 2B. Scrolled Dropdown Overlay (When user clicks compact pill while scrolled) */}
      {isScrolled && isSearchExpanded && (
        <div
          className="fixed inset-0 top-20 z-40 bg-black/30 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsSearchExpanded(false)}
        >
          <div
            className="bg-white border-b border-neutral-200 shadow-2xl py-6 px-4 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <SearchBar
              location={searchLocation}
              onLocationChange={setSearchLocation}
              checkIn={checkIn}
              onCheckInChange={setCheckIn}
              checkOut={checkOut}
              onCheckOutChange={setCheckOut}
              guests={guests}
              onGuestsChange={setGuests}
              onSearch={() => {
                setIsSearchExpanded(false);
                fetchListings(1);
              }}
              onClear={handleClearAll}
            />
          </div>
        </div>
      )}

      {/* 3. Category Row Carousel */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        filterCount={activeFilterCount}
      />

      {/* 4. Main Marketplace Listing Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* API Error State */}
        {apiError && (
          <div className="mb-8 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <p className="text-sm font-bold">Failed to connect to backend</p>
                <p className="text-xs text-rose-600">{apiError}</p>
              </div>
            </div>
            <button
              onClick={() => fetchListings(currentPage)}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-200 shadow-xs hover:bg-rose-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading ? (
          <LoadingSkeleton count={pageSize} />
        ) : listings.length === 0 ? (
          /* Empty State */
          <EmptyState onReset={handleClearAll} />
        ) : (
          /* 5. Photo-forward Responsive Listing Grid */
          <>
            <ListingGrid
              listings={listings}
              favoritesSet={favoritesSet}
              onToggleFavorite={handleToggleFavorite}
              onSelectListing={(listing) => router.push(`/listings/${listing.id}`)}
            />

            {/* 6. Pagination Navigation */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalListings}
              limit={pageSize}
              onPageChange={(page) => {
                fetchListings(page);
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
            />
          </>
        )}
      </main>

      {/* 7. Comprehensive Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          showToast("Filters applied", "info");
        }}
        onReset={handleClearAll}
        initialFilters={filters}
        amenitiesList={amenitiesCatalog}
        totalMatchesCount={totalListings}
      />

      {/* 8. Slide-over Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistDrawerOpen}
        onClose={() => setIsWishlistDrawerOpen(false)}
        favorites={favoritesList}
        onRemoveFavorite={handleToggleFavorite}
        onSelectListing={(l) => {
          setSelectedListingDetail(l);
        }}
        userName={currentUser?.name || "Guest"}
      />

      {/* 9. Listing Detail Quick Modal */}
      <ListingDetailModal
        listingSummary={selectedListingDetail}
        onClose={() => setSelectedListingDetail(null)}
        isFavorited={selectedListingDetail ? favoritesSet.has(selectedListingDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 10. Minimalist Marketplace Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50/80 py-8 text-neutral-500 text-xs mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© 2026 Staybnb, Inc. All rights reserved.</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span className="hover:underline cursor-pointer">Sitemap</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-neutral-800">
            <span>English (IN)</span>
            <span>₹ INR</span>
          </div>
        </div>
      </footer>

      {/* 11. Mobile Sticky Bottom Navigation */}
      <MobileNav favoritesCount={favoritesSet.size} />
    </div>
  );
}

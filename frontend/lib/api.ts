import { apiClient } from "./api-client";
import {
  Amenity,
  AvailabilityResponse,
  BookingDetail,
  Favorite,
  HealthResponse,
  ListingCreatePayload,
  ListingDetail,
  ListingFilterParams,
  ListingSummary,
  ListingUpdatePayload,
  PaginatedListingsResponse,
  User,
} from "@/types";

/**
 * Centralized API client service catalog for the Airbnb marketplace.
 */
export const api = {
  health: {
    check: () => apiClient.get<HealthResponse>("/api/health"),
  },

  listings: {
    getAll: (params?: ListingFilterParams) =>
      apiClient.get<PaginatedListingsResponse>("/api/listings", {
        params: params as Record<string, string | number | boolean | undefined>,
      }),

    getById: (id: number) =>
      apiClient.get<ListingDetail>(`/api/listings/${id}`),

    getAvailability: (id: number) =>
      apiClient.get<AvailabilityResponse>(`/api/listings/${id}/availability`),
  },

  amenities: {
    getAll: () => apiClient.get<Amenity[]>("/api/amenities"),
  },

  users: {
    getAll: () => apiClient.get<User[]>("/api/users"),
    getById: (id: number) => apiClient.get<User>(`/api/users/${id}`),
  },

  favorites: {
    getByUser: (userId: number) =>
      apiClient.get<ListingSummary[]>(`/api/favorites/${userId}`),

    add: (userId: number, listingId: number) =>
      apiClient.post<Favorite>("/api/favorites", {
        user_id: userId,
        listing_id: listingId,
      }),

    remove: (userId: number, listingId: number) =>
      apiClient.delete<{ success: boolean; message: string }>(
        `/api/favorites/${userId}/${listingId}`
      ),
  },

  bookings: {
    create: (data: {
      listing_id: number;
      guest_id: number;
      check_in: string;
      check_out: string;
      guests: number;
    }) => apiClient.post<BookingDetail>("/api/bookings", data),

    getById: (id: number) => apiClient.get<BookingDetail>(`/api/bookings/${id}`),

    pay: (id: number) => apiClient.post<BookingDetail>(`/api/bookings/${id}/pay`),

    cancel: (id: number, userId: number = 1) =>
      apiClient.patch<BookingDetail>(`/api/bookings/${id}/cancel?user_id=${userId}`),

    getUserTrips: (userId: number) =>
      apiClient.get<BookingDetail[]>(`/api/bookings/user/${userId}`),
  },

  host: {
    createListing: (data: ListingCreatePayload) =>
      apiClient.post<ListingDetail>("/api/host/listings", data),

    getListings: (hostId: number) =>
      apiClient.get<ListingSummary[]>(`/api/host/${hostId}/listings`),

    getListingDetail: (id: number) =>
      apiClient.get<ListingDetail>(`/api/host/listings/${id}`),

    updateListing: (id: number, data: ListingUpdatePayload, hostId: number) =>
      apiClient.put<ListingDetail>(`/api/host/listings/${id}?host_id=${hostId}`, data),

    deleteListing: (id: number, hostId: number) =>
      apiClient.delete<{ success: boolean; message: string }>(
        `/api/host/listings/${id}?host_id=${hostId}`
      ),

    getBookings: (hostId: number) =>
      apiClient.get<BookingDetail[]>(`/api/host/${hostId}/bookings`),
  },
};

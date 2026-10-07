import { apiClient } from "./api-client";
import {
  Amenity,
  AvailabilityResponse,
  Favorite,
  HealthResponse,
  ListingDetail,
  ListingFilterParams,
  ListingSummary,
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
};

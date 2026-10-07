import { apiClient } from "./api-client";
import { HealthResponse } from "@/types";

/**
 * Centralized API service functions.
 * Keeps all endpoint definitions in one location.
 */
export const api = {
  health: {
    check: () => apiClient.get<HealthResponse>("/api/health"),
  },
};

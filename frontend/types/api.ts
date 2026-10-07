export interface HealthResponse {
  status: string;
  service: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  role: "guest" | "host" | string;
  created_at?: string;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string | null;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
  display_order: number;
}

export interface ListingSummary {
  id: number;
  host_id: number;
  title: string;
  property_type: string;
  location: string;
  city: string;
  country: string;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  cover_image: string | null;
  average_rating: number | null;
  review_count: number;
  created_at: string;
  images?: ListingImage[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedListingsResponse {
  items: ListingSummary[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  meta: PaginationMeta;
}

export interface Review {
  id: number;
  listing_id: number;
  guest_id: number;
  rating: number;
  comment: string;
  created_at: string;
  guest?: {
    id: number;
    name: string;
    avatar?: string | null;
    role: string;
  } | null;
}

export interface ListingDetail extends ListingSummary {
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  updated_at: string;
  host?: User | null;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
  unavailable_dates: string[];
}

export interface AvailabilityResponse {
  listing_id: number;
  booked_ranges: { check_in: string; check_out: string }[];
  unavailable_dates: string[];
}

export interface Favorite {
  id: number;
  user_id: number;
  listing_id: number;
  created_at: string;
}

export interface ListingFilterParams {
  location?: string;
  city?: string;
  country?: string;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  guests?: number;
  amenities?: string;
  check_in?: string;
  check_out?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}

export interface BookingDetail {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  nightly_total: number;
  cleaning_fee: number;
  service_fee: number;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | string;
  created_at: string;
  listing_title?: string | null;
  listing_city?: string | null;
  listing_country?: string | null;
  listing_location?: string | null;
  cover_image?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  host_id?: number | null;
  host_name?: string | null;
  host_avatar?: string | null;
  property_type?: string | null;
  price_per_night?: number | null;
}

export interface BookingCreatePayload {
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface ListingCreatePayload {
  title: string;
  description: string;
  property_type: string;
  location: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  price_per_night: number;
  cleaning_fee: number;
  service_fee: number;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  host_id: number;
  amenity_ids: number[];
  image_urls: string[];
}

export interface ListingUpdatePayload extends Partial<ListingCreatePayload> {}

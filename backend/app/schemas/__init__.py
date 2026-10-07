"""Pydantic schemas for the Airbnb platform."""

from app.schemas.amenity import AmenityBase, AmenityCreate, AmenityResponse
from app.schemas.booking import (
    BookingBase,
    BookingCreate,
    BookingDetailResponse,
    BookingResponse,
    BookingStatus,
    BookingStatusUpdate,
)
from app.schemas.favorite import (
    FavoriteCreate,
    FavoriteDetailResponse,
    FavoriteResponse,
)
from app.schemas.health import HealthResponse
from app.schemas.image import (
    ListingImageBase,
    ListingImageCreate,
    ListingImageResponse,
)
from app.schemas.listing import (
    AvailabilityResponse,
    DateRange,
    ListingBase,
    ListingCreate,
    ListingDetailResponse,
    ListingResponse,
    ListingSummaryResponse,
    ListingUpdate,
    PaginatedListingsResponse,
    PaginationMeta,
)
from app.schemas.review import (
    ReviewBase,
    ReviewCreate,
    ReviewDetailResponse,
    ReviewResponse,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserPublic,
    UserResponse,
    UserRole,
    UserUpdate,
)

__all__ = [
    # Health
    "HealthResponse",
    # User
    "UserRole",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserPublic",
    # Amenity
    "AmenityBase",
    "AmenityCreate",
    "AmenityResponse",
    # Image
    "ListingImageBase",
    "ListingImageCreate",
    "ListingImageResponse",
    # Listing
    "ListingBase",
    "ListingCreate",
    "ListingUpdate",
    "ListingResponse",
    "ListingSummaryResponse",
    "ListingDetailResponse",
    "PaginatedListingsResponse",
    "PaginationMeta",
    "DateRange",
    "AvailabilityResponse",
    # Booking
    "BookingStatus",
    "BookingBase",
    "BookingCreate",
    "BookingStatusUpdate",
    "BookingResponse",
    "BookingDetailResponse",
    # Review
    "ReviewBase",
    "ReviewCreate",
    "ReviewResponse",
    "ReviewDetailResponse",
    # Favorite
    "FavoriteCreate",
    "FavoriteResponse",
    "FavoriteDetailResponse",
]

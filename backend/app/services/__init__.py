"""Service layer encapsulating business logic and data access operations."""

from app.services.booking_service import (
    BookingConflictError,
    BookingError,
    BookingNotFoundError,
    cancel_booking,
    create_booking,
    get_host_bookings,
    get_listing_bookings,
    get_user_bookings,
)
from app.services.favorite_service import (
    FavoriteError,
    add_favorite,
    get_user_favorites,
    is_favorited,
    remove_favorite,
    toggle_favorite,
)
from app.services.health_service import get_system_health
from app.services.listing_service import (
    create_listing,
    delete_listing,
    get_listing_availability,
    get_listing_by_id,
    get_listing_detail,
    get_listings,
    get_unavailable_dates,
    update_listing,
)
from app.services.review_service import (
    ReviewError,
    create_review,
    get_listing_reviews,
)
from app.services.user_service import (
    create_user,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    update_user,
)

__all__ = [
    "get_system_health",
    "get_user_by_id",
    "get_user_by_email",
    "get_all_users",
    "create_user",
    "update_user",
    "get_listing_by_id",
    "get_listing_detail",
    "get_listing_availability",
    "get_unavailable_dates",
    "get_listings",
    "create_listing",
    "update_listing",
    "delete_listing",
    "create_booking",
    "get_user_bookings",
    "get_listing_bookings",
    "get_host_bookings",
    "cancel_booking",
    "BookingError",
    "BookingConflictError",
    "BookingNotFoundError",
    "create_review",
    "get_listing_reviews",
    "ReviewError",
    "add_favorite",
    "remove_favorite",
    "toggle_favorite",
    "get_user_favorites",
    "is_favorited",
    "FavoriteError",
]

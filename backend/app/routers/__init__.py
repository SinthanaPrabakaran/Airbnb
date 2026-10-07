"""Routers package re-exporting all API route modules."""

from app.routers.amenities import router as amenities_router
from app.routers.bookings import router as bookings_router
from app.routers.favorites import router as favorites_router
from app.routers.health import router as health_router
from app.routers.host import router as host_router
from app.routers.listings import router as listings_router
from app.routers.users import router as users_router

__all__ = [
    "health_router",
    "listings_router",
    "users_router",
    "favorites_router",
    "bookings_router",
    "host_router",
    "amenities_router",
]

from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database_utils import get_listing_review_stats
from app.models.favorite import Favorite
from app.models.listing import Listing
from app.models.user import User
from app.schemas.favorite import FavoriteDetailResponse, FavoriteResponse
from app.schemas.listing import ListingSummaryResponse


class FavoriteError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def add_favorite(db: Session, user_id: int, listing_id: int) -> FavoriteResponse:
    """Add a listing to the user's wishlist (idempotent if already favorited)."""
    user = db.get(User, user_id)
    if not user:
        raise FavoriteError(f"User with id {user_id} not found", status_code=404)

    listing = db.get(Listing, listing_id)
    if not listing:
        raise FavoriteError(f"Listing with id {listing_id} not found", status_code=404)

    stmt = select(Favorite).where(
        Favorite.user_id == user_id,
        Favorite.listing_id == listing_id,
    )
    existing = db.scalar(stmt)
    if existing:
        return FavoriteResponse.model_validate(existing)

    fav = Favorite(user_id=user_id, listing_id=listing_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return FavoriteResponse.model_validate(fav)


def remove_favorite(db: Session, user_id: int, listing_id: int) -> bool:
    """Remove a listing from the user's wishlist."""
    stmt = select(Favorite).where(
        Favorite.user_id == user_id,
        Favorite.listing_id == listing_id,
    )
    existing = db.scalar(stmt)
    if not existing:
        return False

    db.delete(existing)
    db.commit()
    return True


def toggle_favorite(db: Session, user_id: int, listing_id: int) -> bool:
    """Toggle a listing in the user's wishlist. Returns True if favorited, False if unfavorited."""
    stmt = select(Favorite).where(
        Favorite.user_id == user_id,
        Favorite.listing_id == listing_id,
    )
    existing = db.scalar(stmt)
    if existing:
        db.delete(existing)
        db.commit()
        return False
    else:
        fav = Favorite(user_id=user_id, listing_id=listing_id)
        db.add(fav)
        db.commit()
        return True


def get_user_favorites(db: Session, user_id: int) -> List[ListingSummaryResponse]:
    """Retrieve all listings favorited by a user, enriched with photos and rating stats."""
    user = db.get(User, user_id)
    if not user:
        raise FavoriteError(f"User with id {user_id} not found", status_code=404)

    stmt = (
        select(Listing)
        .join(Favorite, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == user_id)
        .options(
            joinedload(Listing.host),
            joinedload(Listing.images),
        )
        .order_by(Favorite.created_at.desc())
    )
    listings = list(db.scalars(stmt).unique().all())

    items: List[ListingSummaryResponse] = []
    for l in listings:
        avg_rating, rev_count = get_listing_review_stats(db, l.id)
        cover_url = l.images[0].image_url if l.images else None
        items.append(
            ListingSummaryResponse(
                id=l.id,
                host_id=l.host_id,
                title=l.title,
                property_type=l.property_type,
                location=l.location,
                city=l.city,
                country=l.country,
                price_per_night=l.price_per_night,
                cleaning_fee=l.cleaning_fee,
                service_fee=l.service_fee,
                max_guests=l.max_guests,
                bedrooms=l.bedrooms,
                beds=l.beds,
                bathrooms=l.bathrooms,
                cover_image=cover_url,
                average_rating=avg_rating,
                review_count=rev_count,
                created_at=l.created_at,
            )
        )
    return items


def is_favorited(db: Session, user_id: int, listing_id: int) -> bool:
    """Check if a specific listing is favorited by the user."""
    stmt = select(Favorite.id).where(
        Favorite.user_id == user_id,
        Favorite.listing_id == listing_id,
    )
    return db.scalar(stmt) is not None

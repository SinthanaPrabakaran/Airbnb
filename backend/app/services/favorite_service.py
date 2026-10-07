from __future__ import annotations
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.favorite import Favorite
from app.models.listing import Listing


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


def get_user_favorites(db: Session, user_id: int) -> List[Listing]:
    """Retrieve all listings favorited by a user."""
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
    return list(db.scalars(stmt).unique().all())


def is_favorited(db: Session, user_id: int, listing_id: int) -> bool:
    """Check if a specific listing is favorited by the user."""
    stmt = select(Favorite.id).where(
        Favorite.user_id == user_id,
        Favorite.listing_id == listing_id,
    )
    return db.scalar(stmt) is not None

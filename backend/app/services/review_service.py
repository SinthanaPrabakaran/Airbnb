from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.listing import Listing
from app.models.review import Review
from app.schemas.review import ReviewCreate


class ReviewError(Exception):
    pass


def create_review(db: Session, review_in: ReviewCreate) -> Review:
    """Create a review for a listing."""
    listing = db.get(Listing, review_in.listing_id)
    if not listing:
        raise ReviewError(f"Listing {review_in.listing_id} not found")

    review = Review(
        listing_id=review_in.listing_id,
        guest_id=review_in.guest_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_listing_reviews(db: Session, listing_id: int) -> List[Review]:
    """Retrieve all reviews for a listing with author user details."""
    stmt = (
        select(Review)
        .where(Review.listing_id == listing_id)
        .options(joinedload(Review.guest))
        .order_by(Review.created_at.desc())
    )
    return list(db.scalars(stmt).unique().all())

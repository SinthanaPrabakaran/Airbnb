from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.listing import Listing
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewDetailResponse
from app.schemas.user import UserPublic


class ReviewError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def create_review(
    db: Session,
    review_in: ReviewCreate,
    listing_id: Optional[int] = None,
) -> ReviewDetailResponse:
    """Create a verified review for a listing."""
    target_listing_id = listing_id if listing_id is not None else review_in.listing_id
    if not target_listing_id:
        raise ReviewError("listing_id is required", status_code=400)

    listing = db.get(Listing, target_listing_id)
    if not listing:
        raise ReviewError(f"Listing with id {target_listing_id} not found", status_code=404)

    guest = db.get(User, review_in.guest_id)
    if not guest:
        raise ReviewError(f"User with id {review_in.guest_id} not found", status_code=404)

    if review_in.rating < 1 or review_in.rating > 5:
        raise ReviewError("Rating must be between 1 and 5 stars", status_code=400)

    review = Review(
        listing_id=target_listing_id,
        guest_id=review_in.guest_id,
        rating=review_in.rating,
        comment=review_in.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewDetailResponse(
        id=review.id,
        listing_id=review.listing_id,
        guest_id=review.guest_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        guest=UserPublic.model_validate(guest),
    )


def get_listing_reviews(db: Session, listing_id: int) -> List[ReviewDetailResponse]:
    """Retrieve all reviews for a listing with author user details."""
    listing = db.get(Listing, listing_id)
    if not listing:
        raise ReviewError(f"Listing with id {listing_id} not found", status_code=404)

    stmt = (
        select(Review)
        .where(Review.listing_id == listing_id)
        .options(joinedload(Review.guest))
        .order_by(Review.created_at.desc())
    )
    reviews_entities = list(db.scalars(stmt).unique().all())

    return [
        ReviewDetailResponse(
            id=r.id,
            listing_id=r.listing_id,
            guest_id=r.guest_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            guest=UserPublic.model_validate(r.guest) if r.guest else None,
        )
        for r in reviews_entities
    ]

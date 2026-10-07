from __future__ import annotations
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.listing import (
    AvailabilityResponse,
    ListingDetailResponse,
    PaginatedListingsResponse,
    PaginationMeta,
)
from app.schemas.review import ReviewCreate, ReviewDetailResponse
from app.services.listing_service import (
    get_listing_availability,
    get_listing_detail,
    get_listings,
)
from app.services.review_service import ReviewError, create_review, get_listing_reviews

router = APIRouter(prefix="/listings", tags=["Listings"])


@router.get(
    "",
    response_model=PaginatedListingsResponse,
    summary="Browse and search listings",
    description="Retrieve listings with full filtering by location, price, property type, capacity, amenities, dates, sorting, and pagination.",
)
def list_listings(
    location: Optional[str] = Query(None, description="Location search across city, country, address, or title"),
    city: Optional[str] = Query(None, description="Specific city name filter"),
    country: Optional[str] = Query(None, description="Specific country name filter"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price per night"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per night"),
    property_type: Optional[str] = Query(None, description="Property type (e.g. Villa, Cabin, Loft, Chalet)"),
    guests: Optional[int] = Query(None, ge=1, description="Minimum guest capacity"),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity names or IDs (e.g. 'Wifi,Pool' or '1,2')"),
    check_in: Optional[date] = Query(None, description="Requested check-in date for availability checking"),
    check_out: Optional[date] = Query(None, description="Requested check-out date for availability checking"),
    sort_by: Optional[str] = Query(
        None,
        description="Sort order: 'price_asc', 'price_desc', 'rating', 'newest'",
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    if check_in and check_out and check_out <= check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_out date must be strictly after check_in date",
        )

    skip = (page - 1) * limit
    items, total = get_listings(
        db=db,
        location=location,
        city=city,
        country=country,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        guests=guests,
        amenities=amenities,
        check_in=check_in,
        check_out=check_out,
        sort_by=sort_by,
        skip=skip,
        limit=limit,
    )

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedListingsResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        meta=PaginationMeta(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        ),
    )


@router.get(
    "/{id}",
    response_model=ListingDetailResponse,
    summary="Get listing details",
    description="Retrieve complete listing details including gallery images, amenities, host profile, verified reviews, and booked dates.",
)
def get_listing(id: int, db: Session = Depends(get_db)):
    listing_detail = get_listing_detail(db, listing_id=id)
    if not listing_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {id} not found",
        )
    return listing_detail


@router.get(
    "/{id}/availability",
    response_model=AvailabilityResponse,
    summary="Get listing availability calendar",
    description="Retrieve all confirmed booking date intervals and individual ISO date strings that are unavailable for booking.",
)
def get_availability(id: int, db: Session = Depends(get_db)):
    availability = get_listing_availability(db, listing_id=id)
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {id} not found",
        )
    return availability


@router.get(
    "/{id}/reviews",
    response_model=List[ReviewDetailResponse],
    summary="List reviews for a listing",
    description="Retrieve all verified guest reviews with author names and avatars for this listing.",
)
def get_reviews_for_listing(id: int, db: Session = Depends(get_db)):
    try:
        return get_listing_reviews(db, listing_id=id)
    except ReviewError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post(
    "/{id}/reviews",
    response_model=ReviewDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a review for a listing",
    description="Post a 1 to 5 star rating and comment for a specific listing.",
)
def add_review_for_listing(
    id: int,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_review(db, review_in=review_in, listing_id=id)
    except ReviewError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

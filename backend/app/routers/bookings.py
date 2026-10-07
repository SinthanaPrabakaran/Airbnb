from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingDetailResponse
from app.services.booking_service import (
    BookingConflictError,
    BookingError,
    BookingNotFoundError,
    create_booking,
    get_listing_bookings,
    get_user_bookings,
)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


def to_booking_detail_response(b: Booking) -> BookingDetailResponse:
    """Format Booking ORM model into full BookingDetailResponse schema."""
    cover_image = None
    if b.listing and b.listing.images:
        cover_image = b.listing.images[0].image_url

    return BookingDetailResponse(
        id=b.id,
        listing_id=b.listing_id,
        guest_id=b.guest_id,
        check_in=b.check_in,
        check_out=b.check_out,
        guests=b.guests,
        nights=b.nights,
        nightly_total=b.nightly_total,
        cleaning_fee=b.cleaning_fee,
        service_fee=b.service_fee,
        total_price=b.total_price,
        status=b.status,
        created_at=b.created_at,
        listing_title=b.listing.title if b.listing else None,
        listing_city=b.listing.city if b.listing else None,
        listing_country=b.listing.country if b.listing else None,
        cover_image=cover_image,
        guest_name=b.guest.name if b.guest else None,
        guest_email=b.guest.email if b.guest else None,
        host_id=b.listing.host_id if b.listing else None,
    )


@router.post(
    "",
    response_model=BookingDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new stay reservation",
    description="Reserve a listing for a specified date range. All dates, overlap checks, guest capacity, and totals are computed strictly server-side.",
)
def make_booking(booking_in: BookingCreate, db: Session = Depends(get_db)):
    try:
        booking = create_booking(db, booking_in=booking_in)
        return to_booking_detail_response(booking)
    except (BookingConflictError, BookingNotFoundError, BookingError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.get(
    "/user/{user_id}",
    response_model=List[BookingDetailResponse],
    summary="Get user trips / reservations",
    description="Retrieve all confirmed and past bookings for a specific guest user.",
)
def list_user_trips(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    bookings = get_user_bookings(db, guest_id=user_id)
    return [to_booking_detail_response(b) for b in bookings]


@router.get(
    "/listing/{listing_id}",
    response_model=List[BookingDetailResponse],
    summary="Get bookings for a specific listing",
    description="Retrieve all confirmed bookings on a specific property.",
)
def list_listing_reservations(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found",
        )
    bookings = get_listing_bookings(db, listing_id=listing_id)
    return [to_booking_detail_response(b) for b in bookings]

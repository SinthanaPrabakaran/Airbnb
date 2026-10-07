from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database_utils import calculate_pricing, check_booking_overlap
from app.models.booking import Booking
from app.models.listing import Listing
from app.schemas.booking import BookingCreate


class BookingError(Exception):
    pass


def create_booking(db: Session, booking_in: BookingCreate) -> Booking:
    """Create a new booking with date overlap and capacity validation."""
    listing = db.get(Listing, booking_in.listing_id)
    if not listing:
        raise BookingError(f"Listing with id {booking_in.listing_id} not found")

    if booking_in.guests > listing.max_guests:
        raise BookingError(
            f"Guests count ({booking_in.guests}) exceeds maximum allowed ({listing.max_guests})"
        )

    # Check for date overlap
    if check_booking_overlap(
        db,
        listing_id=booking_in.listing_id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
    ):
        raise BookingError("The selected dates are already booked for this listing")

    pricing = calculate_pricing(
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee_rate=listing.service_fee,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
    )

    booking = Booking(
        listing_id=booking_in.listing_id,
        guest_id=booking_in.guest_id,
        check_in=booking_in.check_in,
        check_out=booking_in.check_out,
        guests=booking_in.guests,
        nights=pricing["nights"],
        nightly_total=pricing["nightly_total"],
        cleaning_fee=pricing["cleaning_fee"],
        service_fee=pricing["service_fee"],
        total_price=pricing["total_price"],
        status="confirmed",
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_user_bookings(db: Session, guest_id: int) -> List[Booking]:
    """Retrieve all bookings made by a specific guest."""
    stmt = (
        select(Booking)
        .where(Booking.guest_id == guest_id)
        .options(
            joinedload(Booking.listing).selectinload(Listing.images),
        )
        .order_by(Booking.check_in.desc())
    )
    return list(db.scalars(stmt).unique().all())


def get_host_bookings(db: Session, host_id: int) -> List[Booking]:
    """Retrieve all bookings across listings owned by a specific host."""
    stmt = (
        select(Booking)
        .join(Listing, Booking.listing_id == Listing.id)
        .where(Listing.host_id == host_id)
        .options(
            joinedload(Booking.guest),
            joinedload(Booking.listing),
        )
        .order_by(Booking.check_in.desc())
    )
    return list(db.scalars(stmt).unique().all())


def cancel_booking(db: Session, booking_id: int, user_id: int) -> Optional[Booking]:
    """Cancel a booking if the requesting user is the guest or the listing host."""
    booking = db.get(Booking, booking_id)
    if not booking:
        return None

    listing = db.get(Listing, booking.listing_id)
    if booking.guest_id != user_id and (listing and listing.host_id != user_id):
        raise BookingError("Unauthorized to cancel this booking")

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking

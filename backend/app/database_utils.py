"""Database and domain computation utility functions.

These reusable helpers handle calculations, overlap checks,
aggregations, and pagination for SQLite and SQLAlchemy operations.
"""

from __future__ import annotations
from datetime import date
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.review import Review


def calculate_pricing(
    price_per_night: float,
    cleaning_fee: float,
    service_fee_rate: float,
    check_in: date,
    check_out: date,
) -> Dict[str, Any]:
    """Calculate nights, nightly_total, cleaning_fee, service_fee, and total_price."""
    nights = (check_out - check_in).days
    if nights <= 0:
        raise ValueError("check_out date must be strictly after check_in date")

    nightly_total = round(price_per_night * nights, 2)
    # If service_fee_rate is given as e.g. 0.14 (14%), compute it; if 0, default to 14%
    fee_rate = service_fee_rate if service_fee_rate > 0 else 0.14
    calculated_service_fee = round(nightly_total * fee_rate, 2)
    total_price = round(nightly_total + cleaning_fee + calculated_service_fee, 2)

    return {
        "nights": nights,
        "nightly_total": nightly_total,
        "cleaning_fee": round(cleaning_fee, 2),
        "service_fee": calculated_service_fee,
        "total_price": total_price,
    }


def check_booking_overlap(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: Optional[int] = None,
) -> bool:
    """Return True if an overlapping confirmed booking exists for this listing."""
    stmt = (
        select(Booking)
        .where(
            Booking.listing_id == listing_id,
            Booking.status != "cancelled",
            # Standard interval overlap condition: A.start < B.end AND A.end > B.start
            Booking.check_in < check_out,
            Booking.check_out > check_in,
        )
    )
    if exclude_booking_id is not None:
        stmt = stmt.where(Booking.id != exclude_booking_id)

    overlapping = db.scalar(stmt)
    return overlapping is not None


def get_listing_review_stats(
    db: Session,
    listing_id: int,
) -> Tuple[Optional[float], int]:
    """Return (average_rating, review_count) for a given listing."""
    stmt = (
        select(
            func.avg(Review.rating),
            func.count(Review.id),
        )
        .where(Review.listing_id == listing_id)
    )
    avg_rating, count = db.execute(stmt).one()
    rounded_avg = round(float(avg_rating), 2) if avg_rating is not None else None
    return rounded_avg, count or 0


def paginate(
    db: Session,
    statement: Select,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Any], int, int]:
    """Execute a paginated query and return (items, total_count, total_pages)."""
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20

    # Count total
    count_stmt = select(func.count()).select_from(statement.subquery())
    total_count = db.scalar(count_stmt) or 0

    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    # Offset & limit
    offset = (page - 1) * page_size
    items = list(db.scalars(statement.offset(offset).limit(page_size)).all())

    return items, total_count, total_pages

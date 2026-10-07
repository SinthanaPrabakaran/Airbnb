from __future__ import annotations
from datetime import date, timedelta
from typing import List, Optional, Tuple
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database_utils import check_booking_overlap, get_listing_review_stats
from app.models.amenity import Amenity, listing_amenities
from app.models.booking import Booking
from app.models.listing import Listing, ListingImage
from app.models.review import Review
from app.schemas.listing import (
    AvailabilityResponse,
    DateRange,
    ListingCreate,
    ListingDetailResponse,
    ListingSummaryResponse,
    ListingUpdate,
)
from app.schemas.review import ReviewDetailResponse
from app.schemas.user import UserPublic


def get_listing_by_id(
    db: Session,
    listing_id: int,
    with_relations: bool = True,
) -> Optional[Listing]:
    """Retrieve a single listing by ID, optionally eager-loading images, amenities, and host."""
    stmt = select(Listing).where(Listing.id == listing_id)
    if with_relations:
        stmt = stmt.options(
            joinedload(Listing.host),
            selectinload(Listing.images),
            selectinload(Listing.amenities),
        )
    return db.scalar(stmt)


def get_listings(
    db: Session,
    location: Optional[str] = None,
    city: Optional[str] = None,
    country: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    bedrooms: Optional[int] = None,
    beds: Optional[int] = None,
    bathrooms: Optional[float] = None,
    amenities: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    host_id: Optional[int] = None,
    sort_by: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[ListingSummaryResponse], int]:
    """Search and filter listings with support for location, price range, property type,

    capacity, amenities, date availability, sorting, and pagination.
    """
    stmt = select(Listing).options(
        joinedload(Listing.host),
        selectinload(Listing.images),
        selectinload(Listing.amenities),
    )

    if host_id is not None:
        stmt = stmt.where(Listing.host_id == host_id)

    # General location search (searches across location, city, country, title)
    if location and location.strip():
        loc_term = f"%{location.strip()}%"
        stmt = stmt.where(
            or_(
                Listing.city.ilike(loc_term),
                Listing.country.ilike(loc_term),
                Listing.location.ilike(loc_term),
                Listing.title.ilike(loc_term),
            )
        )

    if city and city.strip():
        stmt = stmt.where(Listing.city.ilike(f"%{city.strip()}%"))
    if country and country.strip():
        stmt = stmt.where(Listing.country.ilike(f"%{country.strip()}%"))
    if property_type and property_type.strip():
        stmt = stmt.where(Listing.property_type.ilike(property_type.strip()))
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if guests is not None:
        stmt = stmt.where(Listing.max_guests >= guests)
    if bedrooms is not None:
        stmt = stmt.where(Listing.bedrooms >= bedrooms)
    if beds is not None:
        stmt = stmt.where(Listing.beds >= beds)
    if bathrooms is not None:
        stmt = stmt.where(Listing.bathrooms >= bathrooms)

    # Filter by amenities (comma-separated list of names or IDs, e.g. "Wifi,Pool" or "1,2")
    if amenities and amenities.strip():
        raw_items = [item.strip() for item in amenities.split(",") if item.strip()]
        for item in raw_items:
            if item.isdigit():
                stmt = stmt.where(
                    Listing.id.in_(
                        select(listing_amenities.c.listing_id).where(
                            listing_amenities.c.amenity_id == int(item)
                        )
                    )
                )
            else:
                stmt = stmt.where(
                    Listing.amenities.any(Amenity.name.ilike(f"%{item}%"))
                )

    all_listings = list(db.scalars(stmt).unique().all())

    # Date availability filter if check_in and check_out are provided
    if check_in and check_out:
        available_listings = []
        for listing in all_listings:
            if not check_booking_overlap(db, listing.id, check_in, check_out):
                available_listings.append(listing)
        all_listings = available_listings

    # Map to ListingSummaryResponse with review stats and cover images
    summary_items: List[ListingSummaryResponse] = []
    for l in all_listings:
        avg_rating, rev_count = get_listing_review_stats(db, l.id)
        cover_url = l.images[0].image_url if l.images else None
        summary_items.append(
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

    # In-memory sorting (covers computed ratings as well as database columns)
    if sort_by == "price_asc":
        summary_items.sort(key=lambda x: x.price_per_night)
    elif sort_by == "price_desc":
        summary_items.sort(key=lambda x: x.price_per_night, reverse=True)
    elif sort_by == "rating":
        summary_items.sort(key=lambda x: (x.average_rating or 0, x.review_count), reverse=True)
    elif sort_by == "newest":
        summary_items.sort(key=lambda x: x.created_at, reverse=True)

    total_count = len(summary_items)
    paginated = summary_items[skip : skip + limit]
    return paginated, total_count


def get_listing_detail(db: Session, listing_id: int) -> Optional[ListingDetailResponse]:
    """Retrieve full listing detail with host, images, amenities, reviews, rating, and booked dates."""
    listing = get_listing_by_id(db, listing_id, with_relations=True)
    if not listing:
        return None

    avg_rating, rev_count = get_listing_review_stats(db, listing.id)

    # Load reviews with guest user info
    reviews_stmt = (
        select(Review)
        .where(Review.listing_id == listing_id)
        .options(joinedload(Review.guest))
        .order_by(Review.created_at.desc())
    )
    reviews_entities = list(db.scalars(reviews_stmt).unique().all())
    reviews_dto = [
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

    # Compute unavailable dates from active bookings
    unavailable_dates = get_unavailable_dates(db, listing_id)

    return ListingDetailResponse(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        location=listing.location,
        city=listing.city,
        country=listing.country,
        latitude=listing.latitude,
        longitude=listing.longitude,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee=listing.service_fee,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        created_at=listing.created_at,
        updated_at=listing.updated_at,
        host=UserPublic.model_validate(listing.host) if listing.host else None,
        images=[img for img in listing.images],
        amenities=[am for am in listing.amenities],
        average_rating=avg_rating,
        review_count=rev_count,
        reviews=reviews_dto,
        unavailable_dates=unavailable_dates,
    )


def get_unavailable_dates(db: Session, listing_id: int) -> List[str]:
    """Return a sorted list of unique ISO date strings ('YYYY-MM-DD') that are booked for this listing."""
    bookings_stmt = (
        select(Booking)
        .where(Booking.listing_id == listing_id, Booking.status != "cancelled")
        .order_by(Booking.check_in.asc())
    )
    active_bookings = list(db.scalars(bookings_stmt).all())

    dates_set = set()
    for b in active_bookings:
        curr = b.check_in
        while curr < b.check_out:
            dates_set.add(curr.isoformat())
            curr += timedelta(days=1)

    return sorted(list(dates_set))


def get_listing_availability(db: Session, listing_id: int) -> Optional[AvailabilityResponse]:
    """Return booked date ranges and all unavailable date strings for a listing."""
    listing = db.get(Listing, listing_id)
    if not listing:
        return None

    bookings_stmt = (
        select(Booking)
        .where(Booking.listing_id == listing_id, Booking.status != "cancelled")
        .order_by(Booking.check_in.asc())
    )
    active_bookings = list(db.scalars(bookings_stmt).all())

    booked_ranges = [
        DateRange(check_in=b.check_in, check_out=b.check_out) for b in active_bookings
    ]
    unavailable_dates = get_unavailable_dates(db, listing_id)

    return AvailabilityResponse(
        listing_id=listing_id,
        booked_ranges=booked_ranges,
        unavailable_dates=unavailable_dates,
    )


def create_listing(db: Session, listing_in: ListingCreate) -> Listing:
    """Create a new listing, attaching amenities and images."""
    listing = Listing(
        host_id=listing_in.host_id,
        title=listing_in.title,
        description=listing_in.description,
        property_type=listing_in.property_type,
        location=listing_in.location,
        city=listing_in.city,
        country=listing_in.country,
        latitude=listing_in.latitude,
        longitude=listing_in.longitude,
        price_per_night=listing_in.price_per_night,
        cleaning_fee=listing_in.cleaning_fee,
        service_fee=listing_in.service_fee,
        max_guests=listing_in.max_guests,
        bedrooms=listing_in.bedrooms,
        beds=listing_in.beds,
        bathrooms=listing_in.bathrooms,
    )

    if listing_in.amenity_ids:
        amenities = list(
            db.scalars(select(Amenity).where(Amenity.id.in_(listing_in.amenity_ids))).all()
        )
        listing.amenities = amenities

    if listing_in.image_urls:
        for idx, url in enumerate(listing_in.image_urls):
            listing.images.append(
                ListingImage(image_url=url, display_order=idx)
            )

    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


def update_listing(
    db: Session,
    listing_id: int,
    listing_in: ListingUpdate,
) -> Optional[Listing]:
    """Update listing details, amenities, and images."""
    listing = get_listing_by_id(db, listing_id, with_relations=True)
    if not listing:
        return None

    update_data = listing_in.model_dump(exclude_unset=True)
    amenity_ids = update_data.pop("amenity_ids", None)
    image_urls = update_data.pop("image_urls", None)

    for field, value in update_data.items():
        setattr(listing, field, value)

    if amenity_ids is not None:
        amenities = list(
            db.scalars(select(Amenity).where(Amenity.id.in_(amenity_ids))).all()
        )
        listing.amenities = amenities

    if image_urls is not None:
        listing.images.clear()
        for idx, url in enumerate(image_urls):
            listing.images.append(
                ListingImage(image_url=url, display_order=idx)
            )

    db.commit()
    db.refresh(listing)
    return listing


def delete_listing(db: Session, listing_id: int) -> bool:
    """Delete a listing by ID."""
    listing = db.get(Listing, listing_id)
    if not listing:
        return False
    db.delete(listing)
    db.commit()
    return True

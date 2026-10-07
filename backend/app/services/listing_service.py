from __future__ import annotations
from datetime import date
from typing import List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.database_utils import check_booking_overlap, get_listing_review_stats
from app.models.amenity import Amenity
from app.models.listing import Listing, ListingImage
from app.schemas.listing import ListingCreate, ListingUpdate


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
    city: Optional[str] = None,
    country: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    guests: Optional[int] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    host_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Listing], int]:
    """Search and filter listings with support for availability, location, price, and capacity."""
    stmt = select(Listing).options(
        joinedload(Listing.host),
        selectinload(Listing.images),
        selectinload(Listing.amenities),
    )

    if host_id is not None:
        stmt = stmt.where(Listing.host_id == host_id)
    if city:
        stmt = stmt.where(Listing.city.ilike(f"%{city}%"))
    if country:
        stmt = stmt.where(Listing.country.ilike(f"%{country}%"))
    if property_type:
        stmt = stmt.where(Listing.property_type.ilike(property_type))
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if guests is not None:
        stmt = stmt.where(Listing.max_guests >= guests)

    all_listings = list(db.scalars(stmt).unique().all())

    # Date availability filter if check_in and check_out are provided
    if check_in and check_out:
        available_listings = []
        for listing in all_listings:
            if not check_booking_overlap(db, listing.id, check_in, check_out):
                available_listings.append(listing)
        all_listings = available_listings

    total_count = len(all_listings)
    paginated = all_listings[skip : skip + limit]
    return paginated, total_count


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
    """Update listing details and amenities."""
    listing = get_listing_by_id(db, listing_id, with_relations=True)
    if not listing:
        return None

    update_data = listing_in.model_dump(exclude_unset=True)
    amenity_ids = update_data.pop("amenity_ids", None)

    for field, value in update_data.items():
        setattr(listing, field, value)

    if amenity_ids is not None:
        amenities = list(
            db.scalars(select(Amenity).where(Amenity.id.in_(amenity_ids))).all()
        )
        listing.amenities = amenities

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

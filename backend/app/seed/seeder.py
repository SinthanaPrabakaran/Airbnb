"""Database seeder implementation.

Ensures idempotent seeding with optional full reset.
Supports running standalone via `python -m app.seed` or on backend startup.
"""

from __future__ import annotations
import sys
from typing import Dict, List
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db, reset_db
from app.database_utils import calculate_pricing
from app.models.amenity import Amenity
from app.models.booking import Booking
from app.models.favorite import Favorite
from app.models.listing import Listing, ListingImage
from app.models.review import Review
from app.models.user import User
from app.seed.seed_data import (
    AMENITIES_DATA,
    FAVORITES_DATA,
    LISTINGS_DATA,
    REVIEWS_DATA,
    USERS_DATA,
    get_sample_bookings,
)


def seed_database(reset: bool = False, session: Session = None) -> Dict[str, int]:
    """Safely seed the database.

    If `reset=True`, drops and recreates all tables before seeding.
    If `reset=False` and listings exist, skips seeding to preserve idempotency.
    """
    if reset:
        print("[SEED] Reset flag passed. Dropping and recreating all tables...")
        reset_db()
    else:
        init_db()

    owns_session = False
    if session is None:
        session = SessionLocal()
        owns_session = True

    try:
        # Check idempotency: if already seeded and not resetting, skip
        existing_listing_count = session.scalar(select(func.count(Listing.id))) or 0
        if existing_listing_count > 0 and not reset:
            print(
                f"[SEED] Database already populated with {existing_listing_count} listings. "
                "Skipping seed to prevent duplicates. (Run with reset=True to wipe & re-seed)."
            )
            return {"status": "skipped", "existing_listings": existing_listing_count}

        print("[SEED] Seeding database with fresh Airbnb data...")

        # 1. Seed Amenities
        amenities_map: Dict[str, Amenity] = {}
        for item in AMENITIES_DATA:
            amenity = session.scalar(select(Amenity).where(Amenity.name == item["name"]))
            if not amenity:
                amenity = Amenity(name=item["name"], icon=item.get("icon"))
                session.add(amenity)
                session.flush()
            amenities_map[amenity.name] = amenity

        print(f"[SEED] Seeded {len(amenities_map)} amenities.")

        # 2. Seed Users
        users_map: Dict[str, User] = {}
        for item in USERS_DATA:
            user = session.scalar(select(User).where(User.email == item["email"]))
            if not user:
                user = User(
                    name=item["name"],
                    email=item["email"],
                    avatar=item["avatar"],
                    role=item["role"],
                )
                session.add(user)
                session.flush()
            users_map[user.email] = user

        print(f"[SEED] Seeded {len(users_map)} users (hosts & guests).")

        # 3. Seed Listings & Listing Images
        seeded_listings: List[Listing] = []
        for item in LISTINGS_DATA:
            host = users_map[item["host_email"]]
            listing = Listing(
                host_id=host.id,
                title=item["title"],
                description=item["description"],
                property_type=item["property_type"],
                location=item["location"],
                city=item["city"],
                country=item["country"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                price_per_night=item["price_per_night"],
                cleaning_fee=item["cleaning_fee"],
                service_fee=item["service_fee"],
                max_guests=item["max_guests"],
                bedrooms=item["bedrooms"],
                beds=item["beds"],
                bathrooms=item["bathrooms"],
            )

            # Link amenities
            for am_name in item["amenity_names"]:
                if am_name in amenities_map:
                    listing.amenities.append(amenities_map[am_name])

            # Link images
            for order, img_url in enumerate(item["images"]):
                listing.images.append(
                    ListingImage(image_url=img_url, display_order=order)
                )

            session.add(listing)
            session.flush()
            seeded_listings.append(listing)

        print(f"[SEED] Seeded {len(seeded_listings)} listings with photos.")

        # 4. Seed Reviews
        review_count = 0
        for item in REVIEWS_DATA:
            listing = seeded_listings[item["listing_index"]]
            guest = users_map[item["guest_email"]]
            review = Review(
                listing_id=listing.id,
                guest_id=guest.id,
                rating=item["rating"],
                comment=item["comment"],
            )
            session.add(review)
            review_count += 1

        session.flush()
        print(f"[SEED] Seeded {review_count} verified guest reviews.")

        # 5. Seed Bookings
        booking_count = 0
        sample_bookings = get_sample_bookings()
        for item in sample_bookings:
            listing = seeded_listings[item["listing_index"]]
            guest = users_map[item["guest_email"]]

            pricing = calculate_pricing(
                price_per_night=listing.price_per_night,
                cleaning_fee=listing.cleaning_fee,
                service_fee_rate=listing.service_fee,
                check_in=item["check_in"],
                check_out=item["check_out"],
            )

            booking = Booking(
                listing_id=listing.id,
                guest_id=guest.id,
                check_in=item["check_in"],
                check_out=item["check_out"],
                guests=item["guests"],
                nights=pricing["nights"],
                nightly_total=pricing["nightly_total"],
                cleaning_fee=pricing["cleaning_fee"],
                service_fee=pricing["service_fee"],
                total_price=pricing["total_price"],
                status=item["status"],
            )
            session.add(booking)
            booking_count += 1

        session.flush()
        print(f"[SEED] Seeded {booking_count} sample bookings.")

        # 6. Seed Favorites / Wishlists
        favorite_count = 0
        for item in FAVORITES_DATA:
            guest = users_map[item["guest_email"]]
            for list_idx in item["listing_indexes"]:
                listing = seeded_listings[list_idx]
                fav = Favorite(user_id=guest.id, listing_id=listing.id)
                session.add(fav)
                favorite_count += 1

        session.flush()
        print(f"[SEED] Seeded {favorite_count} user wishlist favorites.")

        session.commit()
        print("[SEED] Database seeding completed successfully!")

        return {
            "status": "success",
            "amenities": len(amenities_map),
            "users": len(users_map),
            "listings": len(seeded_listings),
            "reviews": review_count,
            "bookings": booking_count,
            "favorites": favorite_count,
        }
    except Exception as e:
        session.rollback()
        print(f"[SEED ERROR] Error seeding database: {e}", file=sys.stderr)
        raise
    finally:
        if owns_session:
            session.close()


def auto_seed_if_empty() -> None:
    """Safe helper to auto-populate empty database on application boot."""
    init_db()
    with SessionLocal() as db:
        count = db.scalar(select(func.count(Listing.id))) or 0
        if count == 0:
            print("[AUTO-SEED] Empty database detected. Populating initial data...")
            seed_database(reset=False, session=db)
        else:
            print(f"[AUTO-SEED] Database already contains {count} listings.")

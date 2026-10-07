"""Verification script to rigorously test all models, relationships, constraints, and utilities."""

import sys
from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.database_utils import (
    calculate_pricing,
    check_booking_overlap,
    get_listing_review_stats,
    paginate,
)
from app.models.amenity import Amenity
from app.models.booking import Booking
from app.models.favorite import Favorite
from app.models.listing import Listing, ListingImage
from app.models.review import Review
from app.models.user import User
from app.services.booking_service import create_booking, BookingError
from app.services.favorite_service import toggle_favorite, is_favorited, get_user_favorites
from app.services.listing_service import get_listings, get_listing_by_id
from app.services.review_service import get_listing_reviews


def run_verifications():
    db: Session = SessionLocal()
    print("=" * 60)
    print("RUNNING DATABASE LAYER VERIFICATION TESTS")
    print("=" * 60)

    try:
        # 1. Verify User and Role checks
        users = list(db.scalars(select(User)).all())
        hosts = [u for u in users if u.role == "host"]
        guests = [u for u in users if u.role == "guest"]
        print(f"[TEST 1] Users verification: Total={len(users)}, Hosts={len(hosts)}, Guests={len(guests)}")
        assert len(users) >= 5, f"Expected >= 5 users, got {len(users)}"
        assert len(hosts) >= 3, f"Expected >= 3 hosts, got {len(hosts)}"
        print("  -> PASSED: User count and host/guest requirements verified.")

        # 2. Verify Listings and host relationship
        listings = list(db.scalars(select(Listing)).all())
        print(f"[TEST 2] Listings verification: Total={len(listings)}")
        assert len(listings) >= 15, f"Expected >= 15 listings, got {len(listings)}"
        for l in listings[:3]:
            assert l.host is not None, f"Listing {l.id} has no host"
            assert l.host.role == "host", f"Listing host {l.host.id} has invalid role"
        print("  -> PASSED: Listings and host back_populates verified.")

        # 3. Verify Images relationship and ordering
        for l in listings[:5]:
            images = l.images
            assert len(images) >= 2, f"Listing {l.id} has fewer than 2 images ({len(images)})"
            orders = [img.display_order for img in images]
            assert orders == sorted(orders), f"Listing {l.id} images not ordered by display_order"
        print("  -> PASSED: Listing images relationship and ordering verified.")

        # 4. Verify Many-to-Many Amenities relationship
        amenities = list(db.scalars(select(Amenity)).all())
        print(f"[TEST 3] Amenities verification: Total={len(amenities)}")
        for l in listings[:5]:
            assert len(l.amenities) > 0, f"Listing {l.id} has 0 amenities"
            # Reverse relationship
            for am in l.amenities:
                assert l in am.listings, f"Listing {l.id} not in reverse am.listings"
        print("  -> PASSED: Many-to-many relationship with amenities bidirectional access verified.")

        # 5. Verify Reviews relationship
        reviews = list(db.scalars(select(Review)).all())
        print(f"[TEST 4] Reviews verification: Total={len(reviews)}")
        assert len(reviews) > 0, "No reviews seeded"
        sample_rev = reviews[0]
        assert sample_rev.listing is not None
        assert sample_rev.guest is not None
        assert 1 <= sample_rev.rating <= 5
        print(f"  -> PASSED: Review relationship verified (Rating: {sample_rev.rating}/5, Guest: {sample_rev.guest.name}).")

        # 6. Verify Bookings and Pricing
        bookings = list(db.scalars(select(Booking)).all())
        print(f"[TEST 5] Bookings verification: Total={len(bookings)}")
        assert len(bookings) > 0, "No bookings seeded"
        sample_b = bookings[0]
        assert sample_b.nights == (sample_b.check_out - sample_b.check_in).days
        expected_total = round(sample_b.nightly_total + sample_b.cleaning_fee + sample_b.service_fee, 2)
        assert abs(sample_b.total_price - expected_total) < 0.05, f"Total mismatch: {sample_b.total_price} vs {expected_total}"
        print(f"  -> PASSED: Booking nights & fee calculation verified (Total: ${sample_b.total_price}).")

        # 7. Verify Favorites
        favorites = list(db.scalars(select(Favorite)).all())
        print(f"[TEST 6] Favorites verification: Total={len(favorites)}")
        assert len(favorites) > 0, "No favorites seeded"
        sample_fav = favorites[0]
        assert sample_fav.user is not None
        assert sample_fav.listing is not None
        print(f"  -> PASSED: Favorites relationship verified ({sample_fav.user.name} favorited {sample_fav.listing.title}).")

        # 8. Test Review Stats Utility
        first_listing_id = listings[0].id
        avg_rating, count = get_listing_review_stats(db, first_listing_id)
        print(f"[TEST 7] Review stats utility: Listing ID {first_listing_id} has avg={avg_rating}, count={count}")
        assert count > 0 and avg_rating is not None
        print("  -> PASSED: Review aggregation utility verified.")

        # 9. Test Overlap Booking Check & Prevention
        today = date.today()
        # Find active booking dates
        first_booking = bookings[0]
        has_overlap = check_booking_overlap(
            db,
            listing_id=first_booking.listing_id,
            check_in=first_booking.check_in,
            check_out=first_booking.check_out,
        )
        assert has_overlap is True, "Expected overlap check to return True for existing booking"

        # Check booking service rejects overlapping booking
        try:
            from app.schemas.booking import BookingCreate
            create_booking(
                db,
                BookingCreate(
                    listing_id=first_booking.listing_id,
                    guest_id=guests[0].id,
                    check_in=first_booking.check_in,
                    check_out=first_booking.check_out,
                    guests=1,
                ),
            )
            assert False, "create_booking should have raised BookingError on overlap"
        except BookingError as be:
            print(f"  -> PASSED: Overlapping booking correctly rejected with error: '{be}'")

        # 10. Test Pricing Utility
        pricing = calculate_pricing(
            price_per_night=200.0,
            cleaning_fee=50.0,
            service_fee_rate=0.14,
            check_in=today,
            check_out=today + timedelta(days=3),
        )
        assert pricing["nights"] == 3
        assert pricing["nightly_total"] == 600.0
        assert pricing["service_fee"] == 84.0
        assert pricing["total_price"] == 734.0
        print("  -> PASSED: Pricing calculator formula verified.")

        # 11. Test Search and Filter Service
        paris_results, total_paris = get_listings(db, city="Paris")
        assert total_paris >= 1
        assert "Paris" in paris_results[0].city
        print(f"  -> PASSED: Search filter verified (Found {total_paris} listings in Paris).")

        # 12. Test Pagination Utility
        stmt = select(Listing).order_by(Listing.id)
        page1, total, pages = paginate(db, stmt, page=1, page_size=5)
        assert len(page1) == 5
        assert total == len(listings)
        assert pages >= 3
        print(f"  -> PASSED: Pagination utility verified (5 items on page 1 of {pages} pages).")

        # 13. Test Favorite Toggle Service
        guest_id = guests[0].id
        fav_listing_id = listings[14].id
        initial_status = is_favorited(db, guest_id, fav_listing_id)
        # Toggle once
        res1 = toggle_favorite(db, guest_id, fav_listing_id)
        assert res1 != initial_status
        # Toggle back
        res2 = toggle_favorite(db, guest_id, fav_listing_id)
        assert res2 == initial_status
        print("  -> PASSED: Wishlist favorite toggle service verified.")

        print("=" * 60)
        print("ALL 13 VERIFICATION TESTS PASSED SUCCESSFULLY!")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    run_verifications()

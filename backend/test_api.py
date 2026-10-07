"""Integration test suite to verify all REST API endpoints, validations, and rules using FastAPI TestClient."""

from datetime import date, timedelta
from starlette.testclient import TestClient

from app.main import app

client = TestClient(app)


def run_tests():
    print("=" * 65)
    print("TESTING AIRBNB REST API ENDPOINTS VIA FASTAPI TESTCLIENT")
    print("=" * 65)

    # 1. Health check
    resp = client.get("/api/health")
    assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
    assert resp.json()["status"] == "ok"
    print("[1] GET /api/health -> 200 OK")

    # 2. Amenities catalog
    resp = client.get("/api/amenities")
    assert resp.status_code == 200
    amenities = resp.json()
    assert len(amenities) >= 15
    print(f"[2] GET /api/amenities -> 200 OK (count={len(amenities)})")

    # 3. Users endpoint
    resp = client.get("/api/users")
    assert resp.status_code == 200
    users = resp.json()
    assert len(users) >= 5
    print(f"[3] GET /api/users -> 200 OK (count={len(users)})")

    # Pick sample users
    hosts = [u for u in users if u["role"] == "host"]
    guests = [u for u in users if u["role"] == "guest"]
    host_id = hosts[0]["id"]
    guest_id = guests[0]["id"]

    resp = client.get(f"/api/users/{guest_id}")
    assert resp.status_code == 200
    user_detail = resp.json()
    assert user_detail["id"] == guest_id
    print(f"[4] GET /api/users/{guest_id} -> 200 OK ({user_detail['name']})")

    # 4. Listings browse & filter
    resp = client.get("/api/listings?page=1&limit=10")
    assert resp.status_code == 200
    listings_resp = resp.json()
    assert listings_resp["total"] >= 15
    assert len(listings_resp["items"]) == 10
    assert "cover_image" in listings_resp["items"][0]
    first_listing = listings_resp["items"][0]
    listing_id = first_listing["id"]
    print(f"[5] GET /api/listings -> 200 OK (total={listings_resp['total']}, page=1, limit=10)")

    # Location search
    resp = client.get("/api/listings?location=Paris")
    assert resp.status_code == 200
    paris_res = resp.json()
    assert paris_res["total"] >= 1
    assert "Paris" in paris_res["items"][0]["city"]
    print(f"[6] GET /api/listings?location=Paris -> 200 OK (found {paris_res['total']})")

    # Price filter
    resp = client.get("/api/listings?min_price=400&max_price=800")
    assert resp.status_code == 200
    price_res = resp.json()
    for item in price_res["items"]:
        assert 400 <= item["price_per_night"] <= 800
    print(f"[7] GET /api/listings?min_price=400&max_price=800 -> 200 OK (found {price_res['total']})")

    # Sorting
    resp = client.get("/api/listings?sort_by=price_asc&limit=5")
    assert resp.status_code == 200
    prices_asc = [x["price_per_night"] for x in resp.json()["items"]]
    assert prices_asc == sorted(prices_asc)
    print(f"[8] GET /api/listings?sort_by=price_asc -> 200 OK (prices: {prices_asc})")

    # 5. Listing Detail
    resp = client.get(f"/api/listings/{listing_id}")
    assert resp.status_code == 200
    detail = resp.json()
    assert detail["id"] == listing_id
    assert len(detail["images"]) >= 2
    assert len(detail["amenities"]) >= 1
    assert detail["host"] is not None
    assert "reviews" in detail
    assert "unavailable_dates" in detail
    print(f"[9] GET /api/listings/{listing_id} -> 200 OK ({detail['title']})")

    # 6. Listing Availability
    resp = client.get(f"/api/listings/{listing_id}/availability")
    assert resp.status_code == 200
    avail = resp.json()
    assert avail["listing_id"] == listing_id
    assert "booked_ranges" in avail
    assert "unavailable_dates" in avail
    print(f"[10] GET /api/listings/{listing_id}/availability -> 200 OK (booked ranges={len(avail['booked_ranges'])})")

    # 7. Reviews
    resp = client.get(f"/api/listings/{listing_id}/reviews")
    assert resp.status_code == 200
    reviews = resp.json()
    assert isinstance(reviews, list)
    print(f"[11] GET /api/listings/{listing_id}/reviews -> 200 OK (count={len(reviews)})")

    # Post new review
    review_payload = {
        "guest_id": guest_id,
        "rating": 5,
        "comment": "Absolutely spectacular stay! Will definitely visit again.",
    }
    resp = client.post(f"/api/listings/{listing_id}/reviews", json=review_payload)
    assert resp.status_code == 201
    new_rev = resp.json()
    assert new_rev["rating"] == 5
    print(f"[12] POST /api/listings/{listing_id}/reviews -> 201 Created (Review ID {new_rev['id']})")

    # 8. Favorites
    fav_payload = {"user_id": guest_id, "listing_id": listing_id}
    resp = client.post("/api/favorites", json=fav_payload)
    assert resp.status_code == 201
    print(f"[13] POST /api/favorites -> 201 Created")

    resp = client.get(f"/api/favorites/{guest_id}")
    assert resp.status_code == 200
    fav_list = resp.json()
    assert any(f["id"] == listing_id for f in fav_list)
    print(f"[14] GET /api/favorites/{guest_id} -> 200 OK (count={len(fav_list)})")

    resp = client.delete(f"/api/favorites/{guest_id}/{listing_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    print(f"[15] DELETE /api/favorites/{guest_id}/{listing_id} -> 200 OK")

    # 9. Bookings Validation & Creation
    today = date.today()

    # Past date validation
    past_booking = {
        "listing_id": listing_id,
        "guest_id": guest_id,
        "check_in": (today - timedelta(days=5)).isoformat(),
        "check_out": (today - timedelta(days=2)).isoformat(),
        "guests": 1,
    }
    resp = client.post("/api/bookings", json=past_booking)
    assert resp.status_code == 400
    assert "past" in resp.json()["detail"].lower()
    print(f"[16] POST /api/bookings (past dates) -> 400 Bad Request rejected correctly")

    # Check-out before check-in validation
    invalid_dates_booking = {
        "listing_id": listing_id,
        "guest_id": guest_id,
        "check_in": (today + timedelta(days=50)).isoformat(),
        "check_out": (today + timedelta(days=48)).isoformat(),
        "guests": 1,
    }
    resp = client.post("/api/bookings", json=invalid_dates_booking)
    assert resp.status_code in (400, 422)
    print(f"[17] POST /api/bookings (check_out <= check_in) -> 400/422 rejected correctly")

    # Guests exceeding capacity
    excess_guests_booking = {
        "listing_id": listing_id,
        "guest_id": guest_id,
        "check_in": (today + timedelta(days=60)).isoformat(),
        "check_out": (today + timedelta(days=63)).isoformat(),
        "guests": 99,
    }
    resp = client.post("/api/bookings", json=excess_guests_booking)
    assert resp.status_code == 400
    assert "exceed" in resp.json()["detail"].lower()
    print(f"[18] POST /api/bookings (excess guests) -> 400 Bad Request rejected correctly")

    # Dynamically find a non-overlapping future date window for repeated test idempotency
    avail_resp = client.get(f"/api/listings/{listing_id}/availability").json()
    booked_dates_set = set(avail_resp.get("unavailable_dates", []))
    offset = 70
    while True:
        candidate_start = today + timedelta(days=offset)
        candidate_end = today + timedelta(days=offset + 4)
        has_conflict = False
        curr = candidate_start
        while curr < candidate_end:
            if curr.isoformat() in booked_dates_set:
                has_conflict = True
                break
            curr += timedelta(days=1)
        if not has_conflict:
            future_start = candidate_start
            future_end = candidate_end
            break
        offset += 10

    valid_booking = {
        "listing_id": listing_id,
        "guest_id": guest_id,
        "check_in": future_start.isoformat(),
        "check_out": future_end.isoformat(),
        "guests": 2,
    }
    resp = client.post("/api/bookings", json=valid_booking)
    assert resp.status_code == 201
    created_booking = resp.json()
    assert created_booking["nights"] == 4
    expected_nightly = round(4 * detail["price_per_night"], 2)
    assert created_booking["nightly_total"] == expected_nightly
    assert created_booking["total_price"] > expected_nightly  # Includes cleaning + service fee
    print(f"[19] POST /api/bookings (valid) -> 201 Created (ID={created_booking['id']}, Total=${created_booking['total_price']})")

    # Overlapping dates rejection
    overlap_booking = {
        "listing_id": listing_id,
        "guest_id": guest_id,
        "check_in": (future_start + timedelta(days=1)).isoformat(),
        "check_out": (future_end + timedelta(days=2)).isoformat(),
        "guests": 1,
    }
    resp = client.post("/api/bookings", json=overlap_booking)
    assert resp.status_code in (400, 409)
    print(f"[20] POST /api/bookings (overlapping dates) -> 409 Conflict rejected correctly")

    # Get user trips
    resp = client.get(f"/api/bookings/user/{guest_id}")
    assert resp.status_code == 200
    trips = resp.json()
    assert any(b["id"] == created_booking["id"] for b in trips)
    print(f"[21] GET /api/bookings/user/{guest_id} -> 200 OK (count={len(trips)})")

    # Get listing reservations
    resp = client.get(f"/api/bookings/listing/{listing_id}")
    assert resp.status_code == 200
    listing_resvs = resp.json()
    assert any(b["id"] == created_booking["id"] for b in listing_resvs)
    print(f"[22] GET /api/bookings/listing/{listing_id} -> 200 OK (count={len(listing_resvs)})")

    # 10. Host Operations
    # Create listing as host
    new_listing_payload = {
        "host_id": host_id,
        "title": "Modern Nordic Glass Haven in Lofoten",
        "description": "Spectacular Arctic architectural haven with floor to ceiling glass viewing the fjords.",
        "property_type": "Cabin",
        "location": "Reine Fjord Way",
        "city": "Reine",
        "country": "Norway",
        "price_per_night": 320.0,
        "cleaning_fee": 60.0,
        "service_fee": 0.14,
        "max_guests": 4,
        "bedrooms": 2,
        "beds": 2,
        "bathrooms": 1.5,
        "amenity_ids": [amenities[0]["id"], amenities[1]["id"]],
        "image_urls": ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
    }
    resp = client.post("/api/host/listings", json=new_listing_payload)
    assert resp.status_code == 201
    created_l = resp.json()
    assert created_l["title"] == new_listing_payload["title"]
    new_id = created_l["id"]
    print(f"[23] POST /api/host/listings -> 201 Created (ID={new_id})")

    # List host's listings
    resp = client.get(f"/api/host/{host_id}/listings")
    assert resp.status_code == 200
    host_listings = resp.json()
    assert any(l["id"] == new_id for l in host_listings)
    print(f"[24] GET /api/host/{host_id}/listings -> 200 OK (count={len(host_listings)})")

    # Host listing detail
    resp = client.get(f"/api/host/listings/{new_id}")
    assert resp.status_code == 200
    host_detail = resp.json()
    assert host_detail["id"] == new_id
    print(f"[25] GET /api/host/listings/{new_id} -> 200 OK")

    # Host update without ownership (wrong host ID)
    update_payload = {"title": "Unauthorized Update Title"}
    resp = client.put(f"/api/host/listings/{new_id}?host_id=9999", json=update_payload)
    assert resp.status_code == 403
    print(f"[26] PUT /api/host/listings/{new_id} (wrong host) -> 403 Forbidden verified")

    # Host update with valid ownership
    update_payload = {"title": "Updated Nordic Glass Haven in Lofoten"}
    resp = client.put(f"/api/host/listings/{new_id}?host_id={host_id}", json=update_payload)
    assert resp.status_code == 200
    updated_l = resp.json()
    assert updated_l["title"] == update_payload["title"]
    print(f"[27] PUT /api/host/listings/{new_id} (authorized host) -> 200 OK updated")

    # Delete listing without ownership
    resp = client.delete(f"/api/host/listings/{new_id}?host_id=9999")
    assert resp.status_code == 403
    print(f"[28] DELETE /api/host/listings/{new_id} (wrong host) -> 403 Forbidden verified")

    # Delete listing with valid ownership
    resp = client.delete(f"/api/host/listings/{new_id}?host_id={host_id}")
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    print(f"[29] DELETE /api/host/listings/{new_id} (authorized host) -> 200 OK deleted")

    # Host bookings
    resp = client.get(f"/api/host/{host_id}/bookings")
    assert resp.status_code == 200
    host_b_list = resp.json()
    assert isinstance(host_b_list, list)
    print(f"[30] GET /api/host/{host_id}/bookings -> 200 OK (count={len(host_b_list)})")

    print("=" * 65)
    print("ALL 30 API ENDPOINT & RULE TESTS PASSED SUCCESSFULLY!")
    print("=" * 65)


if __name__ == "__main__":
    run_tests()

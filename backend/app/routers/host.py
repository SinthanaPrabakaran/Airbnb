from __future__ import annotations
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.listing import Listing
from app.models.user import User
from app.routers.bookings import to_booking_detail_response
from app.schemas.booking import BookingDetailResponse
from app.schemas.listing import (
    ListingCreate,
    ListingDetailResponse,
    ListingSummaryResponse,
    ListingUpdate,
)
from app.services.booking_service import get_host_bookings
from app.services.listing_service import (
    create_listing,
    delete_listing,
    get_listing_detail,
    get_listings,
    update_listing,
)

router = APIRouter(prefix="/host", tags=["Host Management"])


def verify_host_ownership(
    db: Session,
    listing_id: int,
    host_id: Optional[int],
) -> Listing:
    """Helper to verify listing existence and validate that the requesting user owns the listing."""
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found",
        )

    if host_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Host ID is required to verify listing ownership. Provide ?host_id=<id> or header X-Host-Id.",
        )

    if listing.host_id != host_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You do not have permission to modify this listing.",
        )

    return listing


@router.post(
    "/listings",
    response_model=ListingDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new property listing",
    description="Publish a new listing under a specific host. Automatically associates photos and amenities.",
)
def host_create_listing(listing_in: ListingCreate, db: Session = Depends(get_db)):
    host = db.get(User, listing_in.host_id)
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host user with id {listing_in.host_id} not found",
        )

    # Ensure host role is active
    if host.role != "host":
        host.role = "host"
        db.commit()
        db.refresh(host)

    new_listing = create_listing(db, listing_in=listing_in)
    detail = get_listing_detail(db, listing_id=new_listing.id)
    return detail


@router.get(
    "/{host_id}/listings",
    response_model=List[ListingSummaryResponse],
    summary="Get all listings owned by a host",
    description="Retrieve all properties published by the given host ID.",
)
def get_host_listings(host_id: int, db: Session = Depends(get_db)):
    host = db.get(User, host_id)
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host user with id {host_id} not found",
        )

    items, _ = get_listings(db=db, host_id=host_id, limit=200)
    return items


@router.get(
    "/listings/{id}",
    response_model=ListingDetailResponse,
    summary="Get listing details for host management",
    description="Retrieve listing full details including images, amenities, and booked dates.",
)
def get_host_listing_detail(id: int, db: Session = Depends(get_db)):
    detail = get_listing_detail(db, listing_id=id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {id} not found",
        )
    return detail


@router.put(
    "/listings/{id}",
    response_model=ListingDetailResponse,
    summary="Update an existing listing",
    description="Modify listing details, photos, or amenities. Validates host ownership before allowing edits.",
)
def host_update_listing(
    id: int,
    listing_in: ListingUpdate,
    host_id: Optional[int] = Query(None, description="Host user ID for ownership validation"),
    x_host_id: Optional[int] = Header(None, description="Host user ID header for ownership validation"),
    db: Session = Depends(get_db),
):
    effective_host_id = host_id if host_id is not None else x_host_id
    verify_host_ownership(db, listing_id=id, host_id=effective_host_id)

    updated = update_listing(db, listing_id=id, listing_in=listing_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {id} not found",
        )

    return get_listing_detail(db, listing_id=id)


@router.delete(
    "/listings/{id}",
    summary="Delete a listing",
    description="Permanently delete a listing. Validates host ownership before allowing deletion.",
)
def host_delete_listing(
    id: int,
    host_id: Optional[int] = Query(None, description="Host user ID for ownership validation"),
    x_host_id: Optional[int] = Header(None, description="Host user ID header for ownership validation"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    effective_host_id = host_id if host_id is not None else x_host_id
    verify_host_ownership(db, listing_id=id, host_id=effective_host_id)

    deleted = delete_listing(db, listing_id=id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {id} not found",
        )

    return {"success": True, "message": f"Listing {id} deleted successfully"}


@router.get(
    "/{host_id}/bookings",
    response_model=List[BookingDetailResponse],
    summary="Get all reservations across host's listings",
    description="Retrieve all incoming and past guest bookings for all listings owned by this host.",
)
def list_host_bookings(host_id: int, db: Session = Depends(get_db)):
    host = db.get(User, host_id)
    if not host:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Host user with id {host_id} not found",
        )

    bookings = get_host_bookings(db, host_id=host_id)
    return [to_booking_detail_response(b) for b in bookings]

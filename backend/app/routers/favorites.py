from __future__ import annotations
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.favorite import FavoriteCreate, FavoriteResponse
from app.schemas.listing import ListingSummaryResponse
from app.services.favorite_service import (
    FavoriteError,
    add_favorite,
    get_user_favorites,
    remove_favorite,
)

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get(
    "/{user_id}",
    response_model=List[ListingSummaryResponse],
    summary="Get user's saved favorites",
    description="Retrieve all listings favorited by a user with summary images, pricing, and ratings.",
)
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    try:
        return get_user_favorites(db, user_id=user_id)
    except FavoriteError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.post(
    "",
    response_model=FavoriteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save listing to favorites",
    description="Add a listing to a user's wishlist.",
)
def create_favorite(fav_in: FavoriteCreate, db: Session = Depends(get_db)):
    try:
        return add_favorite(db, user_id=fav_in.user_id, listing_id=fav_in.listing_id)
    except FavoriteError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


@router.delete(
    "/{user_id}/{listing_id}",
    summary="Remove listing from favorites",
    description="Remove a listing from a user's wishlist.",
)
def delete_favorite(user_id: int, listing_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    deleted = remove_favorite(db, user_id=user_id, listing_id=listing_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found for this user and listing",
        )
    return {"success": True, "message": "Listing removed from favorites"}

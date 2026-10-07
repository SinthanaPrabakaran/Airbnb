from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.amenity import Amenity
from app.schemas.amenity import AmenityResponse

router = APIRouter(prefix="/amenities", tags=["Amenities"])


@router.get(
    "",
    response_model=List[AmenityResponse],
    summary="List all amenities",
    description="Retrieve all available amenities and their icon tags for filters and listing forms.",
)
def list_amenities(db: Session = Depends(get_db)):
    stmt = select(Amenity).order_by(Amenity.name.asc())
    amenities = list(db.scalars(stmt).all())
    return amenities

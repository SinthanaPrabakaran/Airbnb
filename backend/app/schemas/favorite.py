from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

from app.schemas.listing import ListingSummaryResponse


class FavoriteCreate(BaseModel):
    user_id: int
    listing_id: int


class FavoriteResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FavoriteDetailResponse(FavoriteResponse):
    listing: Optional[ListingSummaryResponse] = None

    model_config = ConfigDict(from_attributes=True)

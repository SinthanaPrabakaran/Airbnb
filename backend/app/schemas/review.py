from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserPublic


class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=3)


class ReviewCreate(ReviewBase):
    listing_id: int
    guest_id: int


class ReviewResponse(ReviewBase):
    id: int
    listing_id: int
    guest_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewDetailResponse(ReviewResponse):
    guest: Optional[UserPublic] = None

    model_config = ConfigDict(from_attributes=True)

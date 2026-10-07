from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field


class ListingImageBase(BaseModel):
    image_url: str = Field(..., min_length=1, max_length=500)
    display_order: int = Field(0, ge=0)


class ListingImageCreate(ListingImageBase):
    pass


class ListingImageResponse(ListingImageBase):
    id: int
    listing_id: int

    model_config = ConfigDict(from_attributes=True)

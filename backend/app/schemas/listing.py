from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

from app.schemas.amenity import AmenityResponse
from app.schemas.image import ListingImageResponse
from app.schemas.user import UserPublic


class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    property_type: str = Field(..., min_length=2, max_length=50)
    location: str = Field(..., min_length=2, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: float = Field(..., gt=0)
    cleaning_fee: float = Field(0.0, ge=0)
    service_fee: float = Field(0.0, ge=0)
    max_guests: int = Field(1, ge=1)
    bedrooms: int = Field(1, ge=0)
    beds: int = Field(1, ge=1)
    bathrooms: float = Field(1.0, ge=0.5)


class ListingCreate(ListingBase):
    host_id: int
    amenity_ids: List[int] = Field(default_factory=list)
    image_urls: List[str] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, min_length=10)
    property_type: Optional[str] = Field(None, min_length=2, max_length=50)
    location: Optional[str] = Field(None, min_length=2, max_length=255)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    country: Optional[str] = Field(None, min_length=2, max_length=100)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price_per_night: Optional[float] = Field(None, gt=0)
    cleaning_fee: Optional[float] = Field(None, ge=0)
    service_fee: Optional[float] = Field(None, ge=0)
    max_guests: Optional[int] = Field(None, ge=1)
    bedrooms: Optional[int] = Field(None, ge=0)
    beds: Optional[int] = Field(None, ge=1)
    bathrooms: Optional[float] = Field(None, ge=0.5)
    amenity_ids: Optional[List[int]] = None


class ListingResponse(ListingBase):
    id: int
    host_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ListingSummaryResponse(BaseModel):
    id: int
    host_id: int
    title: str
    property_type: str
    location: str
    city: str
    country: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    cover_image: Optional[str] = None
    average_rating: Optional[float] = None
    review_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ListingDetailResponse(ListingResponse):
    host: Optional[UserPublic] = None
    images: List[ListingImageResponse] = Field(default_factory=list)
    amenities: List[AmenityResponse] = Field(default_factory=list)
    average_rating: Optional[float] = None
    review_count: int = 0

    model_config = ConfigDict(from_attributes=True)

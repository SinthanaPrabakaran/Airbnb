from __future__ import annotations
from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class BookingBase(BaseModel):
    check_in: date
    check_out: date
    guests: int = Field(1, ge=1)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be strictly after check_in")
        return self


class BookingCreate(BookingBase):
    listing_id: int
    guest_id: int


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingResponse(BookingBase):
    id: int
    listing_id: int
    guest_id: int
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingDetailResponse(BookingResponse):
    listing_title: Optional[str] = None
    listing_city: Optional[str] = None
    listing_country: Optional[str] = None
    cover_image: Optional[str] = None
    guest_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

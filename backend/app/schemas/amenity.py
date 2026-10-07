from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AmenityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)


class AmenityCreate(AmenityBase):
    pass


class AmenityResponse(AmenityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

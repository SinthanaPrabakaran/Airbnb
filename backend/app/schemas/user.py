from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class UserRole(str, Enum):
    GUEST = "guest"
    HOST = "host"


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=EMAIL_PATTERN, max_length=255)
    avatar: Optional[str] = None
    role: UserRole = UserRole.GUEST


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, pattern=EMAIL_PATTERN, max_length=255)
    avatar: Optional[str] = None
    role: Optional[UserRole] = None


class UserPublic(BaseModel):
    id: int
    name: str
    avatar: Optional[str] = None
    role: str

    model_config = ConfigDict(from_attributes=True)


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

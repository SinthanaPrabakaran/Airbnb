from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.listing import Listing
    from app.models.booking import Booking
    from app.models.review import Review
    from app.models.favorite import Favorite


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="guest")  # "guest" or "host"
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    listings: Mapped[List[Listing]] = relationship(
        "Listing",
        back_populates="host",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    bookings: Mapped[List[Booking]] = relationship(
        "Booking",
        back_populates="guest",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    reviews: Mapped[List[Review]] = relationship(
        "Review",
        back_populates="guest",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    favorites: Mapped[List[Favorite]] = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role!r}>"

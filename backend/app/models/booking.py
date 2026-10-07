from __future__ import annotations
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.listing import Listing
    from app.models.user import User


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    guest_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    check_in: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    check_out: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    guests: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    nightly_total: Mapped[float] = mapped_column(Float, nullable=False)
    cleaning_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    service_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="confirmed", index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    listing: Mapped[Listing] = relationship("Listing", back_populates="bookings")
    guest: Mapped[User] = relationship("User", back_populates="bookings")

    __table_args__ = (
        Index("ix_bookings_listing_dates", "listing_id", "check_in", "check_out"),
        Index("ix_bookings_guest_status", "guest_id", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Booking id={self.id} listing_id={self.listing_id} guest_id={self.guest_id} "
            f"check_in={self.check_in} check_out={self.check_out} status={self.status!r}>"
        )

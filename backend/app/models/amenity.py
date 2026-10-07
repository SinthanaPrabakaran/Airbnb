from __future__ import annotations
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, ForeignKey, Index, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.listing import Listing

# Proper many-to-many association table with composite primary key and foreign keys
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column(
        "listing_id",
        Integer,
        ForeignKey("listings.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "amenity_id",
        Integer,
        ForeignKey("amenities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Index("ix_listing_amenities_listing_id", "listing_id"),
    Index("ix_listing_amenities_amenity_id", "amenity_id"),
)


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    icon: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    listings: Mapped[List[Listing]] = relationship(
        "Listing",
        secondary=listing_amenities,
        back_populates="amenities",
    )

    def __repr__(self) -> str:
        return f"<Amenity id={self.id} name={self.name!r}>"

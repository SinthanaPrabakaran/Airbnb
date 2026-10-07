from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.amenity import listing_amenities

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.amenity import Amenity
    from app.models.booking import Booking
    from app.models.review import Review
    from app.models.favorite import Favorite


class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    host_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    property_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    price_per_night: Mapped[float] = mapped_column(Float, nullable=False)
    cleaning_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    service_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    beds: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    bathrooms: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    host: Mapped[User] = relationship("User", back_populates="listings")
    images: Mapped[List[ListingImage]] = relationship(
        "ListingImage",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ListingImage.display_order",
    )
    amenities: Mapped[List[Amenity]] = relationship(
        "Amenity",
        secondary=listing_amenities,
        back_populates="listings",
    )
    bookings: Mapped[List[Booking]] = relationship(
        "Booking",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    reviews: Mapped[List[Review]] = relationship(
        "Review",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    favorites: Mapped[List[Favorite]] = relationship(
        "Favorite",
        back_populates="listing",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __table_args__ = (
        Index("ix_listings_city_country", "city", "country"),
        Index("ix_listings_price_per_night", "price_per_night"),
    )

    def __repr__(self) -> str:
        return f"<Listing id={self.id} title={self.title!r} host_id={self.host_id}>"


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(
        ForeignKey("listings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationship
    listing: Mapped[Listing] = relationship("Listing", back_populates="images")

    __table_args__ = (
        Index("ix_listing_images_listing_order", "listing_id", "display_order"),
    )

    def __repr__(self) -> str:
        return f"<ListingImage id={self.id} listing_id={self.listing_id} order={self.display_order}>"

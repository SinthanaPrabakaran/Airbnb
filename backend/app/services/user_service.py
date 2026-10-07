from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a single user by primary key ID."""
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a single user by email address."""
    return db.scalar(select(User).where(User.email == email))


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Retrieve all users with offset pagination."""
    return list(db.scalars(select(User).offset(skip).limit(limit)).all())


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user."""
    user = User(
        name=user_in.name,
        email=user_in.email,
        avatar=user_in.avatar,
        role=user_in.role.value if hasattr(user_in.role, "value") else str(user_in.role),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
    """Update user fields."""
    user = db.get(User, user_id)
    if not user:
        return None

    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "role" and hasattr(value, "value"):
            setattr(user, field, value.value)
        else:
            setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

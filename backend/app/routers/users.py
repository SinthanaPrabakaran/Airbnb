from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserResponse
from app.services.user_service import get_all_users, get_user_by_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users",
    description="Retrieve all registered users (convenient for testing and persona switching between guests and hosts).",
)
def list_users(db: Session = Depends(get_db)):
    return get_all_users(db)


@router.get(
    "/{id}",
    response_model=UserResponse,
    summary="Get user by ID",
    description="Retrieve public profile and account details for a specific user.",
)
def get_user(id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id=id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {id} not found",
        )
    return user

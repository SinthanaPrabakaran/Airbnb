from fastapi import APIRouter
from app.schemas.health import HealthResponse
from app.services.health_service import get_system_health

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify backend status."""
    return get_system_health()

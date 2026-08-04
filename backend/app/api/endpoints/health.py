from datetime import datetime, timezone
from fastapi import APIRouter
from ...schemas.schemas import HealthResponse
from ...core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

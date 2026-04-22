from fastapi import APIRouter
from app.api.v1.endpoints import ai, analytics

api_router = APIRouter()

api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

@api_router.get("/health")
async def health_check():
    return {"status": "ok"}

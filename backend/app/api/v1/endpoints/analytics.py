from fastapi import APIRouter
from app.services.scoring_engine import scoring_engine

router = APIRouter()

@router.get("/readiness")
async def get_readiness_score(framework_id: str = "GRI"):
    # Currently passing empty data_points for mock logic
    return scoring_engine.calculate_readiness_score(framework_id, [])

@router.get("/stats")
async def get_dashboard_stats():
    return {
        "organizations": 524,
        "reports_generated": 12840,
        "compliance_rate": 99.8,
        "ai_accuracy": 99.9
    }

from fastapi import APIRouter, Depends, HTTPException
from app.db.supabase import get_db
from supabase import Client
from app.models import analytics
from app.services.scoring_engine import scoring_engine
from datetime import datetime

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Client = Depends(get_db)):
    org_res = db.table("organizations").select("*").limit(1).execute()
    if not org_res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_data = org_res.data[0]
    org_id = org_data.get("id")

    latest_score_res = db.table("score_history").select("*").eq("organization_id", org_id).order("created_at", desc=True).limit(1).execute()
    
    radar_data = [85, 72, 90, 65, 80, 88] # fallback
    latest_score = None
    if latest_score_res.data:
        latest_score = latest_score_res.data[0]
        radar_data = [
            latest_score.get("env_score", 0),
            latest_score.get("soc_score", 0),
            latest_score.get("gov_score", 0),
            latest_score.get("supply_chain_score", 0),
            latest_score.get("carbon_score", 0),
            latest_score.get("diversity_score", 0)
        ]

    activities_res = db.table("activity_logs").select("*").order("created_at", desc=True).limit(5).execute()
    activities = activities_res.data

    insights_res = db.table("insights").select("*").order("created_at", desc=True).limit(5).execute()
    insights = insights_res.data

    action_plans_res = db.table("action_plans").select("*").eq("organization_id", org_id).order("created_at", desc=True).limit(3).execute()
    action_plans = action_plans_res.data

    benchmark = scoring_engine.INDUSTRY_BENCHMARKS.get(org_data.get("industry", ""), 65.0)

    return {
        "organization": {
            "name": org_data.get("name"),
            "industry": org_data.get("industry"),
            "overall_score": org_data.get("current_score"),
            "status": org_data.get("current_status"),
            "risk_level": org_data.get("risk_level")
        },
        "radar_data": radar_data,
        "forecast_score": latest_score.get("forecast_score", org_data.get("current_score")) if latest_score else org_data.get("current_score"),
        "industry_benchmark": benchmark,
        "activities": [
            {"user_name": a.get("user_name"), "action": a.get("action"), "time": "Just now"} for a in activities
        ],
        "insights": [
            {"type": i.get("type"), "title": i.get("title"), "description": i.get("description")} for i in insights
        ],
        "action_plans": [
            {
                "title": p.get("title"), 
                "description": p.get("description"), 
                "status": p.get("status"),
                "impact": p.get("impact"),
                "effort": p.get("effort")
            } for p in action_plans
        ]
    }

@router.get("/history")
async def get_score_history(db: Client = Depends(get_db)):
    org_res = db.table("organizations").select("*").limit(1).execute()
    if not org_res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_data = org_res.data[0]
    org_id = org_data.get("id")
        
    history_res = db.table("score_history").select("*").eq("organization_id", org_id).order("created_at").execute()
    history = history_res.data
    
    labels = [h.get("period_name") for h in history]
    scores = [h.get("overall_score") for h in history]
    env_scores = [h.get("env_score") for h in history]
    soc_scores = [h.get("soc_score") for h in history]
    gov_scores = [h.get("gov_score") for h in history]
    
    action_plans_res = db.table("action_plans").select("*").eq("organization_id", org_id).execute()
    action_plans = action_plans_res.data
    
    insights_res = db.table("insights").select("*").order("created_at", desc=True).limit(10).execute()
    insights = insights_res.data
    
    warning_insights = [i for i in insights if i.get("type") == "warning"]
    
    from app.services.scoring_engine import scoring_engine
    
    return {
        "labels": labels,
        "scores": scores,
        "env_scores": env_scores,
        "soc_scores": soc_scores,
        "gov_scores": gov_scores,
        "current_score": org_data.get("current_score"),
        "industry_benchmark": scoring_engine.INDUSTRY_BENCHMARKS.get(org_data.get("industry", ""), 65.0),
        "identified_risks": len(warning_insights),
        "action_plans": [
            {
                "title": p.get("title"),
                "description": p.get("description"),
                "impact": p.get("impact"),
                "effort": p.get("effort")
            } for p in action_plans
        ],
        "timeline": [
            {
                "type": i.get("type"),
                "title": i.get("title"),
                "description": i.get("description"),
                "date": i.get("created_at").strftime("%Y-%m-%d %H:%M") if hasattr(i.get("created_at"), "strftime") else str(i.get("created_at"))
            } for i in insights
        ]
    }

@router.post("/trigger-score")
async def trigger_manual_assessment(db: Client = Depends(get_db)):
    org_res = db.table("organizations").select("*").limit(1).execute()
    if not org_res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_data = org_res.data[0]
    org_id = org_data.get("id")
        
    metrics_res = db.table("quantitative_metrics").select("*").eq("organization_id", org_id).execute()
    
    class DummyMetric:
        def __init__(self, metric_dict):
            self.name = metric_dict.get("name")
            self.value = metric_dict.get("value")
            self.unit = metric_dict.get("unit")
            self.period = metric_dict.get("period")
            
    db_metrics = [DummyMetric(m) for m in metrics_res.data]
    
    new_data = await scoring_engine.calculate_dynamic_score(org_data.get("current_score", 0), db_metrics)
    
    db.table("organizations").update({
        "current_score": new_data["overall_score"],
        "current_status": new_data["status"],
        "risk_level": new_data["risk_level"]
    }).eq("id", org_id).execute()
    
    new_history = analytics.ScoreHistory(
        organization_id=org_id,
        period_name=f"Manual Run {datetime.now().strftime('%m/%d %H:%M')}",
        overall_score=new_data["overall_score"],
        env_score=new_data["breakdown"]["Environmental"],
        soc_score=new_data["breakdown"]["Social"],
        gov_score=new_data["breakdown"]["Governance"],
        supply_chain_score=new_data["breakdown"].get("Supply_Chain", 65),
        carbon_score=new_data["breakdown"].get("Carbon", 80),
        diversity_score=new_data["breakdown"].get("Diversity", 88),
        forecast_score=new_data["forecast_score"]
    ).model_dump(exclude_none=True)
    db.table("score_history").insert(new_history).execute()
    
    for plan in new_data.get("action_plans", []):
        db.table("action_plans").insert(analytics.ActionPlan(
            organization_id=org_id,
            title=plan["title"],
            description=plan["description"],
            impact=plan.get("impact", 5),
            effort=plan.get("effort", 5)
        ).model_dump(exclude_none=True)).execute()
        
    gw = new_data.get("greenwashing", {})
    if gw.get("detected"):
        db.table("insights").insert(analytics.Insight(
            type="greenwashing",
            title="AI Greenwashing Alert",
            description=gw.get("reason", "Inconsistencies detected in documents.")
        ).model_dump(exclude_none=True)).execute()
    
    db.table("activity_logs").insert(analytics.ActivityLog(
        user_name="Admin",
        action="Triggered Manual Assessment"
    ).model_dump(exclude_none=True)).execute()
    
    return {"status": "success", "new_score": new_data["overall_score"]}

from pydantic import BaseModel

class MetricCreate(BaseModel):
    name: str
    value: float
    unit: str
    period: str

@router.post("/metrics")
async def add_quantitative_metric(metric: MetricCreate, db: Client = Depends(get_db)):
    org_res = db.table("organizations").select("*").limit(1).execute()
    if not org_res.data:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_id = org_res.data[0].get("id")
        
    new_metric = analytics.QuantitativeMetric(
        organization_id=org_id,
        name=metric.name,
        value=metric.value,
        unit=metric.unit,
        period=metric.period
    ).model_dump(exclude_none=True)
    
    db.table("quantitative_metrics").insert(new_metric).execute()
    return {"status": "success", "message": "Metric added successfully"}

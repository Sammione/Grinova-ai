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
        # In the new schema, scores are objects, not floats. We need to handle this gracefully if it's the old schema in the DB
        env = latest_score.get("env_score")
        soc = latest_score.get("soc_score")
        gov = latest_score.get("gov_score")
        radar_data = [
            env.get("score", 0) if isinstance(env, dict) else (env or 0),
            soc.get("score", 0) if isinstance(soc, dict) else (soc or 0),
            gov.get("score", 0) if isinstance(gov, dict) else (gov or 0),
            latest_score.get("supply_chain_score", 65),
            latest_score.get("carbon_score", 80),
            latest_score.get("diversity_score", 88)
        ]

    activities_res = db.table("activity_logs").select("*").order("created_at", desc=True).limit(5).execute()
    activities = activities_res.data

    insights_res = db.table("insights").select("*").order("created_at", desc=True).limit(5).execute()
    insights = insights_res.data

    action_plans_res = db.table("action_plans").select("*").eq("organization_id", org_id).order("created_at", desc=True).limit(3).execute()
    action_plans = action_plans_res.data

    # Use the new async method for benchmarks
    benchmark_data = await scoring_engine.get_benchmarks(org_data.get("industry", ""))
    benchmark = benchmark_data.industry_average

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
            {"type": i.get("type"), "title": i.get("title"), "description": i.get("summary", i.get("description", ""))} for i in insights
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
    
    env_scores = []
    soc_scores = []
    gov_scores = []
    for h in history:
        e = h.get("env_score")
        s = h.get("soc_score")
        g = h.get("gov_score")
        env_scores.append(e.get("score", 0) if isinstance(e, dict) else (e or 0))
        soc_scores.append(s.get("score", 0) if isinstance(s, dict) else (s or 0))
        gov_scores.append(g.get("score", 0) if isinstance(g, dict) else (g or 0))
    
    action_plans_res = db.table("action_plans").select("*").eq("organization_id", org_id).execute()
    action_plans = action_plans_res.data
    
    insights_res = db.table("insights").select("*").order("created_at", desc=True).limit(10).execute()
    insights = insights_res.data
    
    warning_insights = [i for i in insights if i.get("severity") in ["High", "Critical"] or i.get("type") == "warning"]
    
    benchmark_data = await scoring_engine.get_benchmarks(org_data.get("industry", ""))
    
    return {
        "labels": labels,
        "scores": scores,
        "env_scores": env_scores,
        "soc_scores": soc_scores,
        "gov_scores": gov_scores,
        "current_score": org_data.get("current_score"),
        "industry_benchmark": benchmark_data.industry_average,
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
                "description": i.get("summary", i.get("description", "")),
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
        
    # Temporary fallback until trigger-score is fully rewritten to use the new 15-stage pipeline
    import random
    new_overall = min(100.0, max(0.0, org_data.get("current_score", 0) + random.uniform(-2, 5)))
    
    db.table("organizations").update({
        "current_score": new_overall,
        "current_status": "Optimized" if new_overall > 80 else "Needs Improvement",
        "risk_level": "Low" if new_overall > 80 else "Medium"
    }).eq("id", org_id).execute()
    
    db.table("activity_logs").insert(analytics.ActivityLog(
        user_name="Admin",
        action="Triggered Manual Assessment"
    ).model_dump(mode="json", exclude_none=True)).execute()
    
    return {"status": "success", "new_score": new_overall}

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
    ).model_dump(mode="json", exclude_none=True)
    
    db.table("quantitative_metrics").insert(new_metric).execute()
    return {"status": "success", "message": "Metric added successfully"}

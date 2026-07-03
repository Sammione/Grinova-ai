from fastapi import APIRouter, Depends, HTTPException
from app.db.firebase import get_db
from app.models import analytics
from app.services.scoring_engine import scoring_engine
from datetime import datetime
from google.cloud import firestore

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: firestore.Client = Depends(get_db)):
    org_docs = db.collection("organizations").limit(1).get()
    if not org_docs:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_doc = org_docs[0]
    org_data = org_doc.to_dict()
    org_id = org_doc.id

    latest_score_docs = db.collection("score_history").where("organization_id", "==", org_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(1).get()
    
    radar_data = [85, 72, 90, 65, 80, 88] # fallback
    latest_score = None
    if latest_score_docs:
        latest_score = latest_score_docs[0].to_dict()
        radar_data = [
            latest_score.get("env_score", 0),
            latest_score.get("soc_score", 0),
            latest_score.get("gov_score", 0),
            latest_score.get("supply_chain_score", 0),
            latest_score.get("carbon_score", 0),
            latest_score.get("diversity_score", 0)
        ]

    activities_docs = db.collection("activity_logs").order_by("created_at", direction=firestore.Query.DESCENDING).limit(5).get()
    activities = [doc.to_dict() for doc in activities_docs]

    insights_docs = db.collection("insights").order_by("created_at", direction=firestore.Query.DESCENDING).limit(5).get()
    insights = [doc.to_dict() for doc in insights_docs]

    action_plans_docs = db.collection("action_plans").where("organization_id", "==", org_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(3).get()
    action_plans = [doc.to_dict() for doc in action_plans_docs]

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
async def get_score_history(db: firestore.Client = Depends(get_db)):
    org_docs = db.collection("organizations").limit(1).get()
    if not org_docs:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_data = org_docs[0].to_dict()
    org_id = org_docs[0].id
        
    history_docs = db.collection("score_history").where("organization_id", "==", org_id).order_by("created_at", direction=firestore.Query.ASCENDING).get()
    history = [doc.to_dict() for doc in history_docs]
    
    labels = [h.get("period_name") for h in history]
    scores = [h.get("overall_score") for h in history]
    env_scores = [h.get("env_score") for h in history]
    soc_scores = [h.get("soc_score") for h in history]
    gov_scores = [h.get("gov_score") for h in history]
    
    action_plans_docs = db.collection("action_plans").where("organization_id", "==", org_id).get()
    action_plans = [doc.to_dict() for doc in action_plans_docs]
    
    insights_docs = db.collection("insights").order_by("created_at", direction=firestore.Query.DESCENDING).limit(10).get()
    insights = [doc.to_dict() for doc in insights_docs]
    
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
async def trigger_manual_assessment(db: firestore.Client = Depends(get_db)):
    org_docs = db.collection("organizations").limit(1).get()
    if not org_docs:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_ref = org_docs[0].reference
    org_data = org_docs[0].to_dict()
    org_id = org_docs[0].id
        
    metrics_docs = db.collection("quantitative_metrics").where("organization_id", "==", org_id).get()
    
    class DummyMetric:
        def __init__(self, metric_dict):
            self.name = metric_dict.get("name")
            self.value = metric_dict.get("value")
            self.unit = metric_dict.get("unit")
            self.period = metric_dict.get("period")
            
    db_metrics = [DummyMetric(m.to_dict()) for m in metrics_docs]
    
    new_data = await scoring_engine.calculate_dynamic_score(org_data.get("current_score", 0), db_metrics)
    
    org_ref.update({
        "current_score": new_data["overall_score"],
        "current_status": new_data["status"],
        "risk_level": new_data["risk_level"]
    })
    
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
    ).model_dump()
    db.collection("score_history").add(new_history)
    
    for plan in new_data.get("action_plans", []):
        db.collection("action_plans").add(analytics.ActionPlan(
            organization_id=org_id,
            title=plan["title"],
            description=plan["description"],
            impact=plan.get("impact", 5),
            effort=plan.get("effort", 5)
        ).model_dump())
        
    gw = new_data.get("greenwashing", {})
    if gw.get("detected"):
        db.collection("insights").add(analytics.Insight(
            type="greenwashing",
            title="AI Greenwashing Alert",
            description=gw.get("reason", "Inconsistencies detected in documents.")
        ).model_dump())
    
    db.collection("activity_logs").add(analytics.ActivityLog(
        user_name="Admin",
        action="Triggered Manual Assessment"
    ).model_dump())
    
    return {"status": "success", "new_score": new_data["overall_score"]}

from pydantic import BaseModel

class MetricCreate(BaseModel):
    name: str
    value: float
    unit: str
    period: str

@router.post("/metrics")
async def add_quantitative_metric(metric: MetricCreate, db: firestore.Client = Depends(get_db)):
    org_docs = db.collection("organizations").limit(1).get()
    if not org_docs:
        raise HTTPException(status_code=404, detail="Organization not found")
    org_id = org_docs[0].id
        
    new_metric = analytics.QuantitativeMetric(
        organization_id=org_id,
        name=metric.name,
        value=metric.value,
        unit=metric.unit,
        period=metric.period
    ).model_dump()
    
    db.collection("quantitative_metrics").add(new_metric)
    return {"status": "success", "message": "Metric added successfully"}

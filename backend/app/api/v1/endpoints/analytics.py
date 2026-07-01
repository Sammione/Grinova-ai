from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import analytics
from app.services.scoring_engine import scoring_engine
from datetime import datetime

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    org = db.query(analytics.Organization).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Get latest radar data based on latest score history
    latest_score = db.query(analytics.ScoreHistory).filter(
        analytics.ScoreHistory.organization_id == org.id
    ).order_by(analytics.ScoreHistory.id.desc()).first()

    radar_data = [85, 72, 90, 65, 80, 88] # fallback
    if latest_score:
        radar_data = [
            latest_score.env_score or 0,
            latest_score.soc_score or 0,
            latest_score.gov_score or 0,
            latest_score.supply_chain_score or 0,
            latest_score.carbon_score or 0,
            latest_score.diversity_score or 0
        ]

    activities = db.query(analytics.ActivityLog).order_by(analytics.ActivityLog.created_at.desc()).limit(5).all()
    insights = db.query(analytics.Insight).order_by(analytics.Insight.created_at.desc()).limit(5).all()
    action_plans = db.query(analytics.ActionPlan).filter(analytics.ActionPlan.organization_id == org.id).order_by(analytics.ActionPlan.created_at.desc()).limit(3).all()

    # Get industry benchmark
    benchmark = scoring_engine.INDUSTRY_BENCHMARKS.get(org.industry, 65.0)

    return {
        "organization": {
            "name": org.name,
            "industry": org.industry,
            "overall_score": org.current_score,
            "status": org.current_status,
            "risk_level": org.risk_level
        },
        "radar_data": radar_data,
        "forecast_score": latest_score.forecast_score if latest_score and latest_score.forecast_score else org.current_score,
        "industry_benchmark": benchmark,
        "activities": [
            {"user_name": a.user_name, "action": a.action, "time": "Just now"} for a in activities
        ],
        "insights": [
            {"type": i.type, "title": i.title, "description": i.description} for i in insights
        ],
        "action_plans": [
            {
                "title": p.title, 
                "description": p.description, 
                "status": p.status,
                "impact": p.impact,
                "effort": p.effort
            } for p in action_plans
        ]
    }

@router.get("/history")
async def get_score_history(db: Session = Depends(get_db)):
    org = db.query(analytics.Organization).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    history = db.query(analytics.ScoreHistory).filter(
        analytics.ScoreHistory.organization_id == org.id
    ).order_by(analytics.ScoreHistory.id.asc()).all()
    
    labels = [h.period_name for h in history]
    scores = [h.overall_score for h in history]
    env_scores = [h.env_score for h in history]
    soc_scores = [h.soc_score for h in history]
    gov_scores = [h.gov_score for h in history]
    
    # Also fetch current action plans
    action_plans = db.query(analytics.ActionPlan).filter(analytics.ActionPlan.organization_id == org.id).all()
    
    # Include recent timeline insights
    insights = db.query(analytics.Insight).order_by(analytics.Insight.created_at.desc()).limit(10).all()
    
    from app.services.scoring_engine import scoring_engine
    
    return {
        "labels": labels,
        "scores": scores,
        "env_scores": env_scores,
        "soc_scores": soc_scores,
        "gov_scores": gov_scores,
        "current_score": org.current_score,
        "industry_benchmark": scoring_engine.INDUSTRY_BENCHMARKS.get(org.industry, 65.0),
        "identified_risks": len(db.query(analytics.Insight).filter(analytics.Insight.type == "warning").all()),
        "action_plans": [
            {
                "title": p.title,
                "description": p.description,
                "impact": p.impact,
                "effort": p.effort
            } for p in action_plans
        ],
        "timeline": [
            {
                "type": i.type,
                "title": i.title,
                "description": i.description,
                "date": i.created_at.strftime("%Y-%m-%d %H:%M")
            } for i in insights
        ]
    }

@router.post("/trigger-score")
async def trigger_manual_assessment(db: Session = Depends(get_db)):
    org = db.query(analytics.Organization).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    # Get quantitative metrics
    db_metrics = db.query(analytics.QuantitativeMetric).filter(analytics.QuantitativeMetric.organization_id == org.id).all()
    
    # Generate new score
    new_data = await scoring_engine.calculate_dynamic_score(org.current_score, db_metrics)
    
    # Update org
    org.current_score = new_data["overall_score"]
    org.current_status = new_data["status"]
    org.risk_level = new_data["risk_level"]
    
    # Create new history entry
    new_history = analytics.ScoreHistory(
        organization_id=org.id,
        period_name=f"Manual Run {datetime.now().strftime('%m/%d %H:%M')}",
        overall_score=new_data["overall_score"],
        env_score=new_data["breakdown"]["Environmental"],
        soc_score=new_data["breakdown"]["Social"],
        gov_score=new_data["breakdown"]["Governance"],
        supply_chain_score=new_data["breakdown"].get("Supply_Chain", 65),
        carbon_score=new_data["breakdown"].get("Carbon", 80),
        diversity_score=new_data["breakdown"].get("Diversity", 88),
        forecast_score=new_data["forecast_score"]
    )
    
    # Save Action Plans
    for plan in new_data.get("action_plans", []):
        db.add(analytics.ActionPlan(
            organization_id=org.id,
            title=plan["title"],
            description=plan["description"],
            impact=plan.get("impact", 5),
            effort=plan.get("effort", 5)
        ))
        
    # Save Greenwashing Insight if detected
    gw = new_data.get("greenwashing", {})
    if gw.get("detected"):
        db.add(analytics.Insight(
            type="greenwashing",
            title="AI Greenwashing Alert",
            description=gw.get("reason", "Inconsistencies detected in documents.")
        ))
    
    # Add activity log
    new_activity = analytics.ActivityLog(
        user_name="Admin",
        action="Triggered Manual Assessment"
    )
    
    db.add(new_history)
    db.add(new_activity)
    db.commit()
    
    return {"status": "success", "new_score": org.current_score}

from pydantic import BaseModel

class MetricCreate(BaseModel):
    name: str
    value: float
    unit: str
    period: str

@router.post("/metrics")
async def add_quantitative_metric(metric: MetricCreate, db: Session = Depends(get_db)):
    org = db.query(analytics.Organization).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    new_metric = analytics.QuantitativeMetric(
        organization_id=org.id,
        name=metric.name,
        value=metric.value,
        unit=metric.unit,
        period=metric.period
    )
    db.add(new_metric)
    db.commit()
    return {"status": "success", "message": "Metric added successfully"}

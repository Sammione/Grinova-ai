from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ScoreHistory(BaseModel):
    id: Optional[str] = None
    organization_id: str
    period_name: Optional[str] = None
    overall_score: Optional[float] = None
    env_score: Optional[float] = None
    soc_score: Optional[float] = None
    gov_score: Optional[float] = None
    supply_chain_score: Optional[float] = None
    carbon_score: Optional[float] = None
    diversity_score: Optional[float] = None
    forecast_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Organization(BaseModel):
    id: Optional[str] = None
    name: str
    industry: Optional[str] = None
    current_score: float = 0.0
    current_status: str = "Needs Improvement"
    risk_level: str = "Medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    score_history: List[ScoreHistory] = []

class ActivityLog(BaseModel):
    id: Optional[str] = None
    user_name: Optional[str] = None
    action: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Insight(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ActionPlan(BaseModel):
    id: Optional[str] = None
    organization_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    status: str = "Pending"
    impact: int = 5
    effort: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuantitativeMetric(BaseModel):
    id: Optional[str] = None
    organization_id: str
    name: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    period: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

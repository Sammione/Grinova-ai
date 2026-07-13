from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

class ScoreDetail(BaseModel):
    score: float
    why: str
    evidence: str
    missing_information: List[str]
    recommendations: List[str]

class ScoreHistory(BaseModel):
    id: Optional[str] = None
    organization_id: str
    period_name: Optional[str] = None
    overall_score: Optional[float] = None
    
    # Detailed Scores
    env_score: Optional[ScoreDetail] = None
    soc_score: Optional[ScoreDetail] = None
    gov_score: Optional[ScoreDetail] = None
    climate_score: Optional[ScoreDetail] = None
    risk_score: Optional[ScoreDetail] = None
    reporting_quality: Optional[ScoreDetail] = None
    disclosure_completeness: Optional[ScoreDetail] = None
    transparency: Optional[ScoreDetail] = None
    overall_esg_readiness: Optional[ScoreDetail] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Organization(BaseModel):
    id: Optional[str] = None
    name: str
    industry: Optional[str] = None
    current_score: float = 0.0
    current_status: str = "Needs Improvement"
    risk_level: str = "Medium"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None
    score_history: List[ScoreHistory] = []

class ActivityLog(BaseModel):
    id: Optional[str] = None
    user_name: Optional[str] = None
    action: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EvidenceData(BaseModel):
    evidence: str
    page_number: str
    confidence: float
    source: str
    framework_reference: Optional[str] = None

class Insight(BaseModel):
    id: Optional[str] = None
    type: str # e.g., 'Greenwashing', 'Gap', 'Risk', 'Recommendation'
    title: str
    summary: str
    evidence_data: Optional[EvidenceData] = None
    framework: Optional[str] = None
    severity: Optional[str] = None # Critical, High, Medium, Low, Informational
    recommendation: Optional[str] = None
    business_impact: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Classification(BaseModel):
    category: str
    confidence: float

class FrameworkDetection(BaseModel):
    framework: str
    confidence: float

class ActionPlan(BaseModel):
    id: Optional[str] = None
    organization_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    status: str = "Pending"
    impact: int = 5
    effort: int = 5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuantitativeMetric(BaseModel):
    id: Optional[str] = None
    organization_id: str
    name: Optional[str] = None
    value: Optional[float] = None
    unit: Optional[str] = None
    period: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

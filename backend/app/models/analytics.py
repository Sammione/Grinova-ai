from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base
from sqlalchemy.orm import relationship

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(100))
    current_score = Column(Float, default=0.0)
    current_status = Column(String(50), default="Needs Improvement")
    risk_level = Column(String(50), default="Medium")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    score_history = relationship("ScoreHistory", back_populates="organization")

class ScoreHistory(Base):
    __tablename__ = "score_history"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    period_name = Column(String(50)) # e.g., 'Q1 2025'
    overall_score = Column(Float)
    env_score = Column(Float)
    soc_score = Column(Float)
    gov_score = Column(Float)
    supply_chain_score = Column(Float)
    carbon_score = Column(Float)
    diversity_score = Column(Float)
    forecast_score = Column(Float) # New predictive forecasting field
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    organization = relationship("Organization", back_populates="score_history")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(100))
    action = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50)) # warning, insight, framework, greenwashing
    title = Column(String(255))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ActionPlan(Base):
    __tablename__ = "action_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    title = Column(String(255))
    description = Column(Text)
    status = Column(String(50), default="Pending")
    impact = Column(Integer, default=5)
    effort = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class QuantitativeMetric(Base):
    __tablename__ = "quantitative_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    name = Column(String(255))
    value = Column(Float)
    unit = Column(String(50))
    period = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

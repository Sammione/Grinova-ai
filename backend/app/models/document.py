from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.session import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    file_path = Column(String(500))
    status = Column(String(50), default="pending")  # pending, processed, error
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Extraction(Base):
    __tablename__ = "extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    framework_id = Column(String(50))
    section_name = Column(String(255))
    content = Column(Text)
    confidence_score = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

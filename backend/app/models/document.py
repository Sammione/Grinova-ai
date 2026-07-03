from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Document(BaseModel):
    id: Optional[str] = None
    filename: str
    content_type: Optional[str] = None
    file_path: Optional[str] = None
    framework_id: Optional[str] = None
    status: str = "processed"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class Extraction(BaseModel):
    id: Optional[str] = None
    document_id: str
    framework_id: Optional[str] = None
    section_name: Optional[str] = None
    content: Optional[str] = None
    confidence_score: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

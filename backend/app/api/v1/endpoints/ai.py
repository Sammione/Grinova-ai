from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.ai_service import ai_service
from app.services.framework_engine import framework_engine
from app.services.document_service import document_service
import shutil
import os
from datetime import datetime
from app.db.session import SessionLocal, get_db
from app.models import analytics, document
from app.services.scoring_engine import scoring_engine

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    framework_id: str
    context: str = ""

class RewriteRequest(BaseModel):
    content: str
    instruction: str

class SectionRequest(BaseModel):
    section_name: str
    framework_id: str
    data: str

@router.post("/chat")
async def chat_with_framework(request: ChatRequest):
    try:
        response = await ai_service.framework_specific_qa(
            query=request.query,
            framework_id=request.framework_id,
            context=request.context
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rewrite")
async def rewrite_text(request: RewriteRequest):
    try:
        response = await ai_service.rewrite_content(
            content=request.content,
            rewrite_prompt=request.instruction
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-section")
async def generate_section(request: SectionRequest):
    try:
        response = await ai_service.generate_report_section(
            section_name=request.section_name,
            framework_id=request.framework_id,
            data=request.data
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks")
async def list_frameworks():
    return framework_engine.list_frameworks()

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    framework_id: str = Form("GRI"),
    db: Session = Depends(get_db)
):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        content = await document_service.process_document(file_path, file.filename, framework_id)
        
        # Add activity log
        org = db.query(analytics.Organization).first()
        if org:
            new_activity = analytics.ActivityLog(
                user_name="Admin",
                action=f"Uploaded document: {file.filename}"
            )
            db.add(new_activity)
            
            # Add Document record
            new_doc = document.Document(
                filename=file.filename,
                content_type=file.content_type or "application/pdf",
                file_path=file_path,
                framework_id=framework_id,
                status="processed"
            )
            db.add(new_doc)
            
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
                period_name=f"Ingestion {datetime.now().strftime('%m/%d %H:%M')}",
                overall_score=new_data["overall_score"],
                env_score=new_data["breakdown"]["Environmental"],
                soc_score=new_data["breakdown"]["Social"],
                gov_score=new_data["breakdown"]["Governance"],
                supply_chain_score=new_data["breakdown"].get("Supply_Chain", 65),
                carbon_score=new_data["breakdown"].get("Carbon", 80),
                diversity_score=new_data["breakdown"].get("Diversity", 88),
                forecast_score=new_data["forecast_score"]
            )
            db.add(new_history)
            
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
                    description=gw.get("reason", "Inconsistencies detected in uploaded documents.")
                ))
            
            db.commit()
        
        return {
            "filename": file.filename,
            "status": "success",
            "message": "Document processed and framework requirements generated successfully",
            "framework_id": framework_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(db: Session = Depends(get_db)):
    try:
        docs = db.query(document.Document).order_by(document.Document.created_at.desc()).all()
        return [
            {
                "id": d.id,
                "name": d.filename,
                "framework": d.framework_id,
                "created_at": d.created_at
            }
            for d in docs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: int, db: Session = Depends(get_db)):
    try:
        doc = db.query(document.Document).filter(document.Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Remove file from disk
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
            
        db.delete(doc)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

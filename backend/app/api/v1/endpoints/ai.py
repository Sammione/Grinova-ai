from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from app.services.ai_service import ai_service
from app.services.framework_engine import framework_engine
from app.services.document_service import document_service
import shutil
import os
from datetime import datetime
from app.db.firebase import get_db
from app.models import analytics, document
from app.services.scoring_engine import scoring_engine
from google.cloud import firestore

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
    db: firestore.Client = Depends(get_db)
):
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        content = await document_service.process_document(file_path, file.filename, framework_id)
        
        org_docs = db.collection("organizations").limit(1).get()
        if org_docs:
            org_doc = org_docs[0]
            org_data = org_doc.to_dict()
            org_id = org_doc.id
            org_ref = org_doc.reference
            
            new_activity = analytics.ActivityLog(
                user_name="Admin",
                action=f"Uploaded document: {file.filename}"
            ).model_dump()
            db.collection("activity_logs").add(new_activity)
            
            new_doc = document.Document(
                filename=file.filename,
                content_type=file.content_type or "application/pdf",
                file_path=file_path,
                framework_id=framework_id,
                status="processed"
            ).model_dump()
            db.collection("documents").add(new_doc)
            
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
                period_name=f"Ingestion {datetime.now().strftime('%m/%d %H:%M')}",
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
                    description=gw.get("reason", "Inconsistencies detected in uploaded documents.")
                ).model_dump())
        
        return {
            "filename": file.filename,
            "status": "success",
            "message": "Document processed and framework requirements generated successfully",
            "framework_id": framework_id
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(db: firestore.Client = Depends(get_db)):
    try:
        docs = db.collection("documents").order_by("created_at", direction=firestore.Query.DESCENDING).get()
        return [
            {
                "id": d.id,
                "name": d.to_dict().get("filename"),
                "framework": d.to_dict().get("framework_id"),
                "created_at": d.to_dict().get("created_at")
            }
            for d in docs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, db: firestore.Client = Depends(get_db)):
    try:
        doc_ref = db.collection("documents").document(doc_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = doc.to_dict()
        file_path = doc_data.get("file_path")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            
        doc_ref.delete()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

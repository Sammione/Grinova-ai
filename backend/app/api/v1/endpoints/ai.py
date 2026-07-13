from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from app.services.ai_service import ai_service
from app.services.framework_engine import framework_engine
from app.services.document_service import document_service
import shutil
import os
from datetime import datetime, timezone
from app.db.supabase import get_db
from app.models import analytics, document
from app.services.scoring_engine import scoring_engine
from supabase import Client

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

async def process_document_background(file_path: str, filename: str, framework_id: str, org_id: str):
    try:
        from app.services.ingestion_service import ingestion_service
        from app.db.supabase import supabase
        
        # Run the 15-stage pipeline
        pipeline_results = await ingestion_service.process_new_report(file_path, filename)
        
        org_res = supabase.table("organizations").select("*").eq("id", org_id).execute()
        if org_res.data:
            org_data = org_res.data[0]
            
            new_activity = analytics.ActivityLog(
                user_name="Admin",
                action=f"AI Analysis Complete: {filename} processed via 15-stage pipeline"
            ).model_dump(mode="json", exclude_none=True)
            supabase.table("activity_logs").insert(new_activity).execute()
            
            # Temporary fallback for scores until we rewrite the full scoring DB logic
            import random
            new_overall = min(100.0, max(0.0, org_data.get("current_score", 0) + random.uniform(-1, 3)))
            
            supabase.table("organizations").update({
                "current_score": new_overall,
                "current_status": "Optimized" if new_overall > 80 else "Needs Improvement",
                "risk_level": "Low" if new_overall > 80 else "Medium"
            }).eq("id", org_id).execute()
            
            # Insert the newly generated insights (greenwashing and gaps) into the DB
            for insight in pipeline_results.get("insights_generated", []):
                supabase.table("insights").insert(analytics.Insight(
                    type=insight.get("type", "Insight"),
                    title=insight.get("title", "AI Finding"),
                    summary=insight.get("summary", ""),
                    severity=insight.get("severity", "Medium"),
                    recommendation=insight.get("recommendation", "")
                ).model_dump(mode="json", exclude_none=True)).execute()
                
            supabase.table("documents").update({"status": "processed"}).eq("filename", filename).execute()
            
    except Exception as e:
        import traceback
        traceback.print_exc()

@router.post("/upload-document")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    framework_id: str = Form("GRI"),
    db: Client = Depends(get_db)
):
    try:
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        org_res = db.table("organizations").select("*").limit(1).execute()
        org_id = None
        if org_res.data:
            org_id = org_res.data[0].get("id")
            
            new_activity = analytics.ActivityLog(
                user_name="Admin",
                action=f"Uploaded document: {file.filename}. AI analysis started."
            ).model_dump(mode="json", exclude_none=True)
            db.table("activity_logs").insert(new_activity).execute()
            
            new_doc = document.Document(
                filename=file.filename,
                content_type=file.content_type or "application/pdf",
                file_path=file_path,
                framework_id=framework_id,
                status="processing"
            ).model_dump(mode="json", exclude_none=True)
            db.table("documents").insert(new_doc).execute()
        
        if org_id:
            background_tasks.add_task(process_document_background, file_path, file.filename, framework_id, org_id)
        
        return {
            "filename": file.filename,
            "status": "processing",
            "message": "Document uploaded successfully and is being processed by the AI in the background. Check the dashboard shortly.",
            "framework_id": framework_id
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def list_documents(db: Client = Depends(get_db)):
    try:
        docs_res = db.table("documents").select("*").order("created_at", desc=True).execute()
        return [
            {
                "id": d.get("id"),
                "name": d.get("filename"),
                "framework": d.get("framework_id"),
                "created_at": d.get("created_at")
            }
            for d in docs_res.data
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, db: Client = Depends(get_db)):
    try:
        doc_res = db.table("documents").select("*").eq("id", doc_id).execute()
        
        if not doc_res.data:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc_data = doc_res.data[0]
        file_path = doc_data.get("file_path")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            
        db.table("documents").delete().eq("id", doc_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

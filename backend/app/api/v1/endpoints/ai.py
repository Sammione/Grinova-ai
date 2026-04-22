from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from pydantic import BaseModel
from app.services.ai_service import ai_service
from app.services.framework_engine import framework_engine
from app.services.document_service import document_service
import shutil
import os

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
    framework_id: str = Form("GRI")
):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        file_path = os.path.join("uploads", file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        content = await document_service.process_document(file_path, file.filename, framework_id)
        
        return {
            "filename": file.filename,
            "status": "processed",
            "message": "Document indexed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

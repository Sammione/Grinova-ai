import os
from pypdf import PdfReader
from docx import Document as DocxDocument
from typing import List
from app.services.rag_service import rag_service

class DocumentService:
    @staticmethod
    async def process_document(file_path: str, filename: str, framework_id: str = "GRI"):
        extension = os.path.splitext(filename)[1].lower()
        content = ""

        if extension == ".pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                content += page.extract_text() + "\n"
        elif extension == ".docx":
            doc = DocxDocument(file_path)
            for para in doc.paragraphs:
                content += para.text + "\n"
        elif extension == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        else:
            raise ValueError(f"Unsupported file extension: {extension}")

        if content:
            # Index in RAG
            await rag_service.add_documents(
                texts=[content],
                metadatas=[{"filename": filename, "framework_id": framework_id}]
            )
            return content
        return None

document_service = DocumentService()

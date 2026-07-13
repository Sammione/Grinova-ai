import os
from typing import Dict, Any, List
from app.services.document_service import document_service
from app.services.chunking_service import chunking_service
from app.services.rag_service import rag_service
from app.services.classification_service import classification_service
from app.services.risk_engine import risk_engine
from app.services.scoring_engine import scoring_engine
from app.models.analytics import Insight

class IngestionService:
    @staticmethod
    async def process_new_report(file_path: str, filename: str) -> Dict[str, Any]:
        """
        Orchestrates the ingestion part of the 15-stage pipeline.
        """
        # Stage 1: Intelligent Document Processing
        elements = document_service.process_document(file_path, filename)
        if not elements:
            raise ValueError("No content extracted from document.")
            
        full_text = "\n".join([e.text for e in elements])
        
        # Stage 4: Semantic Chunking
        chunks = chunking_service.create_semantic_chunks(elements, source=filename)
        
        # Stage 5 prep: Add to RAG
        await rag_service.add_chunks(chunks)
        
        # Stage 3: Framework Detection
        frameworks = await classification_service.detect_frameworks(full_text)
        
        # Find sustainability claims for Stage 7 (Greenwashing Detection)
        # We can extract potential claims by looking for keywords, then pass to risk engine
        potential_claims = []
        for chunk in chunks:
            if "target" in chunk.text.lower() or "commit" in chunk.text.lower() or "achieve" in chunk.text.lower() or "net zero" in chunk.text.lower():
                potential_claims.append(chunk.text)
                
        # Limit to first 10 claims for performance
        greenwashing_risks = await risk_engine.detect_greenwashing(potential_claims[:10])
        
        # Stage 8: Gap Analysis
        gaps = await scoring_engine.run_gap_analysis()
        
        # Combine insights and categorize (Stage 13)
        all_insights = greenwashing_risks + gaps
        categorized_insights = await risk_engine.categorize_risks(all_insights)
        
        return {
            "status": "success",
            "frameworks_detected": [f.dict() for f in frameworks],
            "chunks_indexed": len(chunks),
            "insights_generated": [i.dict() for i in categorized_insights]
        }

ingestion_service = IngestionService()

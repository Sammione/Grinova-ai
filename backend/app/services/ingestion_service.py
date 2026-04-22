import pandas as pd
from pypdf import PdfReader
from typing import Dict, Any, List
import io

class IngestionService:
    @staticmethod
    async def parse_csv(content: bytes) -> List[Dict[str, Any]]:
        df = pd.read_csv(io.BytesIO(content))
        return df.to_dict(orient="records")

    @staticmethod
    async def parse_excel(content: bytes) -> List[Dict[str, Any]]:
        df = pd.read_excel(io.BytesIO(content))
        return df.to_dict(orient="records")

    @staticmethod
    async def parse_pdf(content: bytes) -> str:
        pdf = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text

    @staticmethod
    def extract_metrics(data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Logic to identify sustainability metrics (emissions, water, waste, etc.)
        # This can be enhanced with AI later
        metrics = []
        for row in data:
            for key, value in row.items():
                if any(kw in key.lower() for kw in ["emission", "carbon", "water", "waste", "electricity", "social", "gender", "safety"]):
                    metrics.append({"metric": key, "value": value})
        return metrics

ingestion_service = IngestionService()

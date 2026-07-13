import json
from typing import List, Dict, Any
from app.models.analytics import Classification, FrameworkDetection
from app.services.chunking_service import ChunkedDocument
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class ClassificationService:
    def __init__(self):
        # We use a fast, low-cost model for classification
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

    async def classify_chunk(self, chunk: ChunkedDocument) -> List[Classification]:
        """
        Stage 2: ESG Classification
        Automatically classify every section into specific ESG categories.
        """
        parser = JsonOutputParser(pydantic_object=Classification)
        prompt = PromptTemplate(
            template="""You are an expert ESG analyst. Classify the following text into one or more of these categories:
Environmental, Social, Governance, Climate, Human Rights, Risk, Finance, Supply Chain, Carbon, Biodiversity, Waste, Water, Energy, Health & Safety, DEI, Community, Ethics, Board Governance, Cybersecurity, Compliance.

Return a JSON array of objects with 'category' and 'confidence' (0.0 to 1.0).

Text: {text}
\n{format_instructions}\n""",
            input_variables=["text"],
            partial_variables={"format_instructions": "Return JSON array of: {\"category\": \"string\", \"confidence\": 0.95}"},
        )
        chain = prompt | self.llm | parser
        try:
            result = await chain.ainvoke({"text": chunk.text})
            # Ensure it's a list
            if isinstance(result, dict):
                result = [result]
            return [Classification(**r) for r in result]
        except Exception as e:
            print(f"Classification error: {e}")
            return []

    async def detect_frameworks(self, document_text: str) -> List[FrameworkDetection]:
        """
        Stage 3: Framework Detection
        Detects whether the report follows GRI, SASB, IFRS S1, IFRS S2, TCFD, CSRD, ESRS, UN SDGs, CDP, SEC Climate Rule, ISSB.
        Returns confidence scores.
        """
        parser = JsonOutputParser(pydantic_object=FrameworkDetection)
        prompt = PromptTemplate(
            template="""Analyze the following document excerpt and determine which sustainability reporting frameworks it aligns with or references.
Possible frameworks: GRI, SASB, IFRS S1, IFRS S2, TCFD, CSRD, ESRS, UN SDGs, CDP, SEC Climate Rule, ISSB.

Return a JSON array of objects with 'framework' and 'confidence' (0.0 to 1.0).

Text: {text}
\n{format_instructions}\n""",
            input_variables=["text"],
            partial_variables={"format_instructions": "Return JSON array of: {\"framework\": \"string\", \"confidence\": 0.95}"},
        )
        chain = prompt | self.llm | parser
        try:
            # We might pass the first 5000 chars of the document or an aggregate
            text_snippet = document_text[:8000]
            result = await chain.ainvoke({"text": text_snippet})
            if isinstance(result, dict):
                result = [result]
            return [FrameworkDetection(**r) for r in result]
        except Exception as e:
            print(f"Framework detection error: {e}")
            return []

classification_service = ClassificationService()

import openai
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.services.rag_service import rag_service
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class AIInsightOutput(BaseModel):
    title: str
    summary: str
    evidence: str = Field(description="Exact quote from the report. MUST be 'No supporting evidence found in the uploaded report.' if missing.")
    page_number: str
    confidence_score: float
    framework: str
    severity: str
    recommendation: str
    business_impact: str
    priority: str

class AIService:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)

    async def generate_recommendation(self, topic: str, current_state_context: str) -> AIInsightOutput:
        """
        Stage 9: Recommendations
        Recommendations must consider what already exists.
        """
        parser = JsonOutputParser(pydantic_object=AIInsightOutput)
        prompt = PromptTemplate(
            template="""You are a senior ESG advisor. Generate a recommendation for the topic: {topic}.
CRITICAL INSTRUCTION (Stage 9): You MUST consider what already exists in the report. 
Do not recommend creating something if it already exists. Instead, recommend expanding or improving it.

Context of what currently exists:
{context}

\n{format_instructions}\n""",
            input_variables=["topic", "context"],
            partial_variables={"format_instructions": "Return JSON matching the schema precisely. Ensure evidence is provided or explicitly state 'No supporting evidence found in the uploaded report.'"}
        )
        chain = prompt | self.llm | parser
        
        try:
            result = await chain.ainvoke({"topic": topic, "context": current_state_context})
            return AIInsightOutput(**result)
        except Exception as e:
            print(f"Recommendation generation error: {e}")
            raise

    async def answer_question(self, query: str) -> AIInsightOutput:
        """
        Stage 10 (Explainability) & Stage 14 (Hallucination Prevention) & Stage 15 (Output Format)
        """
        parser = JsonOutputParser(pydantic_object=AIInsightOutput)
        prompt = PromptTemplate(
            template="""You are an AI ESG Intelligence Platform.
User Query: {query}

CRITICAL RULES:
1. Stage 14 (Hallucination Prevention): Before generating any answer, verify if the statement is supported by the context. If NO, you MUST say "No supporting evidence found in the uploaded report."
2. Never invent metrics, benchmarks, or company information. 
3. If external data is used, label it clearly as "External Intelligence".

Context from uploaded report:
{context}

\n{format_instructions}\n""",
            input_variables=["query", "context"],
            partial_variables={"format_instructions": "Return JSON matching the strict schema. Include title, summary, evidence, page_number, confidence_score, framework, severity, recommendation, business_impact, priority."}
        )
        chain = prompt | self.llm | parser
        
        results = await rag_service.query(query, k=10)
        context = "\n\n".join([f"Page {r['metadata'].get('page_number', '?')}: {r['content']}" for r in results])
        
        try:
            result = await chain.ainvoke({"query": query, "context": context})
            return AIInsightOutput(**result)
        except Exception as e:
            print(f"QA error: {e}")
            return AIInsightOutput(
                title="Error Processing Query",
                summary="An error occurred while processing your request.",
                evidence="No supporting evidence found in the uploaded report.",
                page_number="N/A",
                confidence_score=0.0,
                framework="N/A",
                severity="Informational",
                recommendation="Please try again.",
                business_impact="None",
                priority="Low"
            )

ai_service = AIService()

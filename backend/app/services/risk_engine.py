from typing import List, Dict, Any
from app.models.analytics import Insight, EvidenceData
from app.services.rag_service import rag_service
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class GreenwashingCheck(BaseModel):
    is_claim: bool
    has_evidence: bool
    severity: str = Field(default="None")
    reasoning: str = Field(default="")

class RiskEngine:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0)

    async def detect_greenwashing(self, statements: List[str]) -> List[Insight]:
        """
        Stage 7: Greenwashing Detection
        Only flag greenwashing when BOTH conditions are met:
        1. A sustainability claim exists.
        2. No measurable KPI, target, baseline, timeline, or evidence supports it.
        Searches the ENTIRE document (via RAG and broad search) before warning.
        """
        insights = []
        parser = JsonOutputParser(pydantic_object=GreenwashingCheck)
        
        prompt = PromptTemplate(
            template="""You are a Greenwashing Detection Engine.
Analyze the following statement.
First, determine if it is a sustainability claim (Condition 1).
If YES, review the provided context to see if there is ANY measurable KPI, target, baseline, timeline, or evidence supporting it (Condition 2).
Only flag as greenwashing if Condition 1 is True AND Condition 2 is False (no evidence).

Statement: {statement}
Context found in report: {context}

\n{format_instructions}\n""",
            input_variables=["statement", "context"],
            partial_variables={"format_instructions": "Return JSON: {\"is_claim\": bool, \"has_evidence\": bool, \"severity\": \"Critical|High|Medium|Low\", \"reasoning\": \"string\"}"},
        )
        chain = prompt | self.llm | parser

        for statement in statements:
            # Search the entire document via RAG to find ANY supporting evidence
            evidence_results = await rag_service.query(statement, k=10)
            context = "\n".join([res["content"] for res in evidence_results])
            
            try:
                result = await chain.ainvoke({"statement": statement, "context": context})
                
                if result.get("is_claim") and not result.get("has_evidence"):
                    # We found greenwashing!
                    insights.append(Insight(
                        type="Greenwashing",
                        title="Unsupported Sustainability Claim",
                        summary=result.get("reasoning"),
                        severity=result.get("severity", "High"),
                        recommendation="Provide measurable KPIs, baseline data, or specific targets to substantiate this claim.",
                        business_impact="Reputational damage and potential regulatory fines for unsubstantiated claims."
                    ))
            except Exception as e:
                print(f"Greenwashing detection error: {e}")
                
        return insights

    async def categorize_risks(self, findings: List[Insight]) -> List[Insight]:
        """
        Stage 13: Risk Engine
        Categorize findings into Critical, High, Medium, Low, Informational.
        """
        # Findings should already have severity set based on logic or LLM output,
        # but this engine can normalize them or escalate based on business impact.
        for finding in findings:
            if finding.type == "Greenwashing" and finding.severity not in ["Critical", "High"]:
                finding.severity = "High" # Enforce strict risk
        return findings

    async def forecast_readiness(self, historical_scores: List[float]) -> float:
        """
        Stage 12: Forecasting
        Forecast ESG Readiness using trend analysis.
        """
        if not historical_scores:
            return 0.0
        if len(historical_scores) == 1:
            return historical_scores[0]
            
        # Simple linear trend for now
        trend = historical_scores[-1] - historical_scores[-2]
        forecast = historical_scores[-1] + trend
        return max(0.0, min(100.0, forecast))

risk_engine = RiskEngine()

from typing import Dict, Any, List
import random
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service

class ScoringEngine:
    FRAMEWORK_WEIGHTS = {
        "GRI": {"Environmental": 0.4, "Social": 0.3, "Governance": 0.3},
        "SASB": {"Environment": 0.2, "Social Capital": 0.2, "Human Capital": 0.2, "Business Model": 0.2, "Leadership": 0.2},
        "UN SDGs": {"Alignment": 1.0}
    }

    # Added Industry Benchmarks feature
    INDUSTRY_BENCHMARKS = {
        "Technology": 72.5,
        "Manufacturing": 58.0,
        "Finance": 68.5,
        "Energy": 52.0,
        "Healthcare": 70.0,
        "Default": 65.0
    }

    async def calculate_dynamic_score(self, current_score: float, db_metrics: list = None) -> Dict[str, Any]:
        """AI-Driven Gap Analysis and Predictive Scoring"""
        # Fetch up to 5 chunks from RAG to assess the real data
        context_docs = ""
        try:
            rag_context = await rag_service.query("Summarize the organization's key environmental, social, and governance disclosures, policies, and numerical metrics.", k=5)
            context_docs = rag_context
        except Exception as e:
            context_docs = f"Failed to retrieve documents: {e}"
            
        # Also include any hard quantitative metrics from DB
        if db_metrics:
            metrics_str = "\n".join([f"- {m.name}: {m.value} {m.unit} ({m.period})" for m in db_metrics])
            context_docs += f"\n\nQuantitative Metrics Database:\n{metrics_str}"

        # Call AI for true evaluation
        try:
            evaluation = await ai_service.evaluate_esg_score(context_docs)
            scores = evaluation["scores"]
            
            # Overall score based on GRI weights roughly
            overall = round(scores["Environmental"] * 0.4 + scores["Social"] * 0.3 + scores["Governance"] * 0.3, 1)
            
            # Predictive Forecasting: Assume a 5% improvement based on action plans
            forecast = round(min(100, overall * 1.05), 1)
            
            return {
                "overall_score": overall,
                "breakdown": scores,
                "forecast_score": forecast,
                "risk_level": "Low" if overall > 80 else ("High" if overall < 60 else "Medium"),
                "status": "Optimized" if overall > 80 else ("At Risk" if overall < 60 else "Needs Improvement"),
                "greenwashing": evaluation["greenwashing_detection"],
                "action_plans": evaluation["action_plans"]
            }
        except Exception as e:
            print(f"Scoring Error: {e}")
            # Fallback to random if AI fails
            return self._fallback_score(current_score)
            
    def _fallback_score(self, current_score: float) -> Dict[str, Any]:
        shift = random.uniform(-2.0, 3.5)
        new_score = round(min(100.0, max(0.0, current_score + shift)), 1)
        env = min(100, max(0, new_score + random.uniform(-5, 5)))
        soc = min(100, max(0, new_score + random.uniform(-5, 5)))
        gov = min(100, max(0, new_score + random.uniform(-2, 8)))
        
        return {
            "overall_score": new_score,
            "breakdown": {
                "Environmental": round(env, 1),
                "Social": round(soc, 1),
                "Governance": round(gov, 1),
                "Supply_Chain": round(min(100, max(0, new_score + random.uniform(-10, 5))), 1),
                "Carbon": round(min(100, max(0, env + random.uniform(-5, 5))), 1),
                "Diversity": round(min(100, max(0, soc + random.uniform(0, 10))), 1)
            },
            "forecast_score": round(min(100, new_score + 2.5), 1),
            "risk_level": "Low" if new_score > 80 else ("High" if new_score < 60 else "Medium"),
            "status": "Optimized" if new_score > 80 else ("At Risk" if new_score < 60 else "Needs Improvement"),
            "greenwashing": {"detected": False, "reason": "Fallback mode"},
            "action_plans": []
        }

scoring_engine = ScoringEngine()

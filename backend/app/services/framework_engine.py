from typing import List, Dict, Any

class FrameworkEngine:
    FRAMEWORKS = {
        "GRI": {
            "name": "Global Reporting Initiative",
            "description": "The GRI Standards are the world's most widely used standards for sustainability reporting.",
            "sections": ["General Disclosures", "Economic", "Environmental", "Social"],
            "scoring_logic": "weighted_average"
        },
        "SASB": {
            "name": "Sustainability Accounting Standards Board",
            "description": "Standardized for specific industries to identify financial material issues.",
            "sections": ["Environment", "Social Capital", "Human Capital", "Business Model & Innovation", "Leadership & Governance"],
            "scoring_logic": "materiality_index"
        },
        "UN SDGs": {
            "name": "UN Sustainable Development Goals",
            "description": "17 goals for a better and more sustainable future for all.",
            "sections": [f"Goal {i}" for i in range(1, 18)],
            "scoring_logic": "alignment_score"
        },
        "IFRS": {
            "name": "International Financial Reporting Standards",
            "description": "Sustainability-related financial disclosures (S1 and S2).",
            "sections": ["Governance", "Strategy", "Risk Management", "Metrics and Targets"],
            "scoring_logic": "financial_impact"
        }
    }

    @classmethod
    def get_framework_details(cls, framework_id: str) -> Dict[str, Any]:
        return cls.FRAMEWORKS.get(framework_id, {})

    @classmethod
    def list_frameworks(cls) -> List[Dict[str, str]]:
        return [{"id": k, "name": v["name"]} for k, v in cls.FRAMEWORKS.items()]

framework_engine = FrameworkEngine()

from app.db.session import engine, Base, SessionLocal
from app.models import document, analytics

def init_db():
    print("Dropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

    db = SessionLocal()
    try:
        # Check if we already have an organization to avoid duplicating seeds
        if not db.query(analytics.Organization).first():
            print("Seeding database with initial data...")
            org = analytics.Organization(
                name="Acme Corp", 
                industry="Manufacturing",
                current_score=84.2,
                current_status="OPTIMIZED",
                risk_level="LOW"
            )
            db.add(org)
            db.commit()
            db.refresh(org)

            # Seed Score History
            histories = [
                {"period_name": "Q1 2025", "overall_score": 65, "env_score": 60, "soc_score": 68, "gov_score": 67, "supply_chain_score": 60, "carbon_score": 62, "diversity_score": 70},
                {"period_name": "Q2 2025", "overall_score": 68, "env_score": 62, "soc_score": 70, "gov_score": 72, "supply_chain_score": 62, "carbon_score": 65, "diversity_score": 75},
                {"period_name": "Q3 2025", "overall_score": 74, "env_score": 70, "soc_score": 74, "gov_score": 78, "supply_chain_score": 68, "carbon_score": 72, "diversity_score": 80},
                {"period_name": "Q4 2025", "overall_score": 80, "env_score": 78, "soc_score": 78, "gov_score": 84, "supply_chain_score": 75, "carbon_score": 78, "diversity_score": 85},
                {"period_name": "Q1 2026", "overall_score": 82, "env_score": 82, "soc_score": 80, "gov_score": 88, "supply_chain_score": 78, "carbon_score": 82, "diversity_score": 88},
                {"period_name": "Q2 2026", "overall_score": 84.2, "env_score": 85, "soc_score": 72, "gov_score": 90, "supply_chain_score": 65, "carbon_score": 80, "diversity_score": 88},
            ]
            for h in histories:
                db.add(analytics.ScoreHistory(organization_id=org.id, **h))

            # Seed Activity Logs
            activities = [
                {"user_name": "Sarah K.", "action": "Uploaded Q3 Financials"},
                {"user_name": "System", "action": "Generated Social Disclosure"},
                {"user_name": "Marcus V.", "action": "Updated GRI Metadata"}
            ]
            for act in activities:
                db.add(analytics.ActivityLog(**act))

            # Seed Insights
            insights = [
                {"type": "warning", "title": "Data Gap Detected", "description": "Scope 3 emissions data for Q2 is currently missing from your CSV upload."},
                {"type": "insight", "title": "Performance Peak", "description": "Renewable energy usage in the Nordic region is at an all-time high of 94%."},
                {"type": "framework", "title": "SASB Alignment", "description": "Your current governance disclosures meet 100% of SASB requirements for Finance sector."}
            ]
            for ins in insights:
                db.add(analytics.Insight(**ins))

            db.commit()
            print("Seeding complete.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

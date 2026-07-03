import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings
import json
import os

# Initialize Firebase app
def init_firebase():
    if not firebase_admin._apps:
        if settings.FIREBASE_CREDENTIALS:
            try:
                # Assuming FIREBASE_CREDENTIALS is a JSON string or path to JSON file
                if settings.FIREBASE_CREDENTIALS.startswith("{"):
                    cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
                    cred = credentials.Certificate(cred_dict)
                elif os.path.exists(settings.FIREBASE_CREDENTIALS):
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
                else:
                    raise ValueError("FIREBASE_CREDENTIALS is not a valid JSON string or file path")
                firebase_admin.initialize_app(cred)
            except Exception as e:
                print(f"Failed to initialize Firebase Admin with credentials: {e}")
                # Fallback to default credentials
                firebase_admin.initialize_app()
        else:
            # Fallback to default application credentials (e.g. Render/GCP environment)
            firebase_admin.initialize_app()

init_firebase()

def get_db():
    return firestore.client()

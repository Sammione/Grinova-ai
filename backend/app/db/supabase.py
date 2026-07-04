import os
from supabase import create_client, Client
from app.core.config import settings

def init_supabase() -> Client:
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    if not url or not key:
        print("Warning: SUPABASE_URL or SUPABASE_KEY not set. Cannot initialize database.")
        return None
    try:
        supabase: Client = create_client(url, key)
        return supabase
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return None

# Singleton client instance
supabase_client = init_supabase()

def get_db() -> Client:
    if not supabase_client:
        # Try re-initializing if it failed initially but env vars are now present
        return init_supabase()
    return supabase_client

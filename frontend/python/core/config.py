import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = "synthetic_data_01"

# FastAPI settings
API_PREFIX = "/api"
PROJECT_NAME = "Energy Forecasting API"

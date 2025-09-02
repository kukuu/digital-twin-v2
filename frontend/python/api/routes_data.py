from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from typing import List
from supabase import create_client
from models.schemas import DataPoint 
import pandas as pd
from services.archive import save_weekwise_data
import os

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

@router.get("/data/latest", response_model=List[DataPoint])
async def get_latest_data(limit: int = Query(default=100)):
    """
    Fetches the latest data points from Supabase.
    """
    try:
        response = (
            supabase
            .from_("synthetic_data_01")
            .select("*")
            .order("Datetime", desc=True)
            .limit(limit)
            .execute()
            .data
        )
        return [DataPoint(**item) for item in response]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching latest data: {e}")


@router.get("/data/historical", response_model=List[DataPoint])
async def get_historical_data(
    start_timestamp: str = Query(None),
    end_timestamp: str = Query(None),
    limit: int = Query(default=100)
):
    """
    Fetches historical data points from Supabase, optionally within a time range.
    """
    try:
        query = (
            supabase
            .from_("synthetic_data_01")
            .select("*")
            .order("Datetime", desc=True)
            .limit(limit)
        )
        if start_timestamp:
            query = query.gte("Datetime", start_timestamp)
        if end_timestamp:
            query = query.lte("Datetime", end_timestamp)

        response = query.execute().data
        return [DataPoint(**item) for item in response]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {e}")

@router.post("/data/archive")
async def get_archive_data(data: List[dict]):
    if not data:
        raise HTTPException(status_code=400, detail="No data provided for archiving.")
    
    try:
        df = pd.DataFrame(data)
        saved_paths = save_weekwise_data(df)

        return JSONResponse(
            status_code=200,
            content={
                "message": "Data successfully archived week-wise from JSON.",
                "saved_files": saved_paths,
                # "total_files_saved": len(saved_paths)
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


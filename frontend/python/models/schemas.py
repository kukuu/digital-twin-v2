from pydantic import BaseModel

class DataPoint(BaseModel):
    Datetime: str  # You could use datetime instead of str if your datetime is ISO 8601
    MeterA_ID: str
    MeterA_reading: float
    MeterB_ID: str
    MeterB_reading: float
    MeterC_ID: str
    MeterC_reading: float

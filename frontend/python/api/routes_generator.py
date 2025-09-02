from fastapi import APIRouter
from services.generator import EnergyDataGenerator

router = APIRouter()
generator_instance = EnergyDataGenerator()

@router.get("/generate")
def get_next_generated_row():
    row = generator_instance.generate_next()
    return row

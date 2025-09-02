from fastapi import FastAPI
from api import routes_generator, routes_data, routes_inference
from core.config import API_PREFIX, PROJECT_NAME

app = FastAPI(title=PROJECT_NAME)

app.include_router(routes_generator.router, prefix=API_PREFIX)
app.include_router(routes_data.router, prefix=API_PREFIX)
app.include_router(routes_inference.router, prefix=API_PREFIX)

@app.get("/")
def root():
    return {"message": "Energy Data API running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

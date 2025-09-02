from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import torch
import torch.nn as nn
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
import json

# --- 0. Configuration & Device Setup ---
# Set device globally for the API
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Model Paths ---
MODEL_DIR = r"C:\Users\DIPRAJ\Python_projects\Digital_twin_meters\Python\app\trained_models"
MODEL_PATH = os.path.join(MODEL_DIR, "lstm_quantile_model.pth")
SCALER_PATH = os.path.join(MODEL_DIR, "minmax_scaler.joblib")
CONFIG_PATH = os.path.join(MODEL_DIR, "model_config.json")

# --- 1. Model and Loss Definition (must match training script) ---
# We need the class definition to load the state_dict
class LSTMQuantileModel(nn.Module):
    def __init__(self, input_size, hidden_size, output_size, num_layers=1):
        super(LSTMQuantileModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.relu = nn.ReLU()
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.relu(out[:, -1, :])
        out = self.fc(out)
        return out

# --- FastAPI App Setup ---
router = APIRouter()

# --- Global variables to store loaded model and scaler ---
loaded_model: LSTMQuantileModel = None
loaded_scaler: MinMaxScaler = None
model_config: dict = None

# --- API Request Body Model ---
class InferenceRequest(BaseModel):
    # Expects a list of floats representing the most recent 'look_back' values
    sequence: list[float]

# --- Startup Event: Load Model and Scaler ---
@router.on_event("startup")
async def load_model_and_scaler():
    global loaded_model, loaded_scaler, model_config
    
    try:
        # Load model configuration
        with open(CONFIG_PATH, 'r') as f:
            model_config = json.load(f)
            
        input_size = model_config["input_size"]
        hidden_size = model_config["hidden_size"]
        output_size = model_config["output_size"]
        num_layers = model_config["num_layers"]
        # look_back and quantiles are also in config, useful for validation/response
        
        # Instantiate the model architecture
        loaded_model = LSTMQuantileModel(input_size, hidden_size, output_size, num_layers).to(device)
        
        # Load the saved state_dict
        # Map location ensures it loads correctly regardless of original device
        loaded_model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        loaded_model.eval() # Set to evaluation mode
        print(f"Model loaded from {MODEL_PATH}")

        # Load the MinMaxScaler
        loaded_scaler = joblib.load(SCALER_PATH)
        print(f"Scaler loaded from {SCALER_PATH}")
        
    except FileNotFoundError as e:
        raise RuntimeError(f"Model or scaler file not found. Ensure '{MODEL_DIR}' exists and contains all required files. Error: {e}")
    except Exception as e:
        raise RuntimeError(f"Could not load model or scaler: {e}")

# --- API Endpoint for Inference ---
@router.post("/predict")
async def predict_next_step(request: InferenceRequest):
    if loaded_model is None or loaded_scaler is None or model_config is None:
        raise HTTPException(status_code=503, detail="Model or scaler not loaded. API is not ready.")

    look_back = model_config["look_back"]
    quantiles = model_config["quantiles"]

    if len(request.sequence) != look_back:
        raise HTTPException(
            status_code=400,
            detail=f"Input sequence must have exactly {look_back} elements. Received {len(request.sequence)}."
        )

    try:
        # Convert input list to NumPy array, then reshape for scaler
        input_np = np.array(request.sequence, dtype=np.float32).reshape(-1, 1)

        # Scale the input sequence using the LOADED scaler
        scaled_input = loaded_scaler.transform(input_np)

        # Reshape for LSTM: (1, look_back, 1) -> (batch_size, sequence_length, input_size)
        input_tensor = torch.tensor(scaled_input, dtype=torch.float32).unsqueeze(0).to(device)

        # Make prediction
        with torch.no_grad():
            predictions_scaled_tensor = loaded_model(input_tensor)
            predictions_scaled = predictions_scaled_tensor.cpu().numpy()[0] # Get the single prediction row

        # Inverse transform the predictions back to the original scale
        predictions_original_scale = np.zeros_like(predictions_scaled)
        for i in range(len(quantiles)):
            predictions_original_scale[i] = loaded_scaler.inverse_transform(predictions_scaled[i].reshape(-1, 1)).flatten()[0]

        # Prepare response
        response_data = {
            "predicted_quantiles": {
                f"q_{q:.3f}": float(predictions_original_scale[i]) for i, q in enumerate(quantiles)
            },
            "look_back_used": look_back,
            "quantiles_predicted": quantiles,
            "message": "Prediction successful."
        }
        
        return JSONResponse(content=response_data, status_code=200)

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during prediction: {e}")

# --- Health Check Endpoint (Optional) ---
@router.get("/health")
async def health_check():
    status = "ok"
    message = "API is running."
    if loaded_model is None or loaded_scaler is None:
        status = "degraded"
        message = "API is running, but model/scaler not loaded yet or failed to load."
    return {"status": status, "message": message}

# To run this API:
# 1. Save the model and scaler using the first script.
# 2. Install dependencies: pip install fastapi uvicorn torch scikit-learn numpy joblib
# 3. Run: uvicorn inference_api:app --reload --host 0.0.0.0 --port 8000
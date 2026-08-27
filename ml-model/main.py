"""
main.py — FastAPI microservice for crop disease classification inference.
Runs on Port 8001.
"""
from datetime import datetime, timezone
import logging
import time

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from pydantic import BaseModel

from model import predict_crop_disease

# Initialize logging for inference audit trail
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Dedicated inference log file handler
inference_logger = logging.getLogger("inference_audit")
file_handler = logging.FileHandler("inference.log")
formatter = logging.Formatter("[%(asctime)s] %(message)s")
file_handler.setFormatter(formatter)
inference_logger.addHandler(file_handler)
inference_logger.setLevel(logging.INFO)

app = FastAPI(
    title="Crop Disease Classification ML Service",
    description="Microservice running PyTorch/MobileNet models for PlantVillage & IP102 classifications.",
    version="1.0.0",
)


class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    action_category: str
    model_version: str


@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    """
    Upload a leaf scan image file to run classification inference.
    Logs execution times and predictions to inference.log.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in image upload."
        )

    # Validate image file extensions
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in ["jpg", "jpeg", "png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Image must be JPEG or PNG."
        )

    try:
        content = await file.read()
        
        # Measure prediction latency
        start_time = time.perf_counter()
        disease, confidence, action = predict_crop_disease(content)
        latency_ms = (time.perf_counter() - start_time) * 1000

        # Log prediction to audit file
        log_message = (
            f"File: {file.filename} | "
            f"Prediction: {disease} | "
            f"Confidence: {confidence:.2f} | "
            f"Latency: {latency_ms:.1f}ms"
        )
        inference_logger.info(log_message)
        logger.info(f"Prediction successful: {log_message}")

        return PredictionResponse(
            disease=disease,
            confidence=confidence,
            action_category=action,
            model_version="v1.0.0-mobilenetv3"
        )

    except Exception as ex:
        logger.error(f"Inference pipeline execution error: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run model inference."
        )


@app.get("/health", tags=["system"])
async def health_check():
    """Liveness check for the ML service."""
    return {"status": "healthy", "model_version": "v1.0.0-mobilenetv3"}

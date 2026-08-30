from pathlib import Path

import joblib

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


# --------------------------------------------------
# App
# --------------------------------------------------

app = FastAPI(
    title="SpendSense ML Service",
    description="Machine learning service for expense categorization",
    version="1.0.0"
)


# --------------------------------------------------
# Load model
# --------------------------------------------------

MODEL_PATH = Path(__file__).parent / "model" / "expense_classifier.joblib"

if not MODEL_PATH.exists():
    raise RuntimeError(
        "ML model not found. Run `python train.py` first."
    )

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Request schema
# --------------------------------------------------

class PredictionRequest(BaseModel):
    description: str


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "success": True,
        "service": "SpendSense ML Service",
        "model": "TF-IDF + Logistic Regression"
    }


# --------------------------------------------------
# Prediction
# --------------------------------------------------

@app.post("/predict")
def predict(request: PredictionRequest):

    description = request.description.strip()

    if not description:
        raise HTTPException(
            status_code=400,
            detail="Description is required"
        )

    if len(description) > 200:
        raise HTTPException(
            status_code=400,
            detail="Description cannot exceed 200 characters"
        )

    probabilities = model.predict_proba([description])[0]
    classes = model.classes_

    best_index = probabilities.argmax()

    category = classes[best_index]
    confidence = float(probabilities[best_index])

    # Top 3 predictions
    ranked = probabilities.argsort()[::-1][:3]

    alternatives = [
        {
            "category": classes[index],
            "confidence": round(float(probabilities[index]) * 100, 2)
        }
        for index in ranked
    ]

    return {
        "success": True,
        "prediction": {
            "category": category,
            "confidence": round(confidence * 100, 2),
            "alternatives": alternatives
        }
    }
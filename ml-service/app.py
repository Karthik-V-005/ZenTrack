from __future__ import annotations

import math
import os
import warnings
from dataclasses import dataclass
from typing import Annotated, Literal

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

FEATURE_COUNT = 14


SeverityLabel = Literal["Healthy", "Mild", "High", "Severe"]


class PredictRequest(BaseModel):
    features: Annotated[
        list[float],
        Field(
            ..., min_length=FEATURE_COUNT, max_length=FEATURE_COUNT,
            description=f"Aggregated feature vector of length {FEATURE_COUNT}."
        ),
    ]


class PredictResponse(BaseModel):
    fatigue_score: float = Field(..., ge=0, le=100)
    severity: SeverityLabel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    model_loaded: bool
    scaler_loaded: bool


@dataclass(frozen=True)
class Settings:
    model_path: str
    scaler_path: str
    fatigue_score_alpha: float

    @staticmethod
    def from_env() -> "Settings":
        return Settings(
            model_path=os.getenv("MODEL_PATH", os.path.join("models", "fatigue_model.pkl")),
            scaler_path=os.getenv("SCALER_PATH", os.path.join("models", "scaler.pkl")),
            fatigue_score_alpha=float(os.getenv("FATIGUE_SCORE_ALPHA", "5.0")),
        )


settings = Settings.from_env()

app = FastAPI(title="ZenTrack ML Service", version="1.0.0")

_model = None
_scaler = None


def _sigmoid(x: float) -> float:
    if x >= 0:
        z = math.exp(-x)
        return 1.0 / (1.0 + z)
    z = math.exp(x)
    return z / (1.0 + z)


def _decision_to_fatigue_score(decision_value: float, *, alpha: float) -> float:
    """Convert IsolationForest decision_function value into 0-100 fatigue score.

    In sklearn, `decision_function` is typically > 0 for inliers and < 0 for outliers.
    We convert higher anomaly likelihood into higher fatigue.

    Uses a smooth mapping so scores are stable for window-based inference without
    requiring dataset-specific min/max calibration.
    """

    fatigue_0_to_1 = _sigmoid((-decision_value) * alpha)
    return float(fatigue_0_to_1 * 100.0)


def _severity_from_score(score_0_to_100: float) -> SeverityLabel:
    if score_0_to_100 < 25:
        return "Healthy"
    if score_0_to_100 < 50:
        return "Mild"
    if score_0_to_100 < 75:
        return "High"
    return "Severe"


@app.on_event("startup")
def _load_artifacts() -> None:
    global _model, _scaler
    _model = joblib.load(settings.model_path)
    _scaler = joblib.load(settings.scaler_path)


@app.post("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_loaded=_model is not None,
        scaler_loaded=_scaler is not None,
    )


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    if _model is None or _scaler is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded")

    try:
        features = np.asarray(payload.features, dtype=float).reshape(1, -1)
        with warnings.catch_warnings():
            warnings.filterwarnings(
                "ignore",
                message=r"X does not have valid feature names, but .* was fitted with feature names",
                category=UserWarning,
            )
            scaled = _scaler.transform(features)

        # IsolationForest supports decision_function; higher means more normal.
        with warnings.catch_warnings():
            warnings.filterwarnings(
                "ignore",
                message=r"X does not have valid feature names, but .* was fitted with feature names",
                category=UserWarning,
            )
            decision_value = float(_model.decision_function(scaled)[0])

        fatigue_score = _decision_to_fatigue_score(
            decision_value, alpha=settings.fatigue_score_alpha
        )
        severity = _severity_from_score(fatigue_score)

        return PredictResponse(
            fatigue_score=round(fatigue_score, 2),
            severity=severity,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Invalid input: {exc}")

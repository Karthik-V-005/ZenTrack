# ZenTrack ML Service (Digital Fatigue Scoring)

FastAPI microservice that loads a pre-trained **Isolation Forest** model and a **StandardScaler** at startup and exposes window-based fatigue scoring.

## Folder structure

```
ml-service/
  app.py
  requirements.txt
  models/
    fatigue_model.pkl
    scaler.pkl
```

## Run locally (Windows PowerShell)

From `d:\ZenTrack\ml-service`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8001
```

If you see warnings about an inconsistent scikit-learn version when loading the `.pkl` files, ensure you’re using the same scikit-learn version the artifacts were created with (this repo pins `scikit-learn==1.6.1`).

## API

### POST /predict

**Input**

```json
{
  "features": [120, 55, 18.2, 34, 80, 1.45, 9, 22, 0.12, 0.05, 20, 0.14, 6, 4.5]
}
```

**Output**

```json
{
  "fatigue_score": 63.4,
  "severity": "High"
}
```

Notes:

- This endpoint expects a **single aggregated feature vector per window** (not per event).
- The service scales inputs using `models/scaler.pkl`, then runs the Isolation Forest from `models/fatigue_model.pkl`.

### POST /health

Returns basic readiness info.

## Integration tips

- Your MERN backend should call `POST /predict` whenever it has computed a full window of aggregated features.
- Default fatigue-score mapping is a smooth transform of the Isolation Forest `decision_function` value. You can tune sensitivity via `FATIGUE_SCORE_ALPHA`.

## Configuration (optional)

Environment variables:

- `MODEL_PATH` (default: `models/fatigue_model.pkl`)
- `SCALER_PATH` (default: `models/scaler.pkl`)
- `FATIGUE_SCORE_ALPHA` (default: `5.0`) — higher makes the score more sensitive around the anomaly boundary.

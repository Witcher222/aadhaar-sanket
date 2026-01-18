"""
Aadhaar Sanket API - Alerts Routes
Prediction and alert endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.prediction import get_predictive_alerts, predict_mvi

router = APIRouter()


@router.get("/predictions")
async def get_predictions(days_ahead: int = 30):
    """
    Get predictive alerts for all districts.
    Forecasts future stress zones based on current trends.
    """
    try:
        predictions = get_predictive_alerts(days_ahead)
        return {
            "status": "success",
            **predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current")
async def get_current_alerts():
    """Get current active alerts from anomaly detection."""
    try:
        from engines.ingestion import load_processed_dataset
        
        anomaly_df = load_processed_dataset('anomaly_analytics')
        
        if anomaly_df is None or len(anomaly_df) == 0:
            return {
                "status": "success",
                "alerts": [],
                "count": 0
            }
        
        # Filter for critical/high alerts
        alerts = anomaly_df.to_dicts()
        
        return {
            "status": "success",
            "alerts": alerts[:50],  # Top 50
            "count": len(alerts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

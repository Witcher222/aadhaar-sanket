"""
Prediction Engine

Forecasts future MVI values and predicts stress zone transitions.
Uses simple linear regression on historical data.
"""
import polars as pl
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, MVI_THRESHOLDS


def load_mvi_data() -> Optional[pl.DataFrame]:
    """Load MVI analytics data."""
    mvi_path = PATHS["processed_dir"] / "mvi_analytics.parquet"
    if not mvi_path.exists():
        return None
    return pl.read_parquet(mvi_path)


def simple_linear_regression(x: np.ndarray, y: np.ndarray) -> tuple:
    """Calculate simple linear regression coefficients."""
    n = len(x)
    if n < 2:
        return 0, y.mean() if len(y) > 0 else 0
    
    x_mean = x.mean()
    y_mean = y.mean()
    
    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)
    
    if denominator == 0:
        return 0, y_mean
    
    slope = numerator / denominator
    intercept = y_mean - slope * x_mean
    
    return slope, intercept


def predict_mvi(district_data: pl.DataFrame, days_ahead: int = 30) -> Dict:
    """
    Predict future MVI for a district using linear regression.
    
    Args:
        district_data: DataFrame with date and mvi columns
        days_ahead: Number of days to forecast
        
    Returns:
        Prediction results with confidence
    """
    if "date" not in district_data.columns or "mvi" not in district_data.columns:
        return {"error": "Missing required columns"}
    
    if district_data.height < 3:
        return {"error": "Insufficient data points for prediction"}
    
    # Convert to numpy for regression
    df = district_data.sort("date")
    dates = df["date"].to_numpy()
    mvi_values = df["mvi"].to_numpy()
    
    # Convert dates to numeric (days from first date)
    base_date = dates[0]
    x = np.array([(d - base_date).days for d in dates], dtype=float)
    y = mvi_values.astype(float)
    
    # Perform regression
    slope, intercept = simple_linear_regression(x, y)
    
    # Predict future
    last_day = x[-1]
    future_days = [last_day + i for i in range(1, days_ahead + 1)]
    predictions = [slope * day + intercept for day in future_days]
    
    # Calculate confidence (R-squared)
    y_pred = slope * x + intercept
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - y.mean()) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
    
    current_mvi = float(mvi_values[-1])
    predicted_mvi = float(predictions[-1])
    
    # Determine zone transitions
    current_zone = get_zone_type(current_mvi)
    predicted_zone = get_zone_type(predicted_mvi)
    
    # Calculate days to threshold
    days_to_threshold = None
    if slope > 0:  # Increasing trend
        for threshold_name, threshold_value in [
            ("elevated", MVI_THRESHOLDS["elevated"]),
            ("moderate", MVI_THRESHOLDS["moderate"])
        ]:
            if current_mvi < threshold_value:
                days = (threshold_value - intercept) / slope - last_day
                if days > 0:
                    days_to_threshold = {
                        "threshold": threshold_name,
                        "value": threshold_value,
                        "days": int(days)
                    }
                    break
    
    return {
        "current_mvi": round(current_mvi, 2),
        "predicted_mvi": round(predicted_mvi, 2),
        "change": round(predicted_mvi - current_mvi, 2),
        "change_pct": round((predicted_mvi - current_mvi) / current_mvi * 100, 2) if current_mvi > 0 else 0,
        "trend": "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable",
        "slope": round(slope, 4),
        "confidence": round(max(0, min(1, r_squared)), 2),
        "current_zone": current_zone,
        "predicted_zone": predicted_zone,
        "zone_change": current_zone != predicted_zone,
        "days_to_threshold": days_to_threshold,
        "forecast_days": days_ahead
    }


def get_zone_type(mvi: float) -> str:
    """Get zone classification from MVI value."""
    if mvi < MVI_THRESHOLDS["stable"]:
        return "stable"
    elif mvi < MVI_THRESHOLDS["moderate"]:
        return "moderate"
    elif mvi < MVI_THRESHOLDS["elevated"]:
        return "elevated"
    else:
        return "high_inflow"


def get_predictive_alerts(days_ahead: int = 30) -> Dict:
    """
    Generate predictive alerts for all districts.
    
    Returns:
        List of districts at risk of zone transitions
    """
    df = load_mvi_data()
    if df is None:
        return {"error": "No MVI data available", "alerts": []}
    
    if "date" not in df.columns:
        # If no date column, return current high-risk districts
        return _get_current_risk_districts(df)
    
    if "district" not in df.columns:
        return {"error": "No district column", "alerts": []}
    
    alerts = []
    districts = df["district"].unique().to_list()
    
    for district in districts:
        district_df = df.filter(pl.col("district") == district)
        prediction = predict_mvi(district_df, days_ahead)
        
        if "error" in prediction:
            continue
        
        # Flag if zone change predicted or approaching threshold
        if prediction.get("zone_change") or prediction.get("days_to_threshold"):
            alerts.append({
                "district": district,
                **prediction
            })
    
    # Sort by urgency (days to threshold, then by change)
    alerts.sort(key=lambda x: (
        x.get("days_to_threshold", {}).get("days", 9999) if x.get("days_to_threshold") else 9999,
        -abs(x.get("change", 0))
    ))
    
    return {
        "forecast_days": days_ahead,
        "total_districts": len(districts),
        "at_risk_count": len(alerts),
        "alerts": alerts[:20]  # Top 20 most urgent
    }


def _get_current_risk_districts(df: pl.DataFrame) -> Dict:
    """Fallback: Return districts at highest MVI (current risk)."""
    if "mvi" not in df.columns or "district" not in df.columns:
        return {"error": "Invalid data structure", "alerts": []}
    
    high_risk = df.filter(
        pl.col("mvi") >= MVI_THRESHOLDS["elevated"]
    ).sort("mvi", descending=True)
    
    return {
        "forecast_days": 0,
        "message": "Prediction requires date-stamped data. Showing current high-risk districts.",
        "at_risk_count": high_risk.height,
        "alerts": high_risk.head(20).to_dicts()
    }

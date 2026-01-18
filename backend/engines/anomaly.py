"""
Aadhaar Sanket - Anomaly Detection Engine
Detects statistical anomalies using rolling z-scores.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, ANOMALY_CONFIG, ANOMALY_TYPES
from .ingestion import load_processed_dataset


@dataclass
class Alert:
    """Represents a detected anomaly alert."""
    type: str                # SPIKE/DROP/STRUCTURAL/TRANSIENT
    severity: str            # CRITICAL/HIGH/MEDIUM/LOW
    affected_regions: List[str]
    metrics: Dict
    message: str
    recommendation: str
    
    def to_dict(self) -> Dict:
        return asdict(self)


def classify_severity(z_score: float) -> str:
    """
    Classify anomaly severity based on z-score.
    """
    abs_z = abs(z_score)
    if abs_z >= ANOMALY_CONFIG["z_threshold_critical"]:
        return "CRITICAL"
    elif abs_z >= ANOMALY_CONFIG["z_threshold_high"]:
        return "HIGH"
    elif abs_z >= ANOMALY_CONFIG["z_threshold_medium"]:
        return "MEDIUM"
    elif abs_z >= ANOMALY_CONFIG["z_threshold_low"]:
        return "LOW"
    return "NORMAL"


def classify_anomaly_type(z_score: float, consecutive_anomalies: int = 1) -> str:
    """
    Classify anomaly type based on z-score direction and duration.
    
    - SPIKE: z > 3 (sudden increase)
    - DROP: z < -3 (sudden decrease)
    - STRUCTURAL: sustained deviation > 3 days
    - TRANSIENT: isolated single-day event
    """
    if consecutive_anomalies > 3:
        return "STRUCTURAL"
    elif z_score > ANOMALY_CONFIG["z_threshold_high"]:
        return "SPIKE"
    elif z_score < -ANOMALY_CONFIG["z_threshold_high"]:
        return "DROP"
    else:
        return "TRANSIENT"


def detect_anomalies(
    mvi_timeseries: Optional[pl.DataFrame] = None,
    window: int = None
) -> pl.DataFrame:
    """
    Calculate rolling z-scores across time series.
    Flag anomalies where |z| > threshold.
    """
    if window is None:
        window = ANOMALY_CONFIG["rolling_window"]
    
    if mvi_timeseries is None:
        mvi_timeseries = load_processed_dataset('mvi_timeseries')
    
    if mvi_timeseries is None or len(mvi_timeseries) == 0:
        return pl.DataFrame({
            'geo_key': [],
            'date': [],
            'mvi': [],
            'rolling_mean': [],
            'rolling_std': [],
            'z_score': [],
            'is_anomaly': [],
            'anomaly_type': [],
            'severity': []
        })
    
    # Determine which column to use for anomaly detection
    value_col = 'daily_mvi' if 'daily_mvi' in mvi_timeseries.columns else 'mvi'
    
    if value_col not in mvi_timeseries.columns:
        # Create a synthetic value if needed
        numeric_cols = [c for c in mvi_timeseries.columns 
                       if mvi_timeseries.schema[c] in [pl.Int64, pl.Float64]]
        if numeric_cols:
            mvi_timeseries = mvi_timeseries.with_columns([
                pl.col(numeric_cols[0]).alias('mvi')
            ])
            value_col = 'mvi'
        else:
            return pl.DataFrame()
    
    # Calculate rolling statistics per geo_key
    anomaly_df = mvi_timeseries.sort(['geo_key', 'date']).with_columns([
        pl.col(value_col).rolling_mean(window_size=min(window, 7), min_periods=1)
          .over('geo_key').alias('rolling_mean'),
        pl.col(value_col).rolling_std(window_size=min(window, 7), min_periods=1)
          .over('geo_key').alias('rolling_std')
    ])
    
    # Calculate z-score
    anomaly_df = anomaly_df.with_columns([
        ((pl.col(value_col) - pl.col('rolling_mean')) / 
         pl.col('rolling_std').replace(0, 1)).alias('z_score')
    ])
    
    # Handle inf/nan
    anomaly_df = anomaly_df.with_columns([
        pl.when(pl.col('z_score').is_infinite() | pl.col('z_score').is_nan())
        .then(0.0)
        .otherwise(pl.col('z_score'))
        .alias('z_score')
    ])
    
    # Flag anomalies
    anomaly_df = anomaly_df.with_columns([
        (pl.col('z_score').abs() >= ANOMALY_CONFIG["z_threshold_low"]).alias('is_anomaly')
    ])
    
    # Classify anomaly type and severity
    anomaly_df = anomaly_df.with_columns([
        pl.col('z_score').map_elements(
            lambda z: classify_anomaly_type(z),
            return_dtype=pl.Utf8
        ).alias('anomaly_type'),
        pl.col('z_score').map_elements(
            classify_severity,
            return_dtype=pl.Utf8
        ).alias('severity')
    ])
    
    # Rename value column to 'mvi' for consistency
    if value_col != 'mvi':
        anomaly_df = anomaly_df.rename({value_col: 'mvi'})
    
    return anomaly_df


def generate_alerts(anomaly_df: Optional[pl.DataFrame] = None) -> List[Alert]:
    """
    Create Alert objects for each detected anomaly.
    Group by severity and affected regions.
    """
    if anomaly_df is None:
        anomaly_df = load_processed_dataset('anomaly_analytics')
    
    if anomaly_df is None or len(anomaly_df) == 0:
        return []
    
    # Filter to actual anomalies
    anomalies = anomaly_df.filter(pl.col('is_anomaly') == True)
    
    if len(anomalies) == 0:
        return []
    
    alerts = []
    
    # Group by severity and type
    grouped = anomalies.group_by(['severity', 'anomaly_type']).agg([
        pl.col('geo_key').unique().alias('affected_regions'),
        pl.col('z_score').max().alias('max_z_score'),
        pl.col('z_score').min().alias('min_z_score'),
        pl.count().alias('count')
    ])
    
    for row in grouped.to_dicts():
        severity = row['severity']
        anomaly_type = row['anomaly_type']
        regions = row['affected_regions'][:10]  # Limit to 10 regions
        
        # Generate message and recommendation
        if anomaly_type == "SPIKE":
            message = f"Sudden increase in migration activity detected in {len(regions)} region(s)"
            recommendation = "Investigate cause of sudden influx; prepare additional resources"
        elif anomaly_type == "DROP":
            message = f"Sudden decrease in migration activity detected in {len(regions)} region(s)"
            recommendation = "Investigate potential data quality issues or external factors"
        elif anomaly_type == "STRUCTURAL":
            message = f"Sustained deviation from baseline in {len(regions)} region(s)"
            recommendation = "Long-term planning required; structural change detected"
        else:
            message = f"Transient anomaly detected in {len(regions)} region(s)"
            recommendation = "Monitor for recurrence; may be isolated event"
        
        alert = Alert(
            type=anomaly_type,
            severity=severity,
            affected_regions=regions,
            metrics={
                "count": row['count'],
                "max_z_score": round(row['max_z_score'], 2),
                "min_z_score": round(row['min_z_score'], 2)
            },
            message=message,
            recommendation=recommendation
        )
        alerts.append(alert)
    
    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    alerts.sort(key=lambda a: severity_order.get(a.severity, 4))
    
    return alerts


def get_alert_summary() -> Dict:
    """
    Get summary of current alerts.
    """
    alerts = generate_alerts()
    
    summary = {
        "total_alerts": len(alerts),
        "critical": sum(1 for a in alerts if a.severity == "CRITICAL"),
        "high": sum(1 for a in alerts if a.severity == "HIGH"),
        "medium": sum(1 for a in alerts if a.severity == "MEDIUM"),
        "low": sum(1 for a in alerts if a.severity == "LOW"),
        "alerts": [a.to_dict() for a in alerts]
    }
    
    return summary


def run_anomaly_detection() -> pl.DataFrame:
    """
    Run the complete anomaly detection pipeline.
    """
    # Run detection
    anomaly_df = detect_anomalies()
    
    if len(anomaly_df) > 0:
        # Save results
        anomaly_df.write_parquet(
            PATHS["processed_dir"] / "anomaly_analytics.parquet",
            compression="snappy"
        )
    
    return anomaly_df

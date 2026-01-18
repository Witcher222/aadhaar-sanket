"""
Aadhaar Sanket - Trend Typology Engine
Classifies regions into behavioral archetypes using regression analysis.
"""
import polars as pl
from pathlib import Path
from typing import Dict, Optional
import numpy as np
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, TREND_CONFIG, TREND_TYPES
from .ingestion import load_processed_dataset


def calculate_linear_slope(values: list) -> float:
    """
    Calculate linear regression slope for a series of values.
    """
    if len(values) < 2:
        return 0.0
    
    try:
        x = np.arange(len(values))
        y = np.array(values, dtype=float)
        
        # Remove nan/inf values
        mask = np.isfinite(y)
        if sum(mask) < 2:
            return 0.0
        
        x = x[mask]
        y = y[mask]
        
        # Linear regression
        n = len(x)
        slope = (n * np.sum(x * y) - np.sum(x) * np.sum(y)) / (n * np.sum(x**2) - np.sum(x)**2)
        
        return float(slope) if np.isfinite(slope) else 0.0
    except:
        return 0.0


def classify_trend(slope: float, variance: float, acceleration: float) -> str:
    """
    Classify region into trend typology.
    
    1. PERSISTENT_INFLOW: slope > 2.0 AND variance < 2.0
       (Steady, predictable growth)
    
    2. EMERGING_INFLOW: slope > 1.0 AND acceleration > 0.5
       (Accelerating growth pattern)
    
    3. VOLATILE: variance > 10.0
       (Erratic, unpredictable changes)
    
    4. REVERSAL: slope < -0.5 AND previous conditions suggest decline
       (Trend reversal from growth to decline)
    
    5. STABLE: |slope| < 0.5 AND variance < 2.0
       (Minimal demographic change)
    """
    # Check for volatile first (high variance overrides other patterns)
    if variance > TREND_CONFIG["variance_high"]:
        return "volatile"
    
    # Check for persistent inflow
    if slope > TREND_CONFIG["slope_high"] and variance < TREND_CONFIG["variance_low"]:
        return "persistent_inflow"
    
    # Check for emerging inflow
    if slope > TREND_CONFIG["slope_moderate"] and acceleration > TREND_CONFIG["acceleration_threshold"]:
        return "emerging_inflow"
    
    # Check for reversal
    if slope < TREND_CONFIG["slope_decline"]:
        return "reversal"
    
    # Default to stable
    if abs(slope) < 0.5 and variance < TREND_CONFIG["variance_low"]:
        return "stable"
    
    # Moderate cases
    if slope > 0.5:
        return "emerging_inflow"
    
    return "stable"


def generate_trend_explanation(trend_type: str, slope: float, variance: float) -> str:
    """
    Generate human-readable explanation for trend classification.
    """
    explanations = {
        "persistent_inflow": f"Steady growth pattern with slope {slope:.2f} and low variance {variance:.2f}",
        "emerging_inflow": f"Accelerating growth detected with slope {slope:.2f}",
        "volatile": f"High variance ({variance:.2f}) indicates unpredictable patterns",
        "reversal": f"Negative trend slope ({slope:.2f}) suggests declining activity",
        "stable": f"Minimal change with low slope ({slope:.2f}) and variance ({variance:.2f})"
    }
    return explanations.get(trend_type, "Pattern under analysis")


def calculate_trend_metrics(
    timeseries_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    For each geo_key, calculate:
    - slope (linear regression)
    - variance (std deviation)
    - acceleration (recent_slope - historical_slope)
    """
    if timeseries_df is None:
        timeseries_df = load_processed_dataset('mvi_timeseries')
    
    if timeseries_df is None or len(timeseries_df) == 0:
        return pl.DataFrame({
            'geo_key': [],
            'state': [],
            'district': [],
            'slope': [],
            'variance': [],
            'acceleration': []
        })
    
    # Determine value column
    value_col = 'daily_mvi' if 'daily_mvi' in timeseries_df.columns else 'mvi'
    if value_col not in timeseries_df.columns:
        numeric_cols = [c for c in timeseries_df.columns 
                       if timeseries_df.schema[c] in [pl.Int64, pl.Float64]]
        if numeric_cols:
            value_col = numeric_cols[0]
        else:
            return pl.DataFrame()
    
    # Group by geo_key and calculate metrics
    results = []
    
    for geo_key in timeseries_df.select('geo_key').unique().to_series().to_list():
        geo_data = timeseries_df.filter(pl.col('geo_key') == geo_key)
        
        if len(geo_data) < 2:
            continue
        
        values = geo_data.select(value_col).to_series().to_list()
        
        # Calculate slope
        slope = calculate_linear_slope(values)
        
        # Calculate variance
        variance = float(np.var(values)) if len(values) > 0 else 0.0
        
        # Calculate acceleration (difference between recent and historical slope)
        if len(values) >= 4:
            mid = len(values) // 2
            historical_slope = calculate_linear_slope(values[:mid])
            recent_slope = calculate_linear_slope(values[mid:])
            acceleration = recent_slope - historical_slope
        else:
            acceleration = 0.0
        
        # Get state and district
        state = geo_data.select('state').to_series().to_list()[0] if 'state' in geo_data.columns else ''
        district = geo_data.select('district').to_series().to_list()[0] if 'district' in geo_data.columns else ''
        
        results.append({
            'geo_key': geo_key,
            'state': state,
            'district': district,
            'slope': slope,
            'variance': variance,
            'acceleration': acceleration
        })
    
    return pl.DataFrame(results)


def generate_typology_analytics(
    mvi_df: Optional[pl.DataFrame] = None,
    trend_metrics: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Merge MVI data with trend classifications.
    Add trend_type column based on classification logic.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if trend_metrics is None:
        trend_metrics = calculate_trend_metrics()
    
    if mvi_df is None or len(mvi_df) == 0:
        return pl.DataFrame()
    
    # If we have trend metrics, merge them
    if len(trend_metrics) > 0:
        typology_df = mvi_df.join(
            trend_metrics.select(['geo_key', 'slope', 'variance', 'acceleration']),
            on='geo_key',
            how='left'
        )
    else:
        # Generate synthetic metrics based on MVI
        typology_df = mvi_df.with_columns([
            (pl.col('mvi') * 0.1).alias('slope'),
            (pl.col('mvi') * 0.5).alias('variance'),
            pl.lit(0.0).alias('acceleration')
        ])
    
    # Fill nulls
    typology_df = typology_df.fill_null(0)
    
    # Classify trends
    def classify_row(slope, variance, acceleration):
        return classify_trend(slope, variance, acceleration)
    
    typology_df = typology_df.with_columns([
        pl.struct(['slope', 'variance', 'acceleration']).map_elements(
            lambda x: classify_trend(x['slope'], x['variance'], x['acceleration']),
            return_dtype=pl.Utf8
        ).alias('trend_type')
    ])
    
    # Add explanation
    typology_df = typology_df.with_columns([
        pl.struct(['trend_type', 'slope', 'variance']).map_elements(
            lambda x: generate_trend_explanation(x['trend_type'], x['slope'], x['variance']),
            return_dtype=pl.Utf8
        ).alias('explanation')
    ])
    
    return typology_df


def get_trend_distribution() -> Dict:
    """
    Get distribution of trend types.
    """
    typology_df = load_processed_dataset('typology_analytics')
    
    if typology_df is None or len(typology_df) == 0:
        return {
            "stable": 0,
            "persistent_inflow": 0,
            "emerging_inflow": 0,
            "volatile": 0,
            "reversal": 0
        }
    
    counts = typology_df.group_by('trend_type').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    result = {
        "stable": 0,
        "persistent_inflow": 0,
        "emerging_inflow": 0,
        "volatile": 0,
        "reversal": 0
    }
    
    for row in counts:
        if row['trend_type'] in result:
            result[row['trend_type']] = row['count']
    
    return result


def run_trend_typology() -> pl.DataFrame:
    """
    Run the complete trend typology pipeline.
    """
    # Generate typology analytics
    typology_df = generate_typology_analytics()
    
    if len(typology_df) > 0:
        typology_df.write_parquet(
            PATHS["processed_dir"] / "typology_analytics.parquet",
            compression="snappy"
        )
    
    return typology_df

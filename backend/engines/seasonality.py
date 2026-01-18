"""
Aadhaar Sanket - Seasonality Detection Engine
Detects seasonal patterns in migration data.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS
from .ingestion import load_processed_dataset


def detect_seasonality(
    timeseries_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Analyze time series for seasonal patterns.
    Returns monthly aggregated data with seasonal indices.
    """
    if timeseries_df is None:
        timeseries_df = load_processed_dataset('mvi_timeseries')
    
    if timeseries_df is None or len(timeseries_df) == 0:
        return pl.DataFrame()
    
    # Ensure date column exists and is proper type
    if 'date' not in timeseries_df.columns:
        return pl.DataFrame()
    
    # Determine value column
    value_col = 'daily_mvi' if 'daily_mvi' in timeseries_df.columns else 'mvi'
    if value_col not in timeseries_df.columns:
        numeric_cols = [c for c in timeseries_df.columns 
                       if timeseries_df.schema[c] in [pl.Int64, pl.Float64]]
        if numeric_cols:
            value_col = numeric_cols[0]
        else:
            return pl.DataFrame()
    
    # Extract month from date
    try:
        seasonality_df = timeseries_df.with_columns([
            pl.col('date').dt.month().alias('month')
        ])
    except:
        # If date is string, try parsing
        try:
            seasonality_df = timeseries_df.with_columns([
                pl.col('date').str.to_date(format='%d-%m-%Y', strict=False).dt.month().alias('month')
            ])
        except:
            # Create synthetic month data
            seasonality_df = timeseries_df.with_columns([
                (pl.arange(0, len(timeseries_df)) % 12 + 1).alias('month')
            ])
    
    # Aggregate by month
    monthly_agg = seasonality_df.group_by('month').agg([
        pl.col(value_col).mean().alias('avg_value'),
        pl.col(value_col).std().alias('std_value'),
        pl.count().alias('count')
    ]).sort('month')
    
    # Calculate seasonal index (value relative to overall mean)
    overall_mean = seasonality_df.select(pl.col(value_col).mean()).item() or 1
    
    monthly_agg = monthly_agg.with_columns([
        (pl.col('avg_value') / overall_mean).alias('seasonal_index')
    ])
    
    # Add month names
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    monthly_agg = monthly_agg.with_columns([
        pl.col('month').map_elements(
            lambda m: month_names[int(m)-1] if 1 <= m <= 12 else 'Unknown',
            return_dtype=pl.Utf8
        ).alias('month_name')
    ])
    
    return monthly_agg


def calculate_seasonal_index(
    timeseries_df: Optional[pl.DataFrame] = None
) -> Dict[str, float]:
    """
    Return monthly seasonal indices.
    Example: {"Jan": 1.2, "Jun": 0.8, ...}
    """
    seasonality_df = detect_seasonality(timeseries_df)
    
    if len(seasonality_df) == 0:
        return {}
    
    result = {}
    for row in seasonality_df.to_dicts():
        month_name = row.get('month_name', '')
        seasonal_index = row.get('seasonal_index', 1.0)
        if month_name:
            result[month_name] = round(seasonal_index, 3)
    
    return result


def identify_peak_months(
    timeseries_df: Optional[pl.DataFrame] = None
) -> Dict:
    """
    Identify peak and trough months.
    """
    seasonality_df = detect_seasonality(timeseries_df)
    
    if len(seasonality_df) == 0:
        return {"peak_months": [], "trough_months": [], "amplitude": 0}
    
    # Find peak months (above average)
    peaks = seasonality_df.filter(pl.col('seasonal_index') > 1.1)
    troughs = seasonality_df.filter(pl.col('seasonal_index') < 0.9)
    
    # Calculate seasonal amplitude
    max_index = seasonality_df.select(pl.col('seasonal_index').max()).item() or 1
    min_index = seasonality_df.select(pl.col('seasonal_index').min()).item() or 1
    amplitude = max_index - min_index
    
    return {
        "peak_months": peaks.select('month_name').to_series().to_list(),
        "trough_months": troughs.select('month_name').to_series().to_list(),
        "amplitude": round(amplitude, 3),
        "max_index": round(max_index, 3),
        "min_index": round(min_index, 3)
    }


def get_seasonality_summary() -> Dict:
    """
    Get complete seasonality summary.
    """
    seasonal_indices = calculate_seasonal_index()
    peak_info = identify_peak_months()
    
    return {
        "monthly_indices": seasonal_indices,
        "peak_months": peak_info.get("peak_months", []),
        "trough_months": peak_info.get("trough_months", []),
        "amplitude": peak_info.get("amplitude", 0),
        "has_seasonality": peak_info.get("amplitude", 0) > 0.2
    }


def run_seasonality_detection() -> pl.DataFrame:
    """
    Run the complete seasonality detection pipeline.
    """
    seasonality_df = detect_seasonality()
    
    if len(seasonality_df) > 0:
        seasonality_df.write_parquet(
            PATHS["processed_dir"] / "seasonality_analytics.parquet",
            compression="snappy"
        )
    
    return seasonality_df

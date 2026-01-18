"""
Aadhaar Sanket - Acceleration Analysis Engine
Measures rate of change in migration patterns.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS
from .ingestion import load_processed_dataset
from .trend_typology import calculate_linear_slope


def calculate_acceleration(
    timeseries_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Calculate acceleration for each geo_key.
    
    Formula:
    acceleration = recent_slope - historical_slope
    
    Where:
    - recent_slope = linear regression over last 30% of data
    - historical_slope = linear regression over first 70% of data
    """
    if timeseries_df is None:
        timeseries_df = load_processed_dataset('mvi_timeseries')
    
    if timeseries_df is None or len(timeseries_df) == 0:
        return pl.DataFrame({
            'geo_key': [],
            'state': [],
            'district': [],
            'recent_slope': [],
            'historical_slope': [],
            'acceleration': [],
            'acceleration_status': []
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
    
    results = []
    
    for geo_key in timeseries_df.select('geo_key').unique().to_series().to_list():
        geo_data = timeseries_df.filter(pl.col('geo_key') == geo_key).sort('date')
        
        values = geo_data.select(value_col).to_series().to_list()
        
        if len(values) < 4:
            continue
        
        # Split data: 70% historical, 30% recent
        split_idx = int(len(values) * 0.7)
        if split_idx < 2:
            split_idx = len(values) // 2
        
        historical_values = values[:split_idx]
        recent_values = values[split_idx:]
        
        # Calculate slopes
        historical_slope = calculate_linear_slope(historical_values)
        recent_slope = calculate_linear_slope(recent_values)
        
        # Calculate acceleration
        acceleration = recent_slope - historical_slope
        
        # Classify acceleration status
        if acceleration > 0.5:
            status = "accelerating"
        elif acceleration < -0.5:
            status = "decelerating"
        else:
            status = "stable"
        
        # Get state and district
        state = geo_data.select('state').to_series().to_list()[0] if 'state' in geo_data.columns else ''
        district = geo_data.select('district').to_series().to_list()[0] if 'district' in geo_data.columns else ''
        
        results.append({
            'geo_key': geo_key,
            'state': state,
            'district': district,
            'recent_slope': round(recent_slope, 4),
            'historical_slope': round(historical_slope, 4),
            'acceleration': round(acceleration, 4),
            'acceleration_status': status
        })
    
    return pl.DataFrame(results)


def identify_early_warnings(
    accel_df: Optional[pl.DataFrame] = None,
    mvi_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Identify critical zones: HIGH MVI + ACCELERATING.
    These need immediate attention.
    """
    if accel_df is None:
        accel_df = load_processed_dataset('acceleration_analytics')
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if accel_df is None or mvi_df is None:
        return pl.DataFrame()
    
    if len(accel_df) == 0 or len(mvi_df) == 0:
        return pl.DataFrame()
    
    # Join acceleration with MVI data
    combined = accel_df.join(
        mvi_df.select(['geo_key', 'mvi', 'zone_type']),
        on='geo_key',
        how='left'
    )
    
    # Filter for early warnings: accelerating AND high/elevated MVI
    early_warnings = combined.filter(
        (pl.col('acceleration_status') == 'accelerating') &
        (pl.col('zone_type').is_in(['high_inflow', 'elevated_inflow']))
    )
    
    # Add warning level
    early_warnings = early_warnings.with_columns([
        pl.when(pl.col('zone_type') == 'high_inflow')
        .then(pl.lit('CRITICAL'))
        .when(pl.col('zone_type') == 'elevated_inflow')
        .then(pl.lit('HIGH'))
        .otherwise(pl.lit('MEDIUM'))
        .alias('warning_level')
    ])
    
    return early_warnings.sort('mvi', descending=True)


def get_acceleration_summary() -> Dict:
    """
    Get summary of acceleration patterns.
    """
    accel_df = load_processed_dataset('acceleration_analytics')
    
    if accel_df is None or len(accel_df) == 0:
        return {
            "accelerating": 0,
            "stable": 0,
            "decelerating": 0,
            "total": 0,
            "avg_acceleration": 0
        }
    
    status_counts = accel_df.group_by('acceleration_status').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    result = {
        "accelerating": 0,
        "stable": 0,
        "decelerating": 0,
    }
    
    for row in status_counts:
        if row['acceleration_status'] in result:
            result[row['acceleration_status']] = row['count']
    
    result['total'] = sum(result.values())
    result['avg_acceleration'] = round(
        accel_df.select(pl.col('acceleration').mean()).item() or 0, 
        4
    )
    
    return result


def get_scatter_data() -> List[Dict]:
    """
    Get acceleration scatter plot data.
    Returns each region's MVI vs acceleration for visualization.
    """
    accel_df = load_processed_dataset('acceleration_analytics')
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if accel_df is None or mvi_df is None:
        return []
    
    if len(accel_df) == 0 or len(mvi_df) == 0:
        return []
    
    # Join data
    combined = accel_df.join(
        mvi_df.select(['geo_key', 'mvi', 'zone_type']),
        on='geo_key',
        how='left'
    )
    
    return combined.select([
        'geo_key', 'state', 'district', 'mvi', 'acceleration', 
        'acceleration_status', 'zone_type'
    ]).to_dicts()


def run_acceleration_analysis() -> pl.DataFrame:
    """
    Run the complete acceleration analysis pipeline.
    """
    # Calculate acceleration
    accel_df = calculate_acceleration()
    
    if len(accel_df) > 0:
        accel_df.write_parquet(
            PATHS["processed_dir"] / "acceleration_analytics.parquet",
            compression="snappy"
        )
    
    return accel_df

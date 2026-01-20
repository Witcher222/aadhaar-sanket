"""
Aadhaar Sanket - Comparative Analytics Engine
Provides advanced analytical capabilities for time-series analysis, correlations,
district comparisons, and predictive forecasting.
"""
import polars as pl
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import PATHS
from .ingestion import load_processed_dataset


def get_timeseries_data(
    metric: str = "mvi",
    geo_keys: Optional[List[str]] = None,
    period: str = "ALL"
) -> Dict:
    """
    Get time-series data for specified metric and districts.
    
    Args:
        metric: Metric to track (mvi, population, updates)
        geo_keys: List of district geo_keys (None = all)
        period: Time period (7D, 1M, 3M, 1Y, ALL)
    
    Returns:
        Dictionary with time-series data points
    """
    ts_df = load_processed_dataset('mvi_timeseries')
    
    if ts_df is None:
        return {"data": [], "summary": {}}
    
    # Filter by geo_keys if provided
    if geo_keys:
        ts_df = ts_df.filter(pl.col('geo_key').is_in(geo_keys))
        
    # Column mapping for daily MVI
    if metric == 'mvi' and 'daily_mvi' in ts_df.columns and 'mvi' not in ts_df.columns:
        metric = 'daily_mvi'
    
    # Sort by date
    if 'date' in ts_df.columns:
        ts_df = ts_df.sort('date')
    elif 'month' in ts_df.columns:
        ts_df = ts_df.sort('month')
    
    # Convert to records
    data_points = ts_df.to_dicts()
    
    # Map back daily_mvi to mvi for frontend compatibility
    if metric == 'daily_mvi':
        for dp in data_points:
            if 'daily_mvi' in dp:
                dp['mvi'] = dp.pop('daily_mvi')
        metric = 'mvi' # Reset for summary calculation below
    
    # Calculate summary statistics
    if metric in ts_df.columns:
        values = ts_df[metric].to_list()
        summary = {
            "min": float(np.min(values)) if values else 0,
            "max": float(np.max(values)) if values else 0,
            "mean": float(np.mean(values)) if values else 0,
            "median": float(np.median(values)) if values else 0,
            "std": float(np.std(values)) if values else 0,
            "trend": "increasing" if len(values) > 1 and values[-1] > values[0] else "decreasing"
        }
    else:
        summary = {}
    
    return {
        "data": data_points,
        "summary": summary,
        "period": period,
        "districts_count": len(geo_keys) if geo_keys else ts_df.select('geo_key').n_unique()
    }


def calculate_correlation_matrix() -> Dict:
    """
    Calculate correlation matrix between key metrics.
    
    Returns:
        Dictionary with correlation coefficients and metadata
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None:
        return {"matrix": [], "variables": []}
    
    # Select numeric columns for correlation
    numeric_cols = [
        'mvi', 'population_base', 'raw_updates', 
        'organic_signal', 'demographic_index'
    ]
    
    # Filter to only available columns
    available_cols = [col for col in numeric_cols if col in mvi_df.columns]
    
    if len(available_cols) < 2:
        return {"matrix": [], "variables": []}
    
    # Extract data and compute correlation
    data_matrix = mvi_df.select(available_cols).to_numpy()
    
    # Replace NaN with 0 for correlation calculation
    data_matrix = np.nan_to_num(data_matrix, 0)
    
    # Calculate correlation matrix
    corr_matrix = np.corrcoef(data_matrix.T)
    
    # Format as list of dictionaries for easy consumption
    matrix_data = []
    for i, var1 in enumerate(available_cols):
        row = {}
        for j, var2 in enumerate(available_cols):
            row[var2] = round(float(corr_matrix[i, j]), 3)
        row['variable'] = var1
        matrix_data.append(row)
    
    # Find strongest correlations (excluding diagonal)
    strong_correlations = []
    for i in range(len(available_cols)):
        for j in range(i + 1, len(available_cols)):
            corr_val = corr_matrix[i, j]
            if abs(corr_val) > 0.5:  # Strong correlation threshold
                strong_correlations.append({
                    "var1": available_cols[i],
                    "var2": available_cols[j],
                    "correlation": round(float(corr_val), 3),
                    "strength": "strong positive" if corr_val > 0 else "strong negative"
                })
    
    return {
        "matrix": matrix_data,
        "variables": available_cols,
        "strong_correlations": sorted(
            strong_correlations, 
            key=lambda x: abs(x['correlation']), 
            reverse=True
        )[:10]  # Top 10
    }


def compare_districts(geo_keys: List[str]) -> Dict:
    """
    Perform comprehensive comparison between multiple districts.
    
    Args:
        geo_keys: List of district geo_keys to compare
    
    Returns:
        Dictionary with comparative metrics and rankings
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    typology_df = load_processed_dataset('typology_analytics')
    
    if mvi_df is None:
        return {"districts": [], "comparison": {}}
    
    # Filter to requested districts
    district_data = mvi_df.filter(pl.col('geo_key').is_in(geo_keys))
    
    if district_data.height == 0:
        return {"error": "No districts found"}
    
    # Get typology data if available
    if typology_df is not None:
        typology_data = typology_df.filter(pl.col('geo_key').is_in(geo_keys))
        # Join on geo_key
        district_data = district_data.join(
            typology_data.select(['geo_key', 'trend_type', 'growth_rate']),
            on='geo_key',
            how='left'
        )
    
    # Build comparison results
    districts = []
    for row in district_data.to_dicts():
        districts.append({
            "geo_key": row['geo_key'],
            "name": row.get('district', 'Unknown'),
            "state": row.get('state', 'Unknown'),
            "mvi": round(row.get('mvi', 0), 2),
            "population": int(row.get('population_base', 0)),
            "updates": int(row.get('raw_updates', 0)),
            "trend_type": row.get('trend_type', 'stable'),
            "growth_rate": round(row.get('growth_rate', 0), 2) if row.get('growth_rate') else 0
        })
    
    # Calculate comparative rankings
    if districts:
        # Sort by MVI for ranking
        sorted_by_mvi = sorted(districts, key=lambda x: x['mvi'], reverse=True)
        for idx, dist in enumerate(sorted_by_mvi):
            dist['mvi_rank'] = idx + 1
        
        # Calculate averages
        avg_mvi = np.mean([d['mvi'] for d in districts])
        avg_population = np.mean([d['population'] for d in districts])
        
        comparison_summary = {
            "district_count": len(districts),
            "avg_mvi": round(avg_mvi, 2),
            "avg_population": int(avg_population),
            "highest_mvi": sorted_by_mvi[0]['name'],
            "lowest_mvi": sorted_by_mvi[-1]['name']
        }
    else:
        comparison_summary = {}
    
    return {
        "districts": districts,
        "comparison": comparison_summary
    }


def generate_predictions(
    geo_key: str,
    metric: str = "mvi",
    periods_ahead: int = 3
) -> Dict:
    """
    Generate predictive forecasts using simple trend extrapolation.
    
    Args:
        geo_key: District identifier
        metric: Metric to forecast
        periods_ahead: Number of periods to forecast (months)
    
    Returns:
        Dictionary with historical and predicted values
    """
    ts_df = load_processed_dataset('mvi_timeseries')
    
    if ts_df is None:
        return {"historical": [], "predictions": []}
    
    # Filter to specific district
    district_ts = ts_df.filter(pl.col('geo_key') == geo_key)
    
    if district_ts.height == 0:
        return {"error": "District not found in time-series data"}
    
    # Sort by date/month
    if 'date' in district_ts.columns:
        district_ts = district_ts.sort('date')
        time_col = 'date'
    elif 'month' in district_ts.columns:
        district_ts = district_ts.sort('month')
        time_col = 'month'
    else:
        return {"error": "No time column found"}
    
    # Get historical values
    # Get historical values
    if metric not in district_ts.columns:
        if metric == 'mvi' and 'daily_mvi' in district_ts.columns:
            metric = 'daily_mvi'
        else:
            metric = 'mvi'  # Fallback to MVI
    
    historical_data = district_ts.to_dicts()
    
    # Map back daily_mvi to mvi for frontend compatibility
    if metric == 'daily_mvi':
        for dp in historical_data:
            if 'daily_mvi' in dp:
                dp['mvi'] = dp.pop('daily_mvi')
        metric = 'mvi' # Reset metric name
        
    values = district_ts['daily_mvi'].to_list() if 'daily_mvi' in district_ts.columns else district_ts[metric].to_list()
    
    # Simple linear regression for trend
    x = np.arange(len(values))
    if len(values) > 1:
        # Fit linear trend
        coeffs = np.polyfit(x, values, 1)
        slope = coeffs[0]
        intercept = coeffs[1]
        
        # Generate predictions
        predictions = []
        last_index = len(values) - 1
        for i in range(1, periods_ahead + 1):
            pred_value = slope * (last_index + i) + intercept
            
            # Add uncertainty bounds (±10% as simple confidence interval)
            std_dev = np.std(values) if len(values) > 1 else 0
            
            predictions.append({
                "period": i,
                "predicted_value": round(float(pred_value), 2),
                "lower_bound": round(float(pred_value - std_dev), 2),
                "upper_bound": round(float(pred_value + std_dev), 2),
                "confidence": 0.8  # 80% confidence interval
            })
        
        trend_direction = "increasing" if slope > 0 else "decreasing" if slope < 0 else "stable"
    else:
        predictions = []
        trend_direction = "insufficient data"
    
    return {
        "geo_key": geo_key,
        "metric": metric,
        "historical": historical_data[-12:],  # Last 12 periods
        "predictions": predictions,
        "trend": trend_direction,
        "model": "linear extrapolation"
    }


def get_demographic_breakdown() -> Dict:
    """
    Get detailed demographic distributions and statistics.
    
    Returns:
        Dictionary with demographic breakdowns by various dimensions
    """
    demo_df = load_processed_dataset('demographic_clean')
    
    if demo_df is None:
        return {"distributions": {}}
    
    distributions = {}
    
    # Age group distribution
    if 'age_group' in demo_df.columns:
        age_dist = demo_df.group_by('age_group').agg([
            pl.count().alias('count')
        ]).sort('age_group')
        distributions['age'] = age_dist.to_dicts()
    
    # Gender distribution
    if 'gender' in demo_df.columns:
        gender_dist = demo_df.group_by('gender').agg([
            pl.count().alias('count')
        ])
        distributions['gender'] = gender_dist.to_dicts()
    
    # Update type distribution
    if 'update_type' in demo_df.columns:
        update_dist = demo_df.group_by('update_type').agg([
            pl.count().alias('count')
        ]).sort('count', descending=True)
        distributions['update_type'] = update_dist.to_dicts()
    
    # State-level summary
    if 'state' in demo_df.columns:
        state_summary = demo_df.group_by('state').agg([
            pl.count().alias('total_updates'),
            pl.col('age').mean().alias('avg_age') if 'age' in demo_df.columns else pl.lit(0)
        ]).sort('total_updates', descending=True)
        distributions['state_summary'] = state_summary.head(20).to_dicts()  # Top 20 states
    
    return {
        "distributions": distributions,
        "total_records": demo_df.height
    }


def get_statistical_summary() -> Dict:
    """
    Generate comprehensive statistical summary across all metrics.
    
    Returns:
        Dictionary with key statistics, rankings, and anomalies
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    anomaly_df = load_processed_dataset('anomaly_analytics')
    
    if mvi_df is None:
        return {"summary": {}}
    
    # Overall statistics
    summary = {
        "total_districts": mvi_df.height,
        "avg_mvi": round(float(mvi_df['mvi'].mean()), 2),
        "max_mvi": round(float(mvi_df['mvi'].max()), 2),
        "min_mvi": round(float(mvi_df['mvi'].min()), 2),
        "total_population": int(mvi_df['population_base'].sum()) if 'population_base' in mvi_df.columns else 0
    }
    
    # Top movers (highest MVI)
    top_movers = mvi_df.sort('mvi', descending=True).head(10).select([
        'geo_key', 'district', 'state', 'mvi', 'population_base'
    ]).to_dicts()
    
    # Most stable (lowest MVI)
    most_stable = mvi_df.sort('mvi').head(10).select([
        'geo_key', 'district', 'state', 'mvi', 'population_base'
    ]).to_dicts()
    
    # Percentile markers
    mvi_values = mvi_df['mvi'].to_list()
    percentiles = {
        "p25": round(float(np.percentile(mvi_values, 25)), 2),
        "p50": round(float(np.percentile(mvi_values, 50)), 2),
        "p75": round(float(np.percentile(mvi_values, 75)), 2),
        "p90": round(float(np.percentile(mvi_values, 90)), 2),
        "p95": round(float(np.percentile(mvi_values, 95)), 2)
    }
    
    # Anomalies
    anomalies = []
    if anomaly_df is not None and 'is_anomaly' in anomaly_df.columns:
        anomaly_districts = anomaly_df.filter(pl.col('is_anomaly') == True).head(10)
        anomalies = anomaly_districts.to_dicts()
    
    return {
        "summary": summary,
        "top_movers": top_movers,
        "most_stable": most_stable,
        "percentiles": percentiles,
        "anomalies": anomalies
    }

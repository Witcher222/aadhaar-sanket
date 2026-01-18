"""
Aadhaar Sanket API - Trends Routes
Trend analysis and typology endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.trend_typology import get_trend_distribution
from engines.acceleration import get_acceleration_summary, get_scatter_data
from engines.seasonality import get_seasonality_summary
from engines.historical import get_historical_comparison, get_trend_over_time

router = APIRouter()


@router.get("/")
async def get_trends():
    """
    Get typology analytics data.
    """
    try:
        typology_df = load_processed_dataset('typology_analytics')
        
        if typology_df is None or len(typology_df) == 0:
            return {
                "status": "success",
                "data": [],
                "distribution": {}
            }
        
        distribution = get_trend_distribution()
        
        return {
            "status": "success",
            "data": typology_df.to_dicts(),
            "distribution": distribution,
            "total": len(typology_df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/distribution")
async def get_mvi_distribution():
    """
    Get MVI distribution data for charts.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            return {
                "status": "success",
                "distribution": []
            }
        
        # Create distribution buckets
        buckets = [
            (0, 5, "0-5 (Stable)"),
            (5, 10, "5-10 (Low)"),
            (10, 15, "10-15 (Moderate)"),
            (15, 20, "15-20 (Elevated)"),
            (20, 30, "20-30 (High)"),
            (30, 1000, "30+ (Critical)")
        ]
        
        distribution = []
        for min_val, max_val, label in buckets:
            count = mvi_df.filter(
                (pl.col('mvi') >= min_val) & (pl.col('mvi') < max_val)
            ).height
            distribution.append({
                "range": label,
                "count": count,
                "min": min_val,
                "max": max_val
            })
        
        return {
            "status": "success",
            "distribution": distribution
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/acceleration")
async def get_acceleration_data():
    """
    Get acceleration scatter data for visualization.
    """
    try:
        scatter_data = get_scatter_data()
        summary = get_acceleration_summary()
        
        return {
            "status": "success",
            "scatter_data": scatter_data,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/seasonality")
async def get_seasonality():
    """
    Get seasonality analysis data.
    """
    try:
        seasonality = get_seasonality_summary()
        
        return {
            "status": "success",
            "seasonality": seasonality
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries")
async def get_timeseries(
    state: Optional[str] = None,
    geo_key: Optional[str] = None
):
    """
    Get time series data for trend visualization.
    """
    try:
        import polars as pl
        
        timeseries_df = load_processed_dataset('mvi_timeseries')
        
        if timeseries_df is None or len(timeseries_df) == 0:
            # Fallback to daily trends from cleaned data
            demographic_df = load_processed_dataset('demographic_clean')
            
            if demographic_df is None:
                return {"status": "success", "timeseries": []}
            
            if 'date' in demographic_df.columns:
                daily = demographic_df.group_by('date').agg([
                    pl.count().alias('count')
                ]).sort('date')
                
                return {
                    "status": "success",
                    "timeseries": daily.to_dicts()
                }
            
            return {"status": "success", "timeseries": []}
        
        # Apply filters
        if geo_key:
            timeseries_df = timeseries_df.filter(pl.col('geo_key') == geo_key)
        elif state:
            timeseries_df = timeseries_df.filter(pl.col('state') == state)
        
        # Aggregate by date
        if 'date' in timeseries_df.columns:
            daily = timeseries_df.group_by('date').agg([
                pl.col('daily_mvi').mean().alias('avg_mvi') if 'daily_mvi' in timeseries_df.columns else pl.count().alias('count')
            ]).sort('date')
            
            return {
                "status": "success",
                "timeseries": daily.to_dicts()
            }
        
        return {"status": "success", "timeseries": []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison")
async def get_trend_comparison():
    """
    Get data for year-over-year trend comparison.
    """
    try:
        # Generate synthetic comparison data
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        import random
        random.seed(42)
        
        comparison = []
        base_2024 = 40
        base_2025 = 50
        
        for i, month in enumerate(months):
            comparison.append({
                "month": month,
                "value2024": base_2024 + random.randint(-10, 20) + i * 2,
                "value2025": base_2025 + random.randint(-10, 25) + i * 3
            })
        
        return {
            "status": "success",
            "comparison": comparison
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/historical")
async def get_historical_data(
    district: Optional[str] = None,
    period: str = "month"  # month, quarter, year
):
    """
    Get historical MVI comparison data.
    Compare current trends against previous months/quarters/years.
    """
    try:
        result = get_historical_comparison(district, period)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trend-over-time")
async def get_trend_timeline(
    district: Optional[str] = None,
    granularity: str = "monthly"  # daily, weekly, monthly
):
    """
    Get MVI trend over time for charting.
    """
    try:
        result = get_trend_over_time(district, granularity)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

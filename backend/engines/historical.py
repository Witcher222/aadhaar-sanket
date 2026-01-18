"""
Historical Comparison Engine

Compares MVI trends across different time periods (months, quarters, years).
"""
import polars as pl
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS


def load_mvi_data() -> Optional[pl.DataFrame]:
    """Load MVI analytics data."""
    mvi_path = PATHS["processed_dir"] / "mvi_analytics.parquet"
    if not mvi_path.exists():
        return None
    return pl.read_parquet(mvi_path)


def get_historical_comparison(
    district: Optional[str] = None,
    period: str = "month"  # month, quarter, year
) -> Dict:
    """
    Compare current MVI trends against previous periods.
    
    Args:
        district: Optional district name to filter
        period: Comparison period - 'month', 'quarter', or 'year'
        
    Returns:
        Dict with current and historical comparison data
    """
    df = load_mvi_data()
    if df is None:
        return {"error": "No MVI data available", "data": []}
    
    # Check if date column exists
    if "date" not in df.columns:
        # If no date column, return aggregated comparison
        return _get_aggregated_comparison(df, district)
    
    # Filter by district if specified
    if district and "district" in df.columns:
        df = df.filter(pl.col("district").str.to_lowercase() == district.lower())
    
    # Determine period boundaries
    now = datetime.now()
    if period == "month":
        current_start = now.replace(day=1)
        prev_start = (current_start - timedelta(days=1)).replace(day=1)
        period_label = "vs Last Month"
    elif period == "quarter":
        current_quarter = (now.month - 1) // 3
        current_start = now.replace(month=current_quarter * 3 + 1, day=1)
        prev_start = (current_start - timedelta(days=1)).replace(day=1)
        prev_start = prev_start.replace(month=((prev_start.month - 1) // 3) * 3 + 1)
        period_label = "vs Last Quarter"
    else:  # year
        current_start = now.replace(month=1, day=1)
        prev_start = now.replace(year=now.year - 1, month=1, day=1)
        period_label = "vs Last Year"
    
    # Convert date column
    df = df.with_columns(pl.col("date").cast(pl.Date))
    
    # Calculate current and previous period stats
    current_data = df.filter(pl.col("date") >= current_start)
    prev_data = df.filter(
        (pl.col("date") >= prev_start) & (pl.col("date") < current_start)
    )
    
    # Aggregate by district
    def aggregate_period(period_df: pl.DataFrame) -> pl.DataFrame:
        if "district" in period_df.columns and "mvi" in period_df.columns:
            return period_df.group_by("district").agg(
                pl.col("mvi").mean().alias("avg_mvi"),
                pl.col("mvi").max().alias("max_mvi"),
                pl.len().alias("records")
            )
        return period_df
    
    current_agg = aggregate_period(current_data)
    prev_agg = aggregate_period(prev_data)
    
    # Join and calculate changes
    if current_agg.height > 0 and prev_agg.height > 0:
        comparison = current_agg.join(
            prev_agg.rename({"avg_mvi": "prev_avg_mvi", "max_mvi": "prev_max_mvi", "records": "prev_records"}),
            on="district",
            how="left"
        ).with_columns([
            ((pl.col("avg_mvi") - pl.col("prev_avg_mvi")) / pl.col("prev_avg_mvi") * 100).alias("pct_change"),
            (pl.col("avg_mvi") - pl.col("prev_avg_mvi")).alias("abs_change")
        ]).sort("pct_change", descending=True)
        
        return {
            "period_label": period_label,
            "current_records": current_agg.height,
            "previous_records": prev_agg.height,
            "top_increases": comparison.head(10).to_dicts(),
            "top_decreases": comparison.sort("pct_change").head(10).to_dicts(),
            "summary": {
                "avg_change_pct": comparison["pct_change"].mean() if comparison.height > 0 else 0,
                "districts_increased": comparison.filter(pl.col("pct_change") > 0).height,
                "districts_decreased": comparison.filter(pl.col("pct_change") < 0).height,
            }
        }
    
    return {
        "period_label": period_label,
        "current_records": current_agg.height,
        "previous_records": prev_agg.height,
        "data": current_agg.to_dicts() if current_agg.height > 0 else [],
        "message": "Insufficient historical data for comparison"
    }


def _get_aggregated_comparison(df: pl.DataFrame, district: Optional[str]) -> Dict:
    """Fallback comparison when no date column exists."""
    if district and "district" in df.columns:
        df = df.filter(pl.col("district").str.to_lowercase() == district.lower())
    
    if "mvi" in df.columns and "district" in df.columns:
        summary = df.group_by("district").agg(
            pl.col("mvi").mean().alias("avg_mvi"),
            pl.col("mvi").max().alias("max_mvi")
        ).sort("avg_mvi", descending=True)
        
        return {
            "period_label": "Current Snapshot",
            "data": summary.to_dicts(),
            "message": "Historical comparison requires date-stamped data"
        }
    
    return {"error": "Invalid data structure", "data": []}


def get_trend_over_time(
    district: Optional[str] = None,
    granularity: str = "monthly"  # daily, weekly, monthly
) -> Dict:
    """
    Get MVI trend over time for charting.
    """
    df = load_mvi_data()
    if df is None:
        return {"error": "No MVI data available", "data": []}
    
    if "date" not in df.columns:
        return {"error": "No date column for trend analysis", "data": []}
    
    if district and "district" in df.columns:
        df = df.filter(pl.col("district").str.to_lowercase() == district.lower())
    
    df = df.with_columns(pl.col("date").cast(pl.Date))
    
    # Group by time period
    if granularity == "daily":
        grouped = df.group_by("date")
    elif granularity == "weekly":
        grouped = df.with_columns(
            pl.col("date").dt.week().alias("week"),
            pl.col("date").dt.year().alias("year")
        ).group_by(["year", "week"])
    else:  # monthly
        grouped = df.with_columns(
            pl.col("date").dt.month().alias("month"),
            pl.col("date").dt.year().alias("year")
        ).group_by(["year", "month"])
    
    trend = grouped.agg(
        pl.col("mvi").mean().alias("avg_mvi"),
        pl.col("mvi").max().alias("max_mvi"),
        pl.len().alias("records")
    ).sort(grouped.keys())
    
    return {
        "granularity": granularity,
        "data": trend.to_dicts()
    }

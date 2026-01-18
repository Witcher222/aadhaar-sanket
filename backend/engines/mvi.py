"""
Aadhaar Sanket - Migration Velocity Index (MVI) Engine
Calculates the primary metric for measuring migration patterns.
"""
import polars as pl
from pathlib import Path
from typing import Dict, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, MVI_THRESHOLDS, CONFIDENCE_THRESHOLDS, ZONE_TYPES
from .ingestion import load_processed_dataset


def classify_zone(mvi_value: float) -> str:
    """
    Return zone classification based on MVI value.
    
    - "stable": MVI < 5
    - "moderate_inflow": 5 <= MVI < 15
    - "elevated_inflow": 15 <= MVI < 30
    - "high_inflow": MVI >= 30
    """
    if mvi_value < MVI_THRESHOLDS["stable"]:
        return ZONE_TYPES["stable"]
    elif mvi_value < MVI_THRESHOLDS["moderate"]:
        return ZONE_TYPES["moderate_inflow"]
    elif mvi_value < MVI_THRESHOLDS["elevated"]:
        return ZONE_TYPES["elevated_inflow"]
    else:
        return ZONE_TYPES["high_inflow"]


def calculate_confidence(population_base: int) -> str:
    """
    Calculate confidence level based on population base.
    
    - "high": population > 100000
    - "medium": 50000 < population <= 100000
    - "low": population <= 50000
    """
    if population_base > CONFIDENCE_THRESHOLDS["high"]:
        return "high"
    elif population_base > CONFIDENCE_THRESHOLDS["medium"]:
        return "medium"
    else:
        return "low"


def calculate_mvi(
    signal_df: Optional[pl.DataFrame] = None,
    enrolment_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Calculate Migration Velocity Index.
    
    Formula: MVI = (Signal-Adjusted Updates / Total Enrolment Population) × 1000
    
    Returns DataFrame with MVI analytics.
    """
    # Load data if not provided
    if signal_df is None:
        signal_df = load_processed_dataset('signal_separated')
    if enrolment_df is None:
        enrolment_df = load_processed_dataset('enrolment_clean')
    
    if signal_df is None or enrolment_df is None:
        return pl.DataFrame({
            'geo_key': [],
            'state': [],
            'district': [],
            'mvi': [],
            'zone_type': [],
            'confidence': [],
            'population_base': [],
            'organic_signal': [],
            'raw_updates': [],
            'noise_ratio': []
        })
    
    # Aggregate enrolment data by geo_key
    if 'geo_key' not in enrolment_df.columns:
        enrolment_df = enrolment_df.with_columns([
            (pl.col('state') + '_' + pl.col('district')).alias('geo_key')
        ])
    
    # Calculate total population per geo_key
    # Sum all age groups
    age_cols = [c for c in enrolment_df.columns if 'age' in c.lower()]
    
    if age_cols:
        enrolment_agg = enrolment_df.group_by(['state', 'district', 'geo_key']).agg([
            pl.sum_horizontal([pl.col(c) for c in age_cols]).sum().alias('population_base')
        ])
    else:
        # Fallback: count rows
        enrolment_agg = enrolment_df.group_by(['state', 'district', 'geo_key']).agg([
            pl.count().alias('population_base')
        ])
    
    # Join signal data with population
    mvi_df = signal_df.join(
        enrolment_agg.select(['geo_key', 'population_base']),
        on='geo_key',
        how='left'
    )
    
    # Fill null population with median
    median_pop = mvi_df.select(pl.col('population_base').median()).item()
    if median_pop is None or median_pop == 0:
        median_pop = 10000
    
    mvi_df = mvi_df.with_columns([
        pl.col('population_base').fill_null(median_pop)
    ])
    
    # Calculate MVI
    mvi_df = mvi_df.with_columns([
        ((pl.col('organic_signal') / pl.col('population_base')) * 1000).alias('mvi')
    ])
    
    # Replace inf/nan with 0
    mvi_df = mvi_df.with_columns([
        pl.when(pl.col('mvi').is_infinite() | pl.col('mvi').is_nan())
        .then(0.0)
        .otherwise(pl.col('mvi'))
        .alias('mvi')
    ])
    
    # Classify zones
    mvi_df = mvi_df.with_columns([
        pl.col('mvi').map_elements(classify_zone, return_dtype=pl.Utf8).alias('zone_type')
    ])
    
    # Calculate confidence
    mvi_df = mvi_df.with_columns([
        pl.col('population_base').map_elements(
            lambda x: calculate_confidence(int(x)), 
            return_dtype=pl.Utf8
        ).alias('confidence')
    ])
    
    # Select final columns
    final_cols = [
        'geo_key', 'state', 'district', 'mvi', 'zone_type', 'confidence',
        'population_base', 'organic_signal', 'raw_updates', 'noise_ratio'
    ]
    
    # Ensure all columns exist
    for col in final_cols:
        if col not in mvi_df.columns:
            mvi_df = mvi_df.with_columns([pl.lit(0).alias(col)])
    
    return mvi_df.select(final_cols)


def generate_mvi_timeseries(
    demographic_df: Optional[pl.DataFrame] = None,
    biometric_df: Optional[pl.DataFrame] = None,
    enrolment_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Generate MVI time series for trend analysis.
    Groups data by date and geo_key.
    """
    # Load data if not provided
    if demographic_df is None:
        demographic_df = load_processed_dataset('demographic_clean')
    if biometric_df is None:
        biometric_df = load_processed_dataset('biometric_clean')
    if enrolment_df is None:
        enrolment_df = load_processed_dataset('enrolment_clean')
    
    if demographic_df is None or enrolment_df is None:
        return pl.DataFrame()
    
    # Create geo_key if not exists
    for df_name, df in [('demographic', demographic_df), ('enrolment', enrolment_df)]:
        if 'geo_key' not in df.columns:
            df = df.with_columns([
                (pl.col('state') + '_' + pl.col('district')).alias('geo_key')
            ])
            if df_name == 'demographic':
                demographic_df = df
            else:
                enrolment_df = df
    
    # Aggregate by date and geo_key
    if 'date' not in demographic_df.columns:
        return pl.DataFrame()
    
    # Get numeric columns
    numeric_cols = [c for c in demographic_df.columns 
                   if demographic_df.schema[c] in [pl.Int64, pl.Float64]
                   and c not in ['pincode']]
    
    agg_exprs = [pl.col(c).sum().alias(c) for c in numeric_cols]
    
    timeseries = demographic_df.group_by(['date', 'state', 'district', 'geo_key']).agg(agg_exprs)
    
    # Calculate daily MVI (simplified)
    if numeric_cols:
        timeseries = timeseries.with_columns([
            pl.sum_horizontal([pl.col(c) for c in numeric_cols]).alias('daily_updates')
        ])
        
        # Estimate population per geo_key from enrolment
        age_cols = [c for c in enrolment_df.columns if 'age' in c.lower()]
        if age_cols:
            pop_df = enrolment_df.group_by(['geo_key']).agg([
                pl.sum_horizontal([pl.col(c) for c in age_cols]).sum().alias('pop')
            ])
        else:
            pop_df = enrolment_df.group_by(['geo_key']).agg([
                pl.count().alias('pop')
            ])
        
        timeseries = timeseries.join(pop_df, on='geo_key', how='left')
        timeseries = timeseries.with_columns([
            pl.col('pop').fill_null(10000)
        ])
        
        timeseries = timeseries.with_columns([
            ((pl.col('daily_updates') / pl.col('pop')) * 1000).alias('daily_mvi')
        ])
    
    timeseries = timeseries.sort(['geo_key', 'date'])
    
    return timeseries


def run_mvi_calculation() -> Dict[str, pl.DataFrame]:
    """
    Run the complete MVI calculation pipeline.
    Saves results to processed directory.
    """
    # Calculate main MVI analytics
    mvi_df = calculate_mvi()
    mvi_df.write_parquet(PATHS["processed_dir"] / "mvi_analytics.parquet", compression="snappy")
    
    # Generate time series
    timeseries_df = generate_mvi_timeseries()
    if len(timeseries_df) > 0:
        timeseries_df.write_parquet(
            PATHS["processed_dir"] / "mvi_timeseries.parquet", 
            compression="snappy"
        )
    
    return {
        "mvi_analytics": mvi_df,
        "mvi_timeseries": timeseries_df
    }


def get_mvi_summary() -> Dict:
    """
    Get summary statistics for MVI data.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return {
            "total_regions": 0,
            "avg_mvi": 0,
            "max_mvi": 0,
            "zone_distribution": {}
        }
    
    zone_counts = mvi_df.group_by('zone_type').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    zone_distribution = {row['zone_type']: row['count'] for row in zone_counts}
    
    return {
        "total_regions": len(mvi_df),
        "avg_mvi": round(mvi_df.select(pl.col('mvi').mean()).item() or 0, 2),
        "max_mvi": round(mvi_df.select(pl.col('mvi').max()).item() or 0, 2),
        "min_mvi": round(mvi_df.select(pl.col('mvi').min()).item() or 0, 2),
        "zone_distribution": zone_distribution
    }

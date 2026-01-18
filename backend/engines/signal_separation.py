"""
Aadhaar Sanket - Signal Separation Engine
Separates meaningful migration signals from administrative noise.
"""
import polars as pl
from pathlib import Path
from typing import Dict, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, SIGNAL_WEIGHTS, AGE_THRESHOLDS
from .ingestion import load_processed_dataset


def calculate_organic_signal(df: pl.DataFrame, data_type: str) -> pl.DataFrame:
    """
    Apply signal weights to each update type.
    
    Args:
        df: DataFrame with update counts
        data_type: 'demographic' or 'biometric'
    
    Returns:
        DataFrame with 'organic_signal' column
    """
    if data_type == 'demographic':
        # Demographic updates have higher signal weight (address changes)
        adult_weight = SIGNAL_WEIGHTS["demographic_adult"]
        youth_weight = SIGNAL_WEIGHTS["demographic_youth"]
        child_weight = SIGNAL_WEIGHTS["demographic_child"]
        
        # Calculate weighted signal
        # Check which columns exist
        if 'demo_age_5_17' in df.columns and 'demo_age_17_' in df.columns:
            df = df.with_columns([
                (
                    pl.col('demo_age_5_17').cast(pl.Float64).fill_null(0) * youth_weight +
                    pl.col('demo_age_17_').cast(pl.Float64).fill_null(0) * adult_weight
                ).alias('organic_signal')
            ])
        else:
            # Fallback: use sum of all numeric columns
            numeric_cols = [c for c in df.columns if df.schema[c] in [pl.Int64, pl.Float64]]
            if numeric_cols:
                df = df.with_columns([
                    pl.sum_horizontal([pl.col(c).fill_null(0) for c in numeric_cols]).alias('raw_count')
                ])
                df = df.with_columns([
                    (pl.col('raw_count') * adult_weight).alias('organic_signal')
                ])
            else:
                df = df.with_columns([pl.lit(0.0).alias('organic_signal')])
                
    elif data_type == 'biometric':
        # Biometric updates have lower signal weight (noise from mandatory updates)
        adult_weight = SIGNAL_WEIGHTS["biometric_adult"]
        child_weight = SIGNAL_WEIGHTS["biometric_child_5"]
        
        if 'bio_age_5_17' in df.columns and 'bio_age_17_' in df.columns:
            df = df.with_columns([
                (
                    pl.col('bio_age_5_17').cast(pl.Float64).fill_null(0) * child_weight +
                    pl.col('bio_age_17_').cast(pl.Float64).fill_null(0) * adult_weight
                ).alias('organic_signal')
            ])
        else:
            numeric_cols = [c for c in df.columns if df.schema[c] in [pl.Int64, pl.Float64]]
            if numeric_cols:
                df = df.with_columns([
                    pl.sum_horizontal([pl.col(c).fill_null(0) for c in numeric_cols]).alias('raw_count')
                ])
                df = df.with_columns([
                    (pl.col('raw_count') * child_weight).alias('organic_signal')
                ])
            else:
                df = df.with_columns([pl.lit(0.0).alias('organic_signal')])
    
    return df


def aggregate_by_geo(df: pl.DataFrame) -> pl.DataFrame:
    """
    Aggregate data by state and district (geo_key).
    """
    # Create geo_key
    if 'state' in df.columns and 'district' in df.columns:
        df = df.with_columns([
            (pl.col('state') + '_' + pl.col('district')).alias('geo_key')
        ])
    
    # Get numeric columns for aggregation
    numeric_cols = [c for c in df.columns if df.schema[c] in [pl.Int64, pl.Float64]
                   and c not in ['pincode']]
    
    agg_exprs = [pl.col(c).sum().alias(c) for c in numeric_cols]
    
    if 'geo_key' in df.columns:
        aggregated = df.group_by(['state', 'district', 'geo_key']).agg(agg_exprs)
    else:
        aggregated = df.group_by(['state', 'district']).agg(agg_exprs)
        aggregated = aggregated.with_columns([
            (pl.col('state') + '_' + pl.col('district')).alias('geo_key')
        ])
    
    return aggregated


def separate_signal_from_noise(
    demographic_df: Optional[pl.DataFrame] = None,
    biometric_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Combine demographic and biometric data with appropriate weighting.
    
    Output: DataFrame with columns [geo_key, raw_updates, organic_signal, noise_ratio]
    """
    # Load data if not provided
    if demographic_df is None:
        demographic_df = load_processed_dataset('demographic_clean')
    if biometric_df is None:
        biometric_df = load_processed_dataset('biometric_clean')
    
    results = []
    
    # Process demographic data
    if demographic_df is not None and len(demographic_df) > 0:
        demo_with_signal = calculate_organic_signal(demographic_df, 'demographic')
        demo_agg = aggregate_by_geo(demo_with_signal)
        demo_agg = demo_agg.with_columns([pl.lit('demographic').alias('source')])
        results.append(demo_agg)
    
    # Process biometric data
    if biometric_df is not None and len(biometric_df) > 0:
        bio_with_signal = calculate_organic_signal(biometric_df, 'biometric')
        bio_agg = aggregate_by_geo(bio_with_signal)
        bio_agg = bio_agg.with_columns([pl.lit('biometric').alias('source')])
        results.append(bio_agg)
    
    if not results:
        return pl.DataFrame({
            'geo_key': [],
            'state': [],
            'district': [],
            'organic_signal': [],
            'raw_updates': [],
            'noise_ratio': []
        })
    
    # Combine results
    combined = pl.concat(results, how="diagonal")
    
    # Aggregate by geo_key
    final = combined.group_by(['state', 'district', 'geo_key']).agg([
        pl.col('organic_signal').sum().alias('organic_signal'),
    ])
    
    # Calculate raw updates (sum of all update columns if available)
    # For now, estimate raw from organic (reverse the weighting)
    avg_weight = (SIGNAL_WEIGHTS["demographic_adult"] + SIGNAL_WEIGHTS["biometric_adult"]) / 2
    final = final.with_columns([
        (pl.col('organic_signal') / avg_weight).alias('raw_updates')
    ])
    
    # Calculate noise ratio
    final = final.with_columns([
        (1 - (pl.col('organic_signal') / pl.col('raw_updates').replace(0, 1))).alias('noise_ratio')
    ])
    
    # Fill nulls
    final = final.fill_null(0)
    
    return final


def run_signal_separation() -> pl.DataFrame:
    """
    Run the complete signal separation pipeline.
    Saves result to processed/signal_separated.parquet.
    """
    result = separate_signal_from_noise()
    
    # Save to parquet
    output_path = PATHS["processed_dir"] / "signal_separated.parquet"
    result.write_parquet(output_path, compression="snappy")
    
    return result

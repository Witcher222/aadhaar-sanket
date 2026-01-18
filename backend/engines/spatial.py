"""
Aadhaar Sanket - Spatial Analysis Engine
Detects geographic clusters and hotspots using statistical methods.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, MVI_THRESHOLDS
from .ingestion import load_processed_dataset


def detect_hotspot_clusters(mvi_df: Optional[pl.DataFrame] = None) -> pl.DataFrame:
    """
    Identify states with multiple high-MVI districts.
    A cluster = 3+ adjacent high-pressure districts.
    
    Returns: DataFrame of cluster centers with severity.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return pl.DataFrame({
            'state': [],
            'cluster_center': [],
            'high_mvi_count': [],
            'avg_mvi': [],
            'max_mvi': [],
            'severity': []
        })
    
    # Group by state and count high-MVI districts
    state_clusters = mvi_df.filter(
        pl.col('mvi') >= MVI_THRESHOLDS["moderate"]
    ).group_by('state').agg([
        pl.count().alias('high_mvi_count'),
        pl.col('mvi').mean().alias('avg_mvi'),
        pl.col('mvi').max().alias('max_mvi'),
        pl.col('district').first().alias('cluster_center')
    ])
    
    # Classify severity
    state_clusters = state_clusters.with_columns([
        pl.when(pl.col('high_mvi_count') >= 5)
        .then(pl.lit('critical'))
        .when(pl.col('high_mvi_count') >= 3)
        .then(pl.lit('high'))
        .otherwise(pl.lit('moderate'))
        .alias('severity')
    ])
    
    # Sort by count descending
    state_clusters = state_clusters.sort('high_mvi_count', descending=True)
    
    return state_clusters


def calculate_spatial_autocorrelation(mvi_df: Optional[pl.DataFrame] = None) -> Dict:
    """
    Calculate simplified spatial clustering metric.
    Uses variance-based approach as proxy for Moran's I.
    
    Returns: {"clustering_score": float, "is_clustered": bool}
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return {"clustering_score": 0, "is_clustered": False}
    
    # Calculate state-level variance
    state_variance = mvi_df.group_by('state').agg([
        pl.col('mvi').var().alias('mvi_variance'),
        pl.col('mvi').mean().alias('mvi_mean')
    ])
    
    # High variance within states suggests clustering
    overall_variance = mvi_df.select(pl.col('mvi').var()).item() or 0
    within_state_variance = state_variance.select(
        pl.col('mvi_variance').mean()
    ).item() or 0
    
    # Clustering score: higher when between-state variance > within-state variance
    if within_state_variance > 0:
        clustering_score = (overall_variance - within_state_variance) / within_state_variance
    else:
        clustering_score = 0
    
    return {
        "clustering_score": round(float(clustering_score), 3),
        "is_clustered": clustering_score > 0.5,
        "overall_variance": round(float(overall_variance), 3),
        "within_state_variance": round(float(within_state_variance), 3)
    }


def get_zone_distribution(mvi_df: Optional[pl.DataFrame] = None) -> Dict:
    """
    Get distribution of zones across all regions.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return {
            "stable": 0,
            "moderate_inflow": 0,
            "elevated_inflow": 0,
            "high_inflow": 0,
            "total": 0
        }
    
    zone_counts = mvi_df.group_by('zone_type').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    result = {
        "stable": 0,
        "moderate_inflow": 0,
        "elevated_inflow": 0,
        "high_inflow": 0,
    }
    
    for row in zone_counts:
        if row['zone_type'] in result:
            result[row['zone_type']] = row['count']
    
    result['total'] = sum(result.values())
    
    return result


def get_state_comparison(mvi_df: Optional[pl.DataFrame] = None) -> List[Dict]:
    """
    Get state-level comparison data.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return []
    
    state_stats = mvi_df.group_by('state').agg([
        pl.col('mvi').mean().alias('avg_mvi'),
        pl.col('mvi').max().alias('max_mvi'),
        pl.col('mvi').min().alias('min_mvi'),
        pl.count().alias('district_count'),
        pl.col('population_base').sum().alias('total_population'),
        pl.col('organic_signal').sum().alias('total_signal')
    ]).sort('avg_mvi', descending=True)
    
    return state_stats.to_dicts()


def get_heatmap_data(mvi_df: Optional[pl.DataFrame] = None) -> List[Dict]:
    """
    Get data formatted for heatmap visualization.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return []
    
    # Select relevant columns for heatmap
    heatmap_data = mvi_df.select([
        'state', 'district', 'geo_key', 'mvi', 'zone_type', 'population_base'
    ]).to_dicts()
    
    return heatmap_data


def run_spatial_analysis() -> Dict[str, pl.DataFrame]:
    """
    Run the complete spatial analysis pipeline.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    # Detect clusters
    clusters_df = detect_hotspot_clusters(mvi_df)
    clusters_df.write_parquet(
        PATHS["processed_dir"] / "spatial_clusters.parquet",
        compression="snappy"
    )
    
    # Calculate autocorrelation
    autocorr = calculate_spatial_autocorrelation(mvi_df)
    
    # Get zone distribution
    zone_dist = get_zone_distribution(mvi_df)
    
    return {
        "clusters": clusters_df,
        "autocorrelation": autocorr,
        "zone_distribution": zone_dist
    }

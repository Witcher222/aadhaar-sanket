"""
Aadhaar Sanket - Policy Mapper Engine
Maps analytics to policy recommendations.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, POLICY_MAPPINGS, TREND_TYPES
from .ingestion import load_processed_dataset


def get_policy_for_zone(zone_type: str, trend_type: str) -> Dict:
    """
    Get policy recommendation based on zone and trend type.
    """
    # Check for high inflow first (overrides trend)
    if zone_type == "high_inflow":
        return POLICY_MAPPINGS.get("high_inflow", {})
    
    # Then check trend type
    if trend_type in POLICY_MAPPINGS:
        return POLICY_MAPPINGS[trend_type]
    
    # Default based on zone
    zone_policies = {
        "stable": POLICY_MAPPINGS.get("stable", {}),
        "moderate_inflow": POLICY_MAPPINGS.get("emerging_inflow", {}),
        "elevated_inflow": POLICY_MAPPINGS.get("persistent_inflow", {}),
    }
    
    return zone_policies.get(zone_type, POLICY_MAPPINGS.get("stable", {}))


def generate_policy_recommendations(
    typology_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Map each district's trend_type + zone_type to policy actions.
    """
    if typology_df is None:
        typology_df = load_processed_dataset('typology_analytics')
    
    if typology_df is None or len(typology_df) == 0:
        return pl.DataFrame({
            'geo_key': [],
            'state': [],
            'district': [],
            'priority': [],
            'action_type': [],
            'primary_action': [],
            'reasoning': []
        })
    
    # Ensure required columns exist
    if 'zone_type' not in typology_df.columns:
        typology_df = typology_df.with_columns([pl.lit('stable').alias('zone_type')])
    if 'trend_type' not in typology_df.columns:
        typology_df = typology_df.with_columns([pl.lit('stable').alias('trend_type')])
    
    # Generate recommendations
    recommendations = []
    
    for row in typology_df.to_dicts():
        geo_key = row.get('geo_key', '')
        state = row.get('state', '')
        district = row.get('district', '')
        zone_type = row.get('zone_type', 'stable')
        trend_type = row.get('trend_type', 'stable')
        mvi = row.get('mvi', 0)
        
        # Get policy
        policy = get_policy_for_zone(zone_type, trend_type)
        
        recommendations.append({
            'geo_key': geo_key,
            'state': state,
            'district': district,
            'mvi': mvi,
            'zone_type': zone_type,
            'trend_type': trend_type,
            'priority': policy.get('priority', 'LOW'),
            'action_type': policy.get('action_type', 'maintenance'),
            'primary_action': policy.get('primary_action', 'Continue Standard Operations'),
            'reasoning': policy.get('reasoning', 'No specific action required')
        })
    
    return pl.DataFrame(recommendations)


def prioritize_actions(
    policy_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Sort recommendations by priority (CRITICAL > HIGH > MEDIUM > LOW).
    """
    if policy_df is None:
        policy_df = load_processed_dataset('policy_recommendations')
    
    if policy_df is None or len(policy_df) == 0:
        return pl.DataFrame()
    
    # Define priority order
    priority_map = {
        'CRITICAL': 1,
        'HIGH': 2,
        'MEDIUM': 3,
        'LOW': 4
    }
    
    # Add sort key
    policy_df = policy_df.with_columns([
        pl.col('priority').replace(priority_map, default=5).alias('priority_order')
    ])
    
    # Sort
    sorted_df = policy_df.sort(['priority_order', 'mvi'], descending=[False, True])
    
    # Drop sort key
    sorted_df = sorted_df.drop('priority_order')
    
    return sorted_df


def get_policy_summary() -> Dict:
    """
    Get summary of policy recommendations.
    """
    policy_df = load_processed_dataset('policy_recommendations')
    
    if policy_df is None or len(policy_df) == 0:
        return {
            "total_recommendations": 0,
            "by_priority": {},
            "by_action_type": {}
        }
    
    # Count by priority
    priority_counts = policy_df.group_by('priority').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    by_priority = {row['priority']: row['count'] for row in priority_counts}
    
    # Count by action type
    action_counts = policy_df.group_by('action_type').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    by_action_type = {row['action_type']: row['count'] for row in action_counts}
    
    return {
        "total_recommendations": len(policy_df),
        "by_priority": by_priority,
        "by_action_type": by_action_type
    }


def get_top_recommendations(limit: int = 10) -> List[Dict]:
    """
    Get top priority recommendations.
    """
    policy_df = prioritize_actions()
    
    if len(policy_df) == 0:
        return []
    
    return policy_df.head(limit).to_dicts()


def run_policy_mapping() -> pl.DataFrame:
    """
    Run the complete policy mapping pipeline.
    """
    # Generate recommendations
    policy_df = generate_policy_recommendations()
    
    if len(policy_df) > 0:
        # Prioritize and save
        policy_df = prioritize_actions(policy_df)
        policy_df.write_parquet(
            PATHS["processed_dir"] / "policy_recommendations.parquet",
            compression="snappy"
        )
    
    return policy_df

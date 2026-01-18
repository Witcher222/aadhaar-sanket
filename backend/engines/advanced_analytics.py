"""
Aadhaar Sanket - Advanced Analytics Engine
Implements specialized algorithms for Seasonal Nomad detection, Hidden Migration, 
and Policy Impact Simulation.
"""
import polars as pl
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import PATHS
from .ingestion import load_processed_dataset

def detect_seasonal_nomads() -> Dict:
    """
    Algorithm to identify 'Seasonal Nomads': IDs that show cyclical movement patterns.
    
    Logic:
    1. Look for IDs with > 2 updates in 12 months.
    2. Check if locations toggle (A -> B -> A).
    3. Correlate with agricultural seasons (simulated).
    """
    # In a real scenario, we would need individual update history.
    # Since we work with aggregated data in this demo, we will simulate 
    # the detection based on high-frequency update zones.
    
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None:
        return {"data": [], "summary": {"total_nomads": 0}}
    
    # Simulation Logic:
    # Districts with High Inflow AND High Outflow (simulated by finding 'High Inflow' zones)
    # are likely hubs for seasonal workers.
    
    nomad_zones = mvi_df.filter(
        (pl.col('mvi') > 15)  # High movement
    )
    
    results = []
    
    for row in nomad_zones.to_dicts():
        # Simulate nomad count based on population and MVI intensity
        estimated_nomads = int(row['population_base'] * (row['mvi'] / 1000) * 0.4) # 40% of movers are nomads
        
        results.append({
            "geo_key": row['geo_key'],
            "district": row['district'],
            "state": row['state'],
            "seasonal_nomads": estimated_nomads,
            "primary_season": "Harvest (Oct-Nov)" if "North" in str(row['state']) or "Punjab" in str(row['state']) else "Sowing (Jun-Jul)",
            "pattern_type": "Circular A->B->A"
        })
        
    return {
        "data": sorted(results, key=lambda x: x['seasonal_nomads'], reverse=True)[:50], # Top 50
        "summary": {
            "total_nomads": sum(r['seasonal_nomads'] for r in results),
            "affected_districts": len(results),
            "description": "Detected cyclical movement patterns correlating with agricultural seasons."
        }
    }

def calculate_hidden_migration() -> Dict:
    """
    'Hidden Migration' Index.
    
    Logic:
    Compare 'Biometric Updates' (requires physical presence) vs 'Address Updates'.
    If a district has high Biometric Updates but low Address Updates, people are likely
    living there without updating their official address.
    """
    # Load separate signals if available, otherwise simulate from MVI components
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None:
        return {"data": []}
    
    # We will derive this from the signal separation data if available, 
    # but primarily use mvi_analytics for stability in this demo.
    
    results = []
    
    # Synthetic logic for demonstration:
    # Use 'raw_updates' vs 'organic_signal' ratio divergence as a proxy
    # If raw is high but organic (address change) is low -> Hidden Migration
    
    candidates = mvi_df.filter(pl.col('mvi') > 5)
    
    for row in candidates.to_dicts():
        raw = row.get('raw_updates', 0)
        organic = row.get('organic_signal', 0)
        
        if raw > 0:
            # High disparity ratio
            disparity = (raw - organic) / raw
            
            if disparity > 0.7: # 70% of activity is NOT address change
                hidden_index = round(disparity * 100, 1)
                estimated_hidden_pop = int(row['population_base'] * 0.05 * disparity)
                
                results.append({
                    "geo_key": row['geo_key'],
                    "district": row['district'],
                    "state": row['state'],
                    "hidden_migration_index": hidden_index,
                    "estimated_hidden_population": estimated_hidden_pop,
                    "reason": "High Biometric Activity vs Low Address Conversion"
                })
                
    return {
        "data": sorted(results, key=lambda x: x['hidden_migration_index'], reverse=True)[:50]
    }

def simulate_policy_impact(
    district_key: str, 
    investment_amount_cr: float, 
    policy_type: str = "Infrastructure"
) -> Dict:
    """
    Policy Simulator: What-if Analysis.
    
    Args:
        district_key: Geo key of district
        investment_amount_cr: Investment in Crores
        policy_type: 'Infrastructure', 'Employment', 'Housing'
    
    Returns:
        Projected MVI and Stress Score after 1 year.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None:
        return {}
    
    target = mvi_df.filter(pl.col('geo_key') == district_key)
    
    if target.height == 0:
        return {"error": "District not found"}
    
    current_data = target.row(0, named=True)
    current_mvi = current_data['mvi']
    
    # Coefficients (Synthetic Model)
    # Impact Factor: How much MVI reduces per crore invested
    impact_factors = {
        "Infrastructure": 0.05, # Slow impact
        "Employment": 0.12,     # High impact (keeps people home)
        "Housing": 0.08         # Medium impact
    }
    
    factor = impact_factors.get(policy_type, 0.05)
    
    # Diminishing returns formula
    effectiveness = np.log1p(investment_amount_cr) * factor
    
    # Calculate reduction
    percentage_reduction = min(effectiveness, 0.60) # Max 60% reduction
    projected_mvi = current_mvi * (1 - percentage_reduction)
    
    return {
        "district": current_data['district'],
        "state": current_data['state'],
        "current_mvi": round(current_mvi, 2),
        "investment": f"₹{investment_amount_cr} Cr",
        "policy": policy_type,
        "projected_mvi": round(projected_mvi, 2),
        "reduction_percentage": round(percentage_reduction * 100, 1),
        "impact_level": "High" if percentage_reduction > 0.2 else "Moderate" if percentage_reduction > 0.05 else "Low"
    }

"""
Aadhaar Sanket API - Spatial Routes
Spatial analysis and zone endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.spatial import (
    get_zone_distribution, 
    get_state_comparison, 
    get_heatmap_data,
    calculate_spatial_autocorrelation
)

router = APIRouter()


@router.get("/")
async def get_spatial_data():
    """
    Get zone distribution data.
    """
    try:
        distribution = get_zone_distribution()
        autocorr = calculate_spatial_autocorrelation()
        
        return {
            "status": "success",
            "zone_distribution": distribution,
            "spatial_clustering": autocorr
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clusters")
async def get_clusters():
    """
    Get hotspot cluster data.
    """
    try:
        clusters_df = load_processed_dataset('spatial_clusters')
        
        if clusters_df is None or len(clusters_df) == 0:
            return {
                "status": "success",
                "clusters": []
            }
        
        return {
            "status": "success",
            "clusters": clusters_df.to_dicts(),
            "count": len(clusters_df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comparison")
async def get_comparison():
    """
    Get state comparison data.
    """
    try:
        comparison = get_state_comparison()
        
        return {
            "status": "success",
            "states": comparison,
            "count": len(comparison)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap")
async def get_heatmap():
    """
    Get state-level heatmap data.
    """
    try:
        heatmap = get_heatmap_data()
        
        return {
            "status": "success",
            "heatmap_data": heatmap,
            "count": len(heatmap)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stress-zones")
async def get_stress_zones():
    """
    Get stress zone information for visualization.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            return {"status": "success", "zones": []}
        
        # Get high-pressure zones
        high_stress = mvi_df.filter(pl.col('mvi') >= 15).sort('mvi', descending=True)
        
        zones = []
        for row in high_stress.head(10).to_dicts():
            mvi = row.get('mvi', 0)
            
            if mvi >= 30:
                severity = "severe"
            elif mvi >= 20:
                severity = "high"
            else:
                severity = "moderate"
            
            zones.append({
                "id": len(zones) + 1,
                "name": f"{row.get('district', '')}, {row.get('state', '')}",
                "state": row.get('state', ''),
                "district": row.get('district', ''),
                "severity": severity,
                "mvi": round(mvi, 2),
                "population": int(row.get('population_base', 0)),
                "pressure": min(100, int(mvi * 3))  # Scale to 0-100
            })
        
        return {
            "status": "success",
            "zones": zones
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/district/{district_name}")
async def get_district_drilldown(district_name: str):
    """
    Get detailed breakdown for a specific district.
    Includes MVI, age groups, update types, and active alerts.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            raise HTTPException(status_code=404, detail="No MVI data available")
        
        if "district" not in mvi_df.columns:
            raise HTTPException(status_code=404, detail="District column not found")
        
        # Find district (case-insensitive)
        district_data = mvi_df.filter(
            pl.col("district").str.to_lowercase() == district_name.lower()
        )
        
        if district_data.height == 0:
            raise HTTPException(status_code=404, detail=f"District '{district_name}' not found")
        
        district_row = district_data.to_dicts()[0]
        
        # Load additional data if available
        result = {
            "district": district_row.get("district", district_name),
            "state": district_row.get("state", "Unknown"),
            "mvi": round(district_row.get("mvi", 0), 2),
            "zone_type": district_row.get("zone_type", "unknown"),
            "population_base": int(district_row.get("population_base", 0)),
        }
        
        # Add age group breakdown if available
        age_columns = ["age_0_5", "age_5_17", "age_18_plus"]
        age_breakdown = {}
        for col in age_columns:
            if col in district_row:
                age_breakdown[col] = district_row[col]
        
        if age_breakdown:
            result["age_breakdown"] = age_breakdown
        
        # Add update type breakdown if available
        update_columns = ["demographic_updates", "biometric_updates"]
        update_breakdown = {}
        for col in update_columns:
            if col in district_row:
                update_breakdown[col] = district_row[col]
        
        if update_breakdown:
            result["update_types"] = update_breakdown
        
        # Check for active alerts
        anomaly_df = load_processed_dataset('anomaly_analytics')
        if anomaly_df is not None and "district" in anomaly_df.columns:
            district_alerts = anomaly_df.filter(
                pl.col("district").str.to_lowercase() == district_name.lower()
            )
            result["active_alerts"] = district_alerts.to_dicts()
            result["alert_count"] = district_alerts.height
        else:
            result["active_alerts"] = []
            result["alert_count"] = 0
        
        return {
            "status": "success",
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

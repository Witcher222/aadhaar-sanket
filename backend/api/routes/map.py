"""
Aadhaar Sanket API - Map Routes
Map visualization endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.spatial import get_heatmap_data

router = APIRouter()


@router.get("/data")
async def get_map_data():
    """
    Get data for choropleth map visualization.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            return {
                "status": "success",
                "data": [],
                "legend": {}
            }
        
        # Prepare map data
        map_data = []
        for row in mvi_df.to_dicts():
            map_data.append({
                "state": row.get('state', ''),
                "district": row.get('district', ''),
                "geo_key": row.get('geo_key', ''),
                "mvi": round(row.get('mvi', 0), 2),
                "zone_type": row.get('zone_type', 'stable'),
                "population": int(row.get('population_base', 0)),
                "color": _get_zone_color(row.get('zone_type', 'stable'))
            })
        
        legend = {
            "stable": {"color": "#10B981", "label": "Stable (MVI < 5)"},
            "moderate_inflow": {"color": "#F59E0B", "label": "Moderate (5-15)"},
            "elevated_inflow": {"color": "#F97316", "label": "Elevated (15-30)"},
            "high_inflow": {"color": "#EF4444", "label": "High (30+)"}
        }
        
        return {
            "status": "success",
            "data": map_data,
            "legend": legend,
            "count": len(map_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state/{state}")
async def get_state_map_data(state: str):
    """
    Get map data for a specific state.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            raise HTTPException(status_code=404, detail="No data available")
        
        state_data = mvi_df.filter(pl.col('state') == state)
        
        if len(state_data) == 0:
            raise HTTPException(status_code=404, detail=f"State {state} not found")
        
        districts = []
        for row in state_data.to_dicts():
            districts.append({
                "district": row.get('district', ''),
                "geo_key": row.get('geo_key', ''),
                "mvi": round(row.get('mvi', 0), 2),
                "zone_type": row.get('zone_type', 'stable'),
                "population": int(row.get('population_base', 0)),
                "color": _get_zone_color(row.get('zone_type', 'stable'))
            })
        
        return {
            "status": "success",
            "state": state,
            "districts": districts,
            "count": len(districts)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geojson")
async def get_geojson():
    """
    Get India district GeoJSON.
    Note: Returns a placeholder. In production, serve actual GeoJSON file.
    """
    return {
        "status": "success",
        "message": "GeoJSON endpoint - Use frontend-bundled GeoJSON for now",
        "note": "Add actual India districts GeoJSON to serve geographic boundaries"
    }


@router.get("/stress-monitor")
async def get_stress_monitor():
    """
    Get stress monitor data for real-time visualization.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            return {"status": "success", "hotspots": [], "stats": {}}
        
        # Get top stressed regions
        stressed = mvi_df.filter(pl.col('mvi') >= 15).sort('mvi', descending=True)
        
        hotspots = []
        for i, row in enumerate(stressed.head(15).to_dicts()):
            mvi = row.get('mvi', 0)
            
            # Assign coordinates (synthetic for demo)
            # In production, use actual lat/lon from district centroids
            coords = _get_state_coords(row.get('state', ''))
            
            hotspots.append({
                "id": i + 1,
                "name": row.get('district', ''),
                "state": row.get('state', ''),
                "lat": coords[0] + (i % 5) * 0.5,
                "lon": coords[1] + (i // 5) * 0.5,
                "mvi": round(mvi, 2),
                "intensity": min(1.0, mvi / 50),
                "severity": _get_severity(mvi),
                "population": int(row.get('population_base', 0))
            })
        
        # Calculate stats
        total_mvi = mvi_df.select(pl.col('mvi').mean()).item() or 0
        max_mvi = mvi_df.select(pl.col('mvi').max()).item() or 0
        critical_count = mvi_df.filter(pl.col('mvi') >= 30).height
        
        return {
            "status": "success",
            "hotspots": hotspots,
            "stats": {
                "avg_mvi": round(total_mvi, 2),
                "max_mvi": round(max_mvi, 2),
                "critical_zones": critical_count,
                "total_zones": len(mvi_df)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _get_zone_color(zone_type: str) -> str:
    """Get color for zone type."""
    colors = {
        "stable": "#10B981",
        "moderate_inflow": "#F59E0B",
        "elevated_inflow": "#F97316",
        "high_inflow": "#EF4444"
    }
    return colors.get(zone_type, "#6B7280")


def _get_severity(mvi: float) -> str:
    """Get severity level from MVI."""
    if mvi >= 30:
        return "critical"
    elif mvi >= 20:
        return "high"
    elif mvi >= 15:
        return "moderate"
    else:
        return "low"


def _get_state_coords(state: str) -> tuple:
    """Get approximate coordinates for state (demo purposes)."""
    # Simplified state coordinates (centroids)
    coords = {
        "Maharashtra": (19.7515, 75.7139),
        "Karnataka": (15.3173, 75.7139),
        "Tamil Nadu": (11.1271, 78.6569),
        "Gujarat": (22.2587, 71.1924),
        "Rajasthan": (27.0238, 74.2179),
        "Uttar Pradesh": (26.8467, 80.9462),
        "Bihar": (25.0961, 85.3131),
        "West Bengal": (22.9868, 87.8550),
        "Madhya Pradesh": (22.9734, 78.6569),
        "Delhi": (28.7041, 77.1025),
        "Andhra Pradesh": (15.9129, 79.7400),
        "Telangana": (18.1124, 79.0193),
        "Kerala": (10.8505, 76.2711),
        "Punjab": (31.1471, 75.3412),
        "Haryana": (29.0588, 76.0856),
    }
    return coords.get(state, (20.5937, 78.9629))  # Default to India center

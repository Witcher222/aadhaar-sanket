"""
Aadhaar Sanket API - Migration Routes
Robust endpoints for MVI analytics and migration flow data.
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

import polars as pl

from engines.ingestion import load_processed_dataset
from engines.mvi import get_mvi_summary
from schemas.base import APIResponse
from schemas.migration import MigrationFlow, MVIDataPoint, FilterOptions, RegionDetails

router = APIRouter()

@router.get("/", response_model=APIResponse[List[MVIDataPoint]])
async def get_migration_data(
    state: Optional[str] = None,
    zone_type: Optional[str] = None,
    min_mvi: Optional[float] = None,
    max_mvi: Optional[float] = None,
    limit: int = Query(default=100, le=1000)
):
    """
    Get all MVI data points with optional filtering.
    
    Args:
        state: Filter by state name.
        zone_type: Filter by zone classification.
        min_mvi: Minimum Migration Velocity Index.
        max_mvi: Maximum Migration Velocity Index.
        limit: Max records to return.
        
    Returns:
        List of MVI data points.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return APIResponse(status="success", data=[], message="No data available")
    
    # Apply filters using efficient Polars operations
    if state:
        mvi_df = mvi_df.filter(pl.col('state') == state)
    if zone_type:
        mvi_df = mvi_df.filter(pl.col('zone_type') == zone_type)
    if min_mvi is not None:
        mvi_df = mvi_df.filter(pl.col('mvi') >= min_mvi)
    if max_mvi is not None:
        mvi_df = mvi_df.filter(pl.col('mvi') <= max_mvi)
    
    # Sort and Limit
    result_df = mvi_df.sort('mvi', descending=True).head(limit)
    
    # Convert to Pydantic models (validation happens here)
    data = [MVIDataPoint(**row) for row in result_df.to_dicts()]
    
    return APIResponse(status="success", data=data, message=f"Retrieved {len(data)} records")


@router.get("/states", response_model=APIResponse[List[str]])
async def get_states():
    """Get list of available states in the dataset."""
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return APIResponse(status="success", data=[])
    
    states = mvi_df.select('state').unique().sort('state').to_series().to_list()
    return APIResponse(status="success", data=states)


@router.get("/districts", response_model=APIResponse[List[dict]])
async def get_districts(state: Optional[str] = None):
    """Get hierarchy of districts, optionally filtered by state."""
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return APIResponse(status="success", data=[])
    
    if state:
        mvi_df = mvi_df.filter(pl.col('state') == state)
    
    districts = mvi_df.select(['state', 'district']).unique().sort(['state', 'district']).to_dicts()
    return APIResponse(status="success", data=districts)


@router.get("/filters", response_model=APIResponse[FilterOptions])
async def get_filter_options():
    """Get dynamic filter options based on available data."""
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return APIResponse(
            status="success",
            data=FilterOptions(states=[], zone_types=[], mvi_range={"min": 0, "max": 0})
        )
    
    states = mvi_df.select('state').unique().sort('state').to_series().to_list()
    zone_types = mvi_df.select('zone_type').unique().to_series().to_list()
    min_mvi = mvi_df.select(pl.col('mvi').min()).item() or 0
    max_mvi = mvi_df.select(pl.col('mvi').max()).item() or 0
    
    return APIResponse(
        status="success",
        data=FilterOptions(
            states=states,
            zone_types=zone_types,
            mvi_range={"min": round(min_mvi, 2), "max": round(max_mvi, 2)}
        )
    )


@router.get("/summary", response_model=APIResponse[dict])
async def get_migration_summary():
    """Get high-level migration statistics."""
    summary = get_mvi_summary()
    return APIResponse(status="success", data=summary)


@router.get("/region/{geo_key}", response_model=APIResponse[RegionDetails])
async def get_region_details(geo_key: str):
    """Get comprehensive details for a specific region by Geo Key."""
    mvi_df = load_processed_dataset('mvi_analytics')
    typology_df = load_processed_dataset('typology_analytics')
    insights_df = load_processed_dataset('decision_insights')
    
    result = RegionDetails(geo_key=geo_key)
    found = False
    
    if mvi_df is not None:
        region = mvi_df.filter(pl.col('geo_key') == geo_key)
        if len(region) > 0:
            # Handle NaN values for JSON safety
            data = region.to_dicts()[0]
            # Simple sanitization if needed, Pydantic will handle types
            result.mvi_data = data
            found = True
    
    if typology_df is not None:
        region = typology_df.filter(pl.col('geo_key') == geo_key)
        if len(region) > 0:
            result.typology = region.to_dicts()[0]
            found = True
            
    if insights_df is not None:
        region = insights_df.filter(pl.col('geo_key') == geo_key)
        if len(region) > 0:
            result.insight = region.to_dicts()[0]
            found = True
            
    if not found:
        raise HTTPException(status_code=404, detail=f"Region {geo_key} not found")
        
    return APIResponse(status="success", data=result)


@router.get("/flows", response_model=APIResponse[List[MigrationFlow]])
async def get_migration_flows():
    """
    Get top migration flows (Source -> Destination).
    Currently implemented with synthetic logic based on MVI differentials.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return APIResponse(status="success", data=[])
    
    # Logic: High MVI = Destination (Pull), Low MVI = Source (Push)
    high_mvi = mvi_df.filter(pl.col('mvi') >= 15).sort('mvi', descending=True).head(10)
    low_mvi = mvi_df.filter(pl.col('mvi') < 10).sort('mvi').head(10)
    
    flows = []
    # Cartesian product of top pull vs push for demo purposes
    # In production, this would use actual 'Address Change' transaction pairs
    for dest in high_mvi.to_dicts():
        for source in low_mvi.to_dicts()[:3]:
            flows.append(MigrationFlow(
                source=source.get('state', 'Unknown'),
                target=dest.get('state', 'Unknown'),
                value=int(dest.get('organic_signal', 0) / 10),
                source_district=source.get('district', ''),
                target_district=dest.get('district', '')
            ))
            
    return APIResponse(status="success", data=flows[:20])


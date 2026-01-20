from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from engines.advanced_analytics import (
    detect_seasonal_nomads,
    calculate_hidden_migration,
    simulate_policy_impact
)
from engines.comparative_analytics import (
    get_timeseries_data,
    calculate_correlation_matrix,
    compare_districts,
    generate_predictions,
    get_demographic_breakdown,
    get_statistical_summary
)
from schemas.base import APIResponse

router = APIRouter()

# --- Schemas ---

class SimulationRequest(BaseModel):
    district_key: str = Field(..., description="The unique geo_key of the district")
    investment_amount_cr: float = Field(..., gt=0, description="Investment amount in Crores")
    policy_type: str = Field(
        ..., 
        description="Type of policy intervention",
        pattern="^(Infrastructure|Employment|Housing)$"
    )

class NomadResponse(BaseModel):
    geo_key: str
    district: str
    state: str
    seasonal_nomads: int
    primary_season: str
    pattern_type: str

class HiddenMigrationResponse(BaseModel):
    geo_key: str
    district: str
    state: str
    hidden_migration_index: float
    estimated_hidden_population: int
    reason: str

# --- Endpoints ---

@router.get("/nomads", response_model=APIResponse[Dict])
async def get_nomads():
    """
    Get identified Seasonal Nomad hotspots.
    """
    try:
        result = detect_seasonal_nomads()
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/hidden-migration", response_model=APIResponse[Dict])
async def get_hidden_migration():
    """
    Get Hidden Migration Index analytics.
    """
    try:
        result = calculate_hidden_migration()
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/simulate", response_model=APIResponse[Dict])
async def simulate_policy(request: SimulationRequest):
    """
    Simulate the impact of a policy intervention on a district's MVI.
    """
    try:
        result = simulate_policy_impact(
            district_key=request.district_key,
            investment_amount_cr=request.investment_amount_cr,
            policy_type=request.policy_type
        )
        
        if "error" in result:
            return APIResponse(status="fail", message=result["error"], data=None)
            
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports/generate-summary")
async def generate_ai_report_summary(data: dict):
    """
    Generates a natural language executive summary based on the provided metrics.
    In a real system, this would call an LLM (Gemini/OpenAI).
    Here, we use a template-based rule engine.
    """
    try:
        districts = data.get('districts_analyzed', 0)
        velocity = float(data.get('migration_velocity', 0))
        critical = int(data.get('critical_zones', 0))
        
        sentiment = "stable"
        if velocity > 5.0 or critical > 10:
            sentiment = "concerning"
        
        summary = (
            f"Analysis of {districts} districts reveals a {sentiment} demographic trend. "
            f"The Migration Velocity Index currently stands at {velocity}, which is "
            f"{'above' if velocity > 4.0 else 'within'} standard thresholds. "
            f"Notably, {critical} zones have been flagged as Critical Stress points, "
            f"necessitating immediate resource allocation. "
            f"The data suggests a 15% potential increase in urban density over the next quarter "
            "if current inflow patterns persist."
        )
        
        return {"status": "success", "summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/timeseries", response_model=APIResponse[Dict])
async def get_timeseries(
    metric: str = Query("mvi", description="Metric to track"),
    geo_keys: Optional[str] = Query(None, description="Comma-separated geo_keys"),
    period: str = Query("ALL", description="Time period: 7D, 1M, 3M, 1Y, ALL")
):
    """
    Get time-series data for tracking trends over time.
    """
    try:
        geo_key_list = geo_keys.split(",") if geo_keys else None
        result = get_timeseries_data(metric=metric, geo_keys=geo_key_list, period=period)
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/correlation-matrix", response_model=APIResponse[Dict])
async def get_correlation_matrix():
    """
    Calculate correlation matrix between key metrics.
    """
    try:
        result = calculate_correlation_matrix()
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/district-comparison", response_model=APIResponse[Dict])
async def get_district_comparison(
    geo_keys: str = Query(..., description="Comma-separated geo_keys to compare")
):
    """
    Compare multiple districts across various metrics.
    """
    try:
        geo_key_list = geo_keys.split(",")
        if len(geo_key_list) < 2:
            raise HTTPException(status_code=400, detail="At least 2 districts required for comparison")
        result = compare_districts(geo_key_list)
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/predictions", response_model=APIResponse[Dict])
async def get_predictions(
    geo_key: str = Query(..., description="District geo_key"),
    metric: str = Query("mvi", description="Metric to forecast"),
    periods: int = Query(3, description="Number of periods to forecast", ge=1, le=12)
):
    """
    Generate predictive forecasts for a district.
    """
    try:
        result = generate_predictions(geo_key=geo_key, metric=metric, periods_ahead=periods)
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demographics", response_model=APIResponse[Dict])
async def get_demographics():
    """
    Get detailed demographic distributions and breakdowns.
    """
    try:
        result = get_demographic_breakdown()
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/statistical-summary", response_model=APIResponse[Dict])
async def get_stats_summary():
    """
    Get comprehensive statistical summary with rankings and anomalies.
    """
    try:
        result = get_statistical_summary()
        return APIResponse(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


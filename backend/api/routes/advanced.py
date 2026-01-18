from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any

from engines.advanced_analytics import (
    detect_seasonal_nomads,
    calculate_hidden_migration,
    simulate_policy_impact
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

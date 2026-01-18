from typing import List, Optional
from pydantic import BaseModel, Field

class MigrationFlow(BaseModel):
    source: str
    target: str
    value: int
    source_district: Optional[str] = ""
    target_district: Optional[str] = ""
    growth: Optional[str] = None

class MVIDataPoint(BaseModel):
    state: str
    district: Optional[str] = None
    mvi: float
    rank: Optional[int] = None
    geo_key: Optional[str] = None
    zone_type: Optional[str] = None

class FilterOptions(BaseModel):
    states: List[str]
    zone_types: List[str]
    mvi_range: dict

class RegionDetails(BaseModel):
    geo_key: str
    mvi_data: Optional[dict] = None
    typology: Optional[dict] = None
    insight: Optional[dict] = None

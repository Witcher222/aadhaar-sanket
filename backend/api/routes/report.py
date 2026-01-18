"""
Aadhaar Sanket API - Report Routes
Consolidated report endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.mvi import get_mvi_summary
from engines.spatial import get_zone_distribution
from engines.anomaly import get_alert_summary
from engines.policy_mapper import get_policy_summary, get_top_recommendations
from engines.insight_generator import get_executive_summary
from engines.metadata_tracker import MetadataTracker

router = APIRouter()


@router.get("/")
async def get_consolidated_report():
    """
    Get consolidated report data.
    """
    try:
        # Gather all report sections
        mvi_summary = get_mvi_summary()
        zones = get_zone_distribution()
        alerts = get_alert_summary()
        policy_summary = get_policy_summary()
        exec_summary = get_executive_summary()
        metadata = MetadataTracker.load()
        
        # Load data counts
        enrolment_df = load_processed_dataset('enrolment_clean')
        demographic_df = load_processed_dataset('demographic_clean')
        biometric_df = load_processed_dataset('biometric_clean')
        
        data_counts = {
            "enrolment_records": len(enrolment_df) if enrolment_df is not None else 0,
            "demographic_records": len(demographic_df) if demographic_df is not None else 0,
            "biometric_records": len(biometric_df) if biometric_df is not None else 0
        }
        
        report = {
            "generated_at": datetime.now().isoformat(),
            "pipeline_status": metadata.get("status", "unknown"),
            "last_run": metadata.get("run_timestamp"),
            
            "executive_summary": exec_summary,
            
            "data_overview": {
                "total_regions": mvi_summary.get("total_regions", 0),
                "data_counts": data_counts
            },
            
            "migration_analysis": {
                "mvi_summary": mvi_summary,
                "zone_distribution": zones
            },
            
            "risk_assessment": {
                "alert_summary": {
                    "total": alerts.get("total_alerts", 0),
                    "critical": alerts.get("critical", 0),
                    "high": alerts.get("high", 0)
                },
                "high_risk_zones": zones.get("high_inflow", 0) + zones.get("elevated_inflow", 0)
            },
            
            "policy_recommendations": {
                "summary": policy_summary,
                "top_priorities": get_top_recommendations(5)
            }
        }
        
        return {
            "status": "success",
            "report": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/executive")
async def get_executive_report():
    """
    Get executive summary report.
    """
    try:
        exec_summary = get_executive_summary()
        
        return {
            "status": "success",
            "report": exec_summary,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regions")
async def get_regions_report():
    """
    Get detailed report for all regions.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        typology_df = load_processed_dataset('typology_analytics')
        policy_df = load_processed_dataset('policy_recommendations')
        
        if mvi_df is None or len(mvi_df) == 0:
            return {"status": "success", "regions": []}
        
        # Merge data
        regions = mvi_df.to_dicts()
        
        # Add typology info
        if typology_df is not None:
            typology_map = {
                row['geo_key']: row 
                for row in typology_df.select(['geo_key', 'trend_type', 'slope', 'acceleration']).to_dicts()
            }
            for region in regions:
                geo_key = region.get('geo_key', '')
                if geo_key in typology_map:
                    region['trend_type'] = typology_map[geo_key].get('trend_type')
                    region['slope'] = typology_map[geo_key].get('slope')
        
        # Add policy info
        if policy_df is not None:
            policy_map = {
                row['geo_key']: row 
                for row in policy_df.select(['geo_key', 'priority', 'primary_action']).to_dicts()
            }
            for region in regions:
                geo_key = region.get('geo_key', '')
                if geo_key in policy_map:
                    region['policy_priority'] = policy_map[geo_key].get('priority')
                    region['recommended_action'] = policy_map[geo_key].get('primary_action')
        
        return {
            "status": "success",
            "regions": regions,
            "count": len(regions),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export/csv")
async def export_report_csv():
    """
    Export report as CSV.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            raise HTTPException(status_code=404, detail="No data to export")
        
        # Convert to CSV
        csv_buffer = io.StringIO()
        mvi_df.write_csv(csv_buffer)
        csv_content = csv_buffer.getvalue()
        
        return StreamingResponse(
            io.BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aadhaar_sanket_report_{datetime.now().strftime('%Y%m%d')}.csv"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state/{state}")
async def get_state_report(state: str):
    """
    Get report for a specific state.
    """
    try:
        import polars as pl
        
        mvi_df = load_processed_dataset('mvi_analytics')
        
        if mvi_df is None or len(mvi_df) == 0:
            raise HTTPException(status_code=404, detail="No data available")
        
        state_data = mvi_df.filter(pl.col('state') == state)
        
        if len(state_data) == 0:
            raise HTTPException(status_code=404, detail=f"State {state} not found")
        
        # Calculate state stats
        avg_mvi = state_data.select(pl.col('mvi').mean()).item() or 0
        max_mvi = state_data.select(pl.col('mvi').max()).item() or 0
        total_pop = state_data.select(pl.col('population_base').sum()).item() or 0
        
        # Zone counts
        zones = state_data.group_by('zone_type').agg([
            pl.count().alias('count')
        ]).to_dicts()
        zone_dist = {row['zone_type']: row['count'] for row in zones}
        
        return {
            "status": "success",
            "state": state,
            "summary": {
                "total_districts": len(state_data),
                "avg_mvi": round(avg_mvi, 2),
                "max_mvi": round(max_mvi, 2),
                "total_population": int(total_pop),
                "zone_distribution": zone_dist
            },
            "districts": state_data.to_dicts(),
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

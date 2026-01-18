"""
Aadhaar Sanket API - Overview Routes
Dashboard summary metrics endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.mvi import get_mvi_summary
from engines.spatial import get_zone_distribution
from engines.anomaly import get_alert_summary
from engines.insight_generator import get_executive_summary

router = APIRouter()


@router.get("/")
async def get_overview():
    """
    Get dashboard overview with all summary metrics.
    """
    try:
        # Get MVI summary
        mvi_summary = get_mvi_summary()
        
        # Get zone distribution
        zones = get_zone_distribution()
        
        # Get alert summary
        alerts = get_alert_summary()
        
        # Get executive summary
        exec_summary = get_executive_summary()
        
        # Load enrolment data for total counts
        enrolment_df = load_processed_dataset('enrolment_clean')
        total_enrolments = 0
        if enrolment_df is not None:
            # Sum age columns
            age_cols = [c for c in enrolment_df.columns if 'age' in c.lower()]
            if age_cols:
                import polars as pl
                total_enrolments = int(enrolment_df.select(
                    pl.sum_horizontal([pl.col(c) for c in age_cols]).sum()
                ).item() or 0)
        
        return {
            "status": "success",
            "data": {
                "national_stats": {
                    "total_enrolments": total_enrolments,
                    "total_regions": mvi_summary.get("total_regions", 0),
                    "avg_mvi": mvi_summary.get("avg_mvi", 0),
                    "max_mvi": mvi_summary.get("max_mvi", 0),
                    "migration_velocity": "High" if mvi_summary.get("avg_mvi", 0) > 15 else "Moderate",
                    "data_freshness": "Live"
                },
                "zone_distribution": zones,
                "alert_summary": {
                    "total": alerts.get("total_alerts", 0),
                    "critical": alerts.get("critical", 0),
                    "high": alerts.get("high", 0),
                    "medium": alerts.get("medium", 0)
                },
                "alerts": alerts.get("alerts", []),
                "executive_summary": exec_summary.get("summary", ""),
                "recommendations": exec_summary.get("recommendations", [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics")
async def get_metrics():
    """
    Get all KPI card metrics.
    """
    try:
        mvi_summary = get_mvi_summary()
        zones = get_zone_distribution()
        alerts = get_alert_summary()
        
        # Load data for additional metrics
        enrolment_df = load_processed_dataset('enrolment_clean')
        demographic_df = load_processed_dataset('demographic_clean')
        biometric_df = load_processed_dataset('biometric_clean')
        
        # Count records
        import polars as pl
        
        total_enrolments = 0
        total_demographic = 0
        total_biometric = 0
        
        if enrolment_df is not None:
            age_cols = [c for c in enrolment_df.columns if 'age' in c.lower()]
            if age_cols:
                total_enrolments = int(enrolment_df.select(
                    pl.sum_horizontal([pl.col(c) for c in age_cols]).sum()
                ).item() or 0)
        
        if demographic_df is not None:
            demo_cols = [c for c in demographic_df.columns if 'demo' in c.lower()]
            if demo_cols:
                total_demographic = int(demographic_df.select(
                    pl.sum_horizontal([pl.col(c) for c in demo_cols]).sum()
                ).item() or 0)
        
        if biometric_df is not None:
            bio_cols = [c for c in biometric_df.columns if 'bio' in c.lower()]
            if bio_cols:
                total_biometric = int(biometric_df.select(
                    pl.sum_horizontal([pl.col(c) for c in bio_cols]).sum()
                ).item() or 0)
        
        # Get unique states and districts
        states_analyzed = 0
        districts_analyzed = mvi_summary.get("total_regions", 0)
        
        mvi_df = load_processed_dataset('mvi_analytics')
        if mvi_df is not None and 'state' in mvi_df.columns:
            states_analyzed = mvi_df.select(pl.col('state').n_unique()).item() or 0
        
        return {
            "status": "success",
            "metrics": {
                "total_enrolments": total_enrolments,
                "total_demographic_updates": total_demographic,
                "total_biometric_updates": total_biometric,
                "active_migrations": total_demographic,  # Address changes indicate migration
                "states_analyzed": states_analyzed,
                "districts_analyzed": districts_analyzed,
                "avg_mvi": mvi_summary.get("avg_mvi", 0),
                "max_mvi": mvi_summary.get("max_mvi", 0),
                "min_mvi": mvi_summary.get("min_mvi", 0),
                "high_pressure_zones": zones.get("high_inflow", 0) + zones.get("elevated_inflow", 0),
                "stable_zones": zones.get("stable", 0),
                "active_alerts": alerts.get("total_alerts", 0),
                "critical_alerts": alerts.get("critical", 0)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/live-ticker")
async def get_live_ticker():
    """
    Get live ticker messages for real-time updates display.
    """
    try:
        mvi_df = load_processed_dataset('mvi_analytics')
        alerts = get_alert_summary()
        
        ticker_items = []
        
        if mvi_df is not None and len(mvi_df) > 0:
            # Top regions by MVI
            top_regions = mvi_df.sort('mvi', descending=True).head(3).to_dicts()
            
            for i, region in enumerate(top_regions):
                ticker_items.append({
                    "id": i + 1,
                    "message": f"High activity in {region.get('district', 'Unknown')}, {region.get('state', '')} - MVI: {region.get('mvi', 0):.1f}",
                    "type": "warning" if region.get('mvi', 0) > 20 else "info",
                    "time": f"{(i+1)*3} mins ago"
                })
        
        # Add alert-based ticker items
        if alerts.get("critical", 0) > 0:
            ticker_items.append({
                "id": len(ticker_items) + 1,
                "message": f"{alerts['critical']} critical anomalies detected requiring attention",
                "type": "critical",
                "time": "Just now"
            })
        
        return {
            "status": "success",
            "ticker": ticker_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

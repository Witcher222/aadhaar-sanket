"""
Aadhaar Sanket API - Trust Routes
Data quality and metadata endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.metadata_tracker import MetadataTracker, generate_data_lineage, get_data_quality_report
from validators.data_quality import run_data_validation, get_data_quality_score

router = APIRouter()


@router.get("/")
async def get_trust_metrics():
    """
    Get data quality metrics.
    """
    try:
        quality_report = get_data_quality_report()
        quality_score = get_data_quality_score()
        
        return {
            "status": "success",
            "quality": {
                "overall_score": quality_report.get("overall_score", 0),
                "metrics": quality_report.get("metrics", {}),
                "validation": quality_score
            },
            "file_stats": quality_report.get("file_stats", []),
            "issues": quality_report.get("issues", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metadata")
async def get_metadata():
    """
    Get pipeline execution metadata.
    """
    try:
        metadata = MetadataTracker.load()
        
        return {
            "status": "success",
            "metadata": metadata
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/lineage")
async def get_lineage():
    """
    Get data lineage information.
    """
    try:
        lineage = generate_data_lineage()
        
        return {
            "status": "success",
            "lineage": lineage
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/validation")
async def run_validation():
    """
    Run data validation and get report.
    """
    try:
        validation_report = run_data_validation()
        
        return {
            "status": "success",
            "validation": validation_report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/files")
async def get_processed_files():
    """
    Get list of processed data files.
    """
    try:
        from engines.ingestion import get_processed_files
        
        files = get_processed_files()
        
        return {
            "status": "success",
            "files": files,
            "count": len(files)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_data_summary():
    """
    Get summary of all data sources.
    """
    try:
        from engines.ingestion import load_processed_dataset
        import polars as pl
        
        summary = {
            "datasets": {},
            "total_records": 0
        }
        
        datasets = ['enrolment_clean', 'demographic_clean', 'biometric_clean', 
                   'mvi_analytics', 'typology_analytics', 'policy_recommendations']
        
        for name in datasets:
            df = load_processed_dataset(name)
            if df is not None:
                summary["datasets"][name] = {
                    "rows": len(df),
                    "columns": len(df.columns),
                    "column_names": df.columns
                }
                summary["total_records"] += len(df)
        
        return {
            "status": "success",
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

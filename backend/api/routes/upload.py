"""
Aadhaar Sanket API - Upload Routes
File upload and data management endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.data_ingestion_manager import get_ingestion_manager
from engines.api_fetcher import get_uidai_fetcher
from run_pipeline import run_full_pipeline, get_pipeline_status

router = APIRouter()

# Track pipeline execution status
_pipeline_running = False
_pipeline_result = None


@router.post("/file")
async def upload_file(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload a CSV or ZIP file. 
    CSVs are classified by content. ZIPs are extracted to manual folder.
    Auto-triggers ingestion and pipeline.
    """
    try:
        filename = file.filename.lower()
        print(f"DEBUG: Received upload request for: {file.filename}")
        supported_extensions = ('.csv', '.zip', '.rar', '.7z', '.tar')
        if not filename.endswith(supported_extensions):
            print(f"DEBUG: Extension check failed for {filename}")
            raise HTTPException(status_code=400, detail=f"Supported formats: {', '.join(supported_extensions)}")
        
        content = await file.read()
        print(f"DEBUG: Read {len(content)} bytes from {filename}")
        
        manager = get_ingestion_manager()
        result = manager.organize_uploaded_file(content, file.filename)
        print(f"DEBUG: Ingestion manager result: {result}")
        
        if result.get("success"):
            # Trigger background tasks for automation
            background_tasks.add_task(manager.scan_and_ingest_all)
            background_tasks.add_task(run_full_pipeline, initialize_demo=False)
            
            return {
                "status": "success",
                "message": f"File processed: {result.get('message', 'Upload successful')}. Analytics triggered in background.",
                "details": result
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Upload failed"))
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scan")
async def scan_manual_folder():
    """
    Scan the manual folder for new files and process them.
    """
    try:
        manager = get_ingestion_manager()
        result = manager.scan_and_ingest_all()
        
        return {
            "status": "success",
            "message": "Scan completed",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_data_status():
    """
    Get current data status including available datasets.
    """
    try:
        manager = get_ingestion_manager()
        status = manager.get_data_status()
        validation = manager.validate_dataset_presence()
        
        return {
            "status": "success",
            "data_status": status,
            "validation": validation,
            "pipeline_ready": validation.get("is_valid", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reset")
async def reset_all_data():
    """
    Reset all processed data and clear cache.
    """
    try:
        manager = get_ingestion_manager()
        success = manager.reset_system()
        
        if success:
            return {
                "status": "success",
                "message": "System has been reset. All uploaded and processed data cleared."
            }
        else:
            raise HTTPException(status_code=500, detail="Reset failed")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/fetch-uidai")
async def fetch_uidai_data(background_tasks: BackgroundTasks, limit: int = 10000):
    """
    Fetch real-time data from UIDAI data.gov.in API.
    Auto-triggers ingestion pipeline after successful fetch.
    """
    try:
        fetcher = get_uidai_fetcher()
        result = fetcher.fetch_data(limit=limit)
        
        if result.get("success"):
            # Trigger background ingestion and pipeline
            manager = get_ingestion_manager()
            background_tasks.add_task(manager.scan_and_ingest_all)
            background_tasks.add_task(run_full_pipeline, initialize_demo=False)
            
            return {
                "status": "success",
                "message": result.get("message"),
                "record_count": result.get("record_count"),
                "columns": result.get("columns"),
            }
        else:
            status_code = result.get("status_code", 400)
            raise HTTPException(status_code=status_code, detail=result.get("error"))
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-pipeline")
async def trigger_pipeline(background_tasks: BackgroundTasks):
    """
    Execute the analytics pipeline.
    Can be run in foreground (blocking) or background.
    """
    global _pipeline_running, _pipeline_result
    
    if _pipeline_running:
        return {
            "status": "already_running",
            "message": "Pipeline is already running"
        }
    
    try:
        _pipeline_running = True
        _pipeline_result = None
        
        # Run pipeline (synchronously for now)
        result = run_full_pipeline(initialize_demo=True)
        
        _pipeline_result = result
        _pipeline_running = False
        
        return {
            "status": "success",
            "message": "Pipeline completed successfully",
            "result": result
        }
        
    except Exception as e:
        _pipeline_running = False
        _pipeline_result = {"status": "failed", "error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pipeline-status")
async def get_pipeline_execution_status():
    """
    Get the status of pipeline execution.
    """
    global _pipeline_running, _pipeline_result
    
    if _pipeline_running:
        return {
            "status": "running",
            "message": "Pipeline is currently executing"
        }
    
    if _pipeline_result:
        return {
            "status": _pipeline_result.get("status", "unknown"),
            "result": _pipeline_result
        }
    
    # Check last run from metadata
    pipeline_status = get_pipeline_status()
    return pipeline_status


@router.post("/initialize-demo")
async def initialize_demo_data():
    """
    Initialize from demo data if available.
    """
    try:
        manager = get_ingestion_manager()
        result = manager.initialize_from_demo()
        
        return {
            "status": "success",
            "message": "Demo data initialized",
            "details": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

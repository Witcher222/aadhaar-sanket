"""
Aadhaar Sanket - Production-Ready FastAPI Application
"""
import sys
import uuid
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import API_CONFIG
from core.logger import logger
from schemas.base import ErrorResponse

import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for robust startup and shutdown.
    Includes a background watcher for automated pipeline execution.
    """
    logger.info("Starting Aadhaar Sanket API Service...")
    
    async def pipeline_watcher():
        """Background task to poll for new data and run pipeline."""
        from engines.data_ingestion_manager import get_ingestion_manager
        from run_pipeline import run_full_pipeline
        
        manager = get_ingestion_manager()
        
        while True:
            try:
                # 1. Check status
                status_check = manager.get_data_status()
                
                # 2. If new data detected or pipeline not complete but raw data exists
                if status_check["new_data_detected"] or (not status_check["pipeline_complete"] and status_check["raw_data_found"]):
                    logger.info("New data or incomplete analytics detected! Auto-triggering pipeline...")
                    run_full_pipeline(initialize_demo=False)
                    logger.info("Automated pipeline run completed.")
                
                elif not status_check["ready_for_pipeline"] and status_check.get("demodata_available"):
                    # Fallback to demo if nothing else exists and not ready
                    logger.info("No user data. Initializing demo pipeline...")
                    run_full_pipeline(initialize_demo=True)
                
            except Exception as e:
                logger.error(f"Background Watcher Error: {e}")
            
            # Poll every 30 seconds
            await asyncio.sleep(30)

    async def scheduled_api_fetch():
        """Background task to auto-fetch UIDAI data on schedule."""
        import os
        from engines.api_fetcher import get_uidai_fetcher
        
        # Configurable fetch interval (default: 24 hours)
        fetch_hours = int(os.getenv("UIDAI_AUTO_FETCH_HOURS", "24"))
        fetch_interval_seconds = fetch_hours * 3600
        
        # Initial delay to avoid fetch on every restart
        await asyncio.sleep(60)
        
        while True:
            try:
                logger.info(f"Scheduled UIDAI API fetch starting...")
                fetcher = get_uidai_fetcher()
                result = fetcher.fetch_data(limit=10000)
                
                if result.get("success"):
                    logger.info(f"Scheduled fetch completed: {result.get('record_count')} records")
                else:
                    logger.warning(f"Scheduled fetch failed: {result.get('error')}")
                    
            except Exception as e:
                logger.error(f"Scheduled Fetch Error: {e}")
            
            # Wait for next scheduled fetch
            logger.info(f"Next scheduled fetch in {fetch_hours} hours")
            await asyncio.sleep(fetch_interval_seconds)

    # Start watcher in background
    watcher_task = asyncio.create_task(pipeline_watcher())
    fetch_task = asyncio.create_task(scheduled_api_fetch())
    
    yield
    
    watcher_task.cancel()
    fetch_task.cancel()
    logger.info("Shutting down Aadhaar Sanket API Service...")

# Create FastAPI app
app = FastAPI(
    title=API_CONFIG["title"],
    description=API_CONFIG["description"],
    version=API_CONFIG["version"],
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# --- Middleware ---

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    """Add Request ID to every request for tracing."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_CONFIG["cors_origins"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Exception Handlers ---

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch-all exception handler to prevent confusing 500 errors.
    Returns a standardized ErrorResponse.
    """
    logger.error(f"Global Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            status="error",
            code=500,
            message="Internal Server Error",
            details=str(exc) if True else "An unexpected error occurred." # In prod, hide details
        ).model_dump()
    )

# --- Routers ---
from api.routes import overview, upload, migration, trends, spatial, alerts, map, policy, trust, ai, report, export, advanced

app.include_router(overview.router, prefix="/api/overview", tags=["Overview"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])
app.include_router(migration.router, prefix="/api/migration", tags=["Migration"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])
app.include_router(spatial.router, prefix="/api/spatial", tags=["Spatial"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(map.router, prefix="/api/map", tags=["Map"])
app.include_router(policy.router, prefix="/api/policy", tags=["Policy"])
app.include_router(trust.router, prefix="/api/trust", tags=["Trust"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(report.router, prefix="/api/report", tags=["Report"])
app.include_router(export.router, prefix="/api/export", tags=["Export"])
app.include_router(advanced.router, prefix="/api/advanced", tags=["Advanced Analytics"])




@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "status": "healthy",
        "name": API_CONFIG["title"],
        "version": API_CONFIG["version"],
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    from engines.data_ingestion_manager import get_ingestion_manager
    
    manager = get_ingestion_manager()
    status = manager.get_data_status()
    
    return {
        "status": "healthy",
        "data_ready": status["ready_for_pipeline"],
        "processed_files": len(status.get("processed_files", {}))
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

from fastapi import APIRouter, HTTPException
from ai.insight_engine import get_insight_engine
import os

router = APIRouter(prefix="/ai", tags=["AI Diagnostics"])

@router.get("/test")
async def test_ai_connection():
    """
    Diagnostic endpoint to test Gemini connection and model discovery.
    """
    engine = get_insight_engine()
    
    # Force a refresh to pick up latest .env
    model = engine.get_active_model()
    
    results = {
        "api_key_present": bool(engine.api_key),
        "api_key_prefix": engine.api_key[:5] + "..." if engine.api_key else "None",
        "initialized": engine._initialized,
        "current_model": engine.current_model_name,
        "available_models_for_key": engine.available_models,
        "status": "ready" if engine.is_available() else "error"
    }
    
    if not engine.is_available():
        results["error_hint"] = "API Key might be invalid or no models are supported. Check .env"
        
    return results

@router.get("/rotate")
async def force_rotate_model():
    """
    Force the engine to switch to the next available model.
    """
    engine = get_insight_engine()
    success = engine._switch_to_next_model()
    return {
        "success": success,
        "new_model": engine.current_model_name,
        "all_available": engine.available_models
    }

"""
Aadhaar Sanket API - AI Routes
AI assistant endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai.insight_engine import get_insight_engine
from config import GEMINI_API_KEY

router = APIRouter()



class ExplainIssueRequest(BaseModel):
    title: str
    description: str
    data_context: Optional[Dict] = {}

class ExplainRequest(BaseModel):
    geo_key: str

@router.post("/explain/issue")
async def explain_issue(request: ExplainIssueRequest):
    """
    Get AI analysis, root cause, and solution for a specific issue.
    """
    try:
        engine = get_insight_engine()
        
        if not engine.is_available():
            return {
                "status": "warning",
                "analysis": "AI Service unavailable. \n\n**Potential Root Cause:** Data anomaly detected manually.\n**Standard Solution:** detailed verification required.",
                "source": "fallback"
            }
            
        analysis = engine.analyze_issue(request.title, request.description, request.data_context)
        
        return {
            "status": "success",
            "analysis": analysis,
            "source": "ai"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain/{geo_key}")
async def explain_region(geo_key: str):
    # ... existing code ...
    """
    Get AI explanation for a specific region's trends.
    """
    try:
        engine = get_insight_engine()
        
        if not engine.is_available():
            # Fallback to rule-based explanation
            from engines.insight_generator import get_regional_insight
            insight = get_regional_insight(geo_key)
            
            return {
                "status": "success",
                "geo_key": geo_key,
                "explanation": insight.get("insight_summary", "No insight available"),
                "source": "rule-based"
            }
        
        explanation = engine.explain_trend(geo_key)
        
        return {
            "status": "success",
            "geo_key": geo_key,
            "explanation": explanation,
            "source": "ai"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_ai_summary():
    """
    Get AI-generated executive summary.
    """
    try:
        engine = get_insight_engine()
        
        summary = engine.generate_executive_summary()
        
        return {
            "status": "success",
            "summary": summary,
            "ai_enhanced": engine.is_available()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggestions")
async def get_query_suggestions():
    """
    Get suggested queries for the AI assistant.
    """
    try:
        engine = get_insight_engine()
        suggestions = engine.get_suggested_queries()
        
        return {
            "status": "success",
            "suggestions": suggestions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict] = {}

@router.post("/ask")
async def ask_ai(request: QueryRequest):
    """
    Ask a specific question to the AI.
    """
    try:
        engine = get_insight_engine()
        if not engine.is_available():
            return {
                "status": "warning", 
                "answer": "AI Engine is active but requires configured API Key.",
                "source": "fallback"
            }
            
        answer = engine.ask(request.query, request.context)
        
        return {
            "status": "success",
            "answer": answer,
            "source": "ai"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(request: QueryRequest):
    """
    Chat with AI about the data (alias for ask).
    """
    return await ask_ai(request)


class PolicyRequest(BaseModel):
    district: Optional[str] = None


@router.post("/policy-recommendations")
async def get_policy_recommendations(request: PolicyRequest):
    """
    Get AI-generated policy recommendations for a district or national level.
    """
    try:
        from engines.ai_insights import generate_policy_recommendations
        
        result = generate_policy_recommendations(request.district)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/natural-query")
async def natural_language_query(request: QueryRequest):
    """
    Answer a natural language question using analytics data.
    Ask questions like "Which districts have highest migration in Maharashtra?"
    """
    try:
        from engines.ai_insights import answer_natural_query
        
        result = answer_natural_query(request.query)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/district/{district_name}/insights")
async def get_district_ai_insights(district_name: str):
    """
    Get AI-powered insights for a specific district.
    """
    try:
        from engines.ai_insights import get_district_insights
        
        result = get_district_insights(district_name)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

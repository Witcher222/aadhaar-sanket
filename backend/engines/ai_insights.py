"""
AI Insights Engine

Provides AI-powered policy recommendations and natural language query support.
Uses Gemini API for intelligent analysis.
"""
import google.generativeai as genai
import polars as pl
from pathlib import Path
from typing import Dict, Optional, List
import sys
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, GEMINI_API_KEY


def configure_gemini():
    """Configure Gemini API with key."""
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        return True
    return False


def load_analytics_context() -> Dict:
    """Load key analytics data for AI context."""
    context = {}
    
    # MVI data
    mvi_path = PATHS["processed_dir"] / "mvi_analytics.parquet"
    if mvi_path.exists():
        mvi_df = pl.read_parquet(mvi_path)
        context["mvi_summary"] = {
            "total_districts": mvi_df.height,
            "avg_mvi": round(mvi_df["mvi"].mean(), 2) if "mvi" in mvi_df.columns else 0,
            "high_risk_count": mvi_df.filter(pl.col("mvi") > 30).height if "mvi" in mvi_df.columns else 0,
        }
        if "district" in mvi_df.columns and "mvi" in mvi_df.columns:
            context["top_districts"] = mvi_df.sort("mvi", descending=True).head(10).to_dicts()
    
    # Anomaly data
    anomaly_path = PATHS["processed_dir"] / "anomaly_analytics.parquet"
    if anomaly_path.exists():
        anomaly_df = pl.read_parquet(anomaly_path)
        context["active_alerts"] = anomaly_df.height
        context["alert_sample"] = anomaly_df.head(5).to_dicts()
    
    return context


def generate_policy_recommendations(district: Optional[str] = None) -> Dict:
    """
    Generate AI-powered policy recommendations based on current data.
    """
    from ai.insight_engine import get_insight_engine
    engine = get_insight_engine()
    
    if not engine.is_available():
        return {
            "error": "Gemini AI key not configured or models unavailable.",
            "recommendations": []
        }
    
    context = load_analytics_context()
    
    # Build prompt
    prompt = f"""You are an expert policy advisor for demographic intelligence in India.

Based on the following Aadhaar enrolment analytics data, provide specific, actionable policy recommendations.

DATA CONTEXT:
- Total Districts Analyzed: {context.get('mvi_summary', {}).get('total_districts', 0)}
- Average Migration Velocity Index (MVI): {context.get('mvi_summary', {}).get('avg_mvi', 0)}
- High Risk Districts (MVI > 30): {context.get('mvi_summary', {}).get('high_risk_count', 0)}
- Active Anomaly Alerts: {context.get('active_alerts', 0)}

TOP HIGH-MIGRATION DISTRICTS:
{json.dumps(context.get('top_districts', [])[:5], indent=2)}

{"FOCUS DISTRICT: " + district if district else "NATIONAL LEVEL ANALYSIS"}

Provide recommendations in this JSON format:
{{
    "summary": "Brief overview",
    "recommendations": [
        {{
            "title": "Recommendation title",
            "description": "Detailed action",
            "priority": "high/medium/low",
            "timeline": "immediate/short-term/long-term",
            "impact": "Expected outcome"
        }}
    ],
    "risk_assessment": "Overall risk statement"
}}

Provide 3-5 specific, implementable recommendations."""

    try:
        # Use robust generation with fallback
        response_text = engine.generate_content(prompt)
        
        if not response_text:
            raise Exception("AI generation failed after retries")
        
        # Try to extract JSON
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
            return {
                "status": "success",
                "district": district or "National",
                **result
            }
        
        # Fallback if JSON parsing fails
        return {
            "status": "success",
            "district": district or "National",
            "summary": response_text,
            "recommendations": [],
            "raw_response": True
        }
        
    except Exception as e:
        print(f"Policy Generation Error: {e}")
        return {
            "error": str(e),
            "recommendations": []
        }


def answer_natural_query(question: str) -> Dict:
    """
    Answer a natural language question using analytics data.
    """
    from ai.insight_engine import get_insight_engine
    engine = get_insight_engine()
    
    if not engine.is_available():
        return {
            "error": "Gemini AI key not configured or models unavailable.",
            "answer": None
        }
    
    context = load_analytics_context()
    
    # Build prompt with data context
    prompt = f"""You are an AI assistant for the Aadhaar Sanket Demographic Intelligence Platform.

Answer the following user question using the provided analytics data. Be specific and cite data points.

AVAILABLE DATA:
- Total Districts: {context.get('mvi_summary', {}).get('total_districts', 0)}
- Average MVI: {context.get('mvi_summary', {}).get('avg_mvi', 0)}
- High Risk Districts: {context.get('mvi_summary', {}).get('high_risk_count', 0)}
- Active Alerts: {context.get('active_alerts', 0)}

TOP MIGRATION DISTRICTS:
{json.dumps(context.get('top_districts', [])[:10], indent=2)}

SAMPLE ALERTS:
{json.dumps(context.get('alert_sample', []), indent=2)}

USER QUESTION: {question}

Provide a clear, data-backed answer. If the data doesn't contain the answer, say so honestly."""

    try:
        response_text = engine.generate_content(prompt)
        
        if not response_text:
             raise Exception("AI generation failed after retries")
        
        return {
            "status": "success",
            "question": question,
            "answer": response_text,
            "data_context": {
                "districts_analyzed": context.get('mvi_summary', {}).get('total_districts', 0),
                "high_risk_count": context.get('mvi_summary', {}).get('high_risk_count', 0)
            }
        }
        
    except Exception as e:
        print(f"Query AI Error: {e}")
        return {
            "error": str(e),
            "answer": None
        }



def get_district_insights(district: str) -> Dict:
    """
    Get AI-generated insights for a specific district.
    """
    # Load district-specific data
    mvi_path = PATHS["processed_dir"] / "mvi_analytics.parquet"
    if not mvi_path.exists():
        return {"error": "No MVI data available"}
    
    mvi_df = pl.read_parquet(mvi_path)
    
    if "district" not in mvi_df.columns:
        return {"error": "District column not found"}
    
    district_data = mvi_df.filter(
        pl.col("district").str.to_lowercase() == district.lower()
    )
    
    if district_data.height == 0:
        return {"error": f"District '{district}' not found"}
    
    data = district_data.to_dicts()[0]
    
    return {
        "district": district,
        "data": data,
        "recommendations": generate_policy_recommendations(district)
    }

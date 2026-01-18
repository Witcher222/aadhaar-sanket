"""
Aadhaar Sanket API - Policy Routes
Policy recommendation endpoints.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from typing import Optional

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.ingestion import load_processed_dataset
from engines.policy_mapper import get_policy_summary, get_top_recommendations
from engines.insight_generator import get_executive_summary, get_regional_insight

router = APIRouter()


@router.get("/")
async def get_policy_recommendations():
    """
    Get all policy recommendations.
    """
    try:
        policy_df = load_processed_dataset('policy_recommendations')
        
        if policy_df is None or len(policy_df) == 0:
            return {
                "status": "success",
                "recommendations": [],
                "summary": {}
            }
        
        summary = get_policy_summary()
        
        return {
            "status": "success",
            "recommendations": policy_df.to_dicts(),
            "summary": summary,
            "total": len(policy_df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/top")
async def get_top_policies(limit: int = 10):
    """
    Get top priority policy recommendations.
    """
    try:
        recommendations = get_top_recommendations(limit)
        
        return {
            "status": "success",
            "recommendations": recommendations,
            "count": len(recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights")
async def get_decision_insights():
    """
    Get decision insights.
    """
    try:
        insights_df = load_processed_dataset('decision_insights')
        
        if insights_df is None or len(insights_df) == 0:
            return {
                "status": "success",
                "insights": [],
                "executive_summary": {}
            }
        
        exec_summary = get_executive_summary()
        
        return {
            "status": "success",
            "insights": insights_df.to_dicts(),
            "executive_summary": exec_summary,
            "total": len(insights_df)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/region/{geo_key}")
async def get_region_insight(geo_key: str):
    """
    Get policy insight for a specific region.
    """
    try:
        insight = get_regional_insight(geo_key)
        
        if insight.get("error"):
            raise HTTPException(status_code=404, detail=insight["error"])
        
        return {
            "status": "success",
            "insight": insight
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-priority/{priority}")
async def get_policies_by_priority(priority: str):
    """
    Get policies filtered by priority level.
    """
    try:
        import polars as pl
        
        valid_priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        priority = priority.upper()
        
        if priority not in valid_priorities:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid priority. Must be one of: {valid_priorities}"
            )
        
        policy_df = load_processed_dataset('policy_recommendations')
        
        if policy_df is None or len(policy_df) == 0:
            return {"status": "success", "recommendations": []}
        
        filtered = policy_df.filter(pl.col('priority') == priority)
        
        return {
            "status": "success",
            "priority": priority,
            "recommendations": filtered.to_dicts(),
            "count": len(filtered)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-action/{action_type}")
async def get_policies_by_action(action_type: str):
    """
    Get policies filtered by action type.
    """
    try:
        import polars as pl
        
        policy_df = load_processed_dataset('policy_recommendations')
        
        if policy_df is None or len(policy_df) == 0:
            return {"status": "success", "recommendations": []}
        
        filtered = policy_df.filter(pl.col('action_type') == action_type)
        
        return {
            "status": "success",
            "action_type": action_type,
            "recommendations": filtered.to_dicts(),
            "count": len(filtered)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_policy_categories():
    """
    Get available policy categories.
    """
    try:
        policy_df = load_processed_dataset('policy_recommendations')
        
        if policy_df is None or len(policy_df) == 0:
            return {"status": "success", "categories": {}}
        
        # Count by action type
        import polars as pl
        
        action_counts = policy_df.group_by('action_type').agg([
            pl.count().alias('count')
        ]).to_dicts()
        
        priority_counts = policy_df.group_by('priority').agg([
            pl.count().alias('count')
        ]).to_dicts()
        
        return {
            "status": "success",
            "categories": {
                "by_action": {row['action_type']: row['count'] for row in action_counts},
                "by_priority": {row['priority']: row['count'] for row in priority_counts}
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

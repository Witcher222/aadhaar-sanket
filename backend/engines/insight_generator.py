"""
Aadhaar Sanket - Insight Generator Engine
Generates human-readable decision insights.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS, TREND_TYPES, MVI_THRESHOLDS
from .ingestion import load_processed_dataset


def format_insight(
    geo_key: str,
    state: str,
    district: str,
    mvi: float,
    zone_type: str,
    trend_type: str,
    confidence: str,
    population_base: float
) -> Dict:
    """
    Generate a structured insight for a single region.
    """
    # Generate summary
    if zone_type == "high_inflow":
        summary = f"{district}, {state} is experiencing extremely high migration pressure with MVI of {mvi:.1f}"
    elif zone_type == "elevated_inflow":
        summary = f"{district}, {state} shows elevated migration activity with MVI of {mvi:.1f}"
    elif zone_type == "moderate_inflow":
        summary = f"{district}, {state} has moderate migration patterns with MVI of {mvi:.1f}"
    else:
        summary = f"{district}, {state} maintains stable demographic patterns with MVI of {mvi:.1f}"
    
    # Generate key findings
    findings = []
    findings.append(f"MVI of {mvi:.1f} indicates {zone_type.replace('_', ' ')} zone")
    
    trend_info = TREND_TYPES.get(trend_type, {})
    if trend_info:
        findings.append(f"Trend pattern: {trend_info.get('description', trend_type)}")
    
    findings.append(f"Population base: {int(population_base):,}")
    
    # Generate recommended action
    if zone_type == "high_inflow":
        action = "Immediate capacity expansion and resource allocation required"
    elif zone_type == "elevated_inflow":
        action = "Plan for infrastructure upgrades and service expansion"
    elif trend_type == "volatile":
        action = "Deploy monitoring systems and investigate volatility causes"
    elif trend_type == "emerging_inflow":
        action = "Early intervention and proactive planning recommended"
    else:
        action = "Continue standard operations with periodic review"
    
    # Generate confidence statement
    if confidence == "high":
        conf_statement = f"High confidence based on {int(population_base):,} population sample"
    elif confidence == "medium":
        conf_statement = f"Medium confidence - additional data collection recommended"
    else:
        conf_statement = f"Low confidence due to limited data - interpret with caution"
    
    return {
        "geo_key": geo_key,
        "insight_summary": summary,
        "key_findings": "; ".join(findings),
        "recommended_action": action,
        "confidence_statement": conf_statement
    }


def generate_insights(
    mvi_df: Optional[pl.DataFrame] = None,
    typology_df: Optional[pl.DataFrame] = None
) -> pl.DataFrame:
    """
    Create plain-language summaries for each geo_key.
    """
    if mvi_df is None:
        mvi_df = load_processed_dataset('mvi_analytics')
    if typology_df is None:
        typology_df = load_processed_dataset('typology_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return pl.DataFrame({
            'geo_key': [],
            'insight_summary': [],
            'key_findings': [],
            'recommended_action': [],
            'confidence_statement': []
        })
    
    # Merge with typology if available
    if typology_df is not None and len(typology_df) > 0:
        if 'trend_type' in typology_df.columns:
            combined = mvi_df.join(
                typology_df.select(['geo_key', 'trend_type']),
                on='geo_key',
                how='left'
            )
        else:
            combined = mvi_df.with_columns([pl.lit('stable').alias('trend_type')])
    else:
        combined = mvi_df.with_columns([pl.lit('stable').alias('trend_type')])
    
    # Fill nulls
    combined = combined.fill_null('stable')
    
    # Generate insights for each row
    insights = []
    
    for row in combined.to_dicts():
        insight = format_insight(
            geo_key=row.get('geo_key', ''),
            state=row.get('state', ''),
            district=row.get('district', ''),
            mvi=row.get('mvi', 0),
            zone_type=row.get('zone_type', 'stable'),
            trend_type=row.get('trend_type', 'stable'),
            confidence=row.get('confidence', 'medium'),
            population_base=row.get('population_base', 0)
        )
        insights.append(insight)
    
    return pl.DataFrame(insights)


def get_executive_summary() -> Dict:
    """
    Generate national-level executive summary.
    """
    mvi_df = load_processed_dataset('mvi_analytics')
    typology_df = load_processed_dataset('typology_analytics')
    
    if mvi_df is None or len(mvi_df) == 0:
        return {
            "summary": "No data available for analysis",
            "key_metrics": {},
            "top_concerns": [],
            "recommendations": []
        }
    
    # Calculate key metrics
    total_regions = len(mvi_df)
    avg_mvi = mvi_df.select(pl.col('mvi').mean()).item() or 0
    max_mvi = mvi_df.select(pl.col('mvi').max()).item() or 0
    
    # Count zones
    zone_counts = mvi_df.group_by('zone_type').agg([
        pl.count().alias('count')
    ]).to_dicts()
    
    zones = {row['zone_type']: row['count'] for row in zone_counts}
    
    # High concern regions
    high_concern = mvi_df.filter(pl.col('mvi') >= MVI_THRESHOLDS["elevated"])
    top_concerns = high_concern.sort('mvi', descending=True).head(5).to_dicts()
    
    # Generate summary text
    high_count = zones.get('high_inflow', 0) + zones.get('elevated_inflow', 0)
    
    summary = f"""
Analysis of {total_regions} regions reveals an average MVI of {avg_mvi:.1f} with peak values reaching {max_mvi:.1f}.
{high_count} regions are classified as elevated or high inflow zones requiring attention.
{zones.get('stable', 0)} regions maintain stable demographic patterns.
"""
    
    # Generate recommendations
    recommendations = []
    if zones.get('high_inflow', 0) > 0:
        recommendations.append("Deploy emergency planning cells in high-inflow zones")
    if zones.get('elevated_inflow', 0) > 0:
        recommendations.append("Initiate infrastructure capacity assessments")
    if zones.get('moderate_inflow', 0) > 0:
        recommendations.append("Continue monitoring moderate inflow regions")
    recommendations.append("Maintain regular data refresh cycles")
    
    return {
        "summary": summary.strip(),
        "key_metrics": {
            "total_regions": total_regions,
            "avg_mvi": round(avg_mvi, 2),
            "max_mvi": round(max_mvi, 2),
            "high_concern_count": high_count
        },
        "zone_distribution": zones,
        "top_concerns": [
            {"district": r.get('district'), "state": r.get('state'), "mvi": round(r.get('mvi', 0), 2)}
            for r in top_concerns
        ],
        "recommendations": recommendations
    }


def get_regional_insight(geo_key: str) -> Dict:
    """
    Get detailed insight for a specific region.
    """
    insights_df = load_processed_dataset('decision_insights')
    
    if insights_df is None or len(insights_df) == 0:
        return {"error": "No insights data available"}
    
    region = insights_df.filter(pl.col('geo_key') == geo_key)
    
    if len(region) == 0:
        return {"error": f"Region {geo_key} not found"}
    
    return region.to_dicts()[0]


def run_insight_generation() -> pl.DataFrame:
    """
    Run the complete insight generation pipeline.
    """
    # Generate insights
    insights_df = generate_insights()
    
    if len(insights_df) > 0:
        insights_df.write_parquet(
            PATHS["processed_dir"] / "decision_insights.parquet",
            compression="snappy"
        )
    
    return insights_df

"""
Export Engine

Handles data export to CSV, Excel, and PDF formats.
"""
import polars as pl
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, List
import io
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS


def get_available_datasets() -> List[str]:
    """List all available processed datasets."""
    processed_dir = PATHS["processed_dir"]
    if not processed_dir.exists():
        return []
    
    datasets = []
    for file in processed_dir.glob("*.parquet"):
        datasets.append(file.stem)
    return sorted(datasets)


def export_to_csv(dataset_name: str) -> Optional[bytes]:
    """
    Export a dataset to CSV format.
    
    Args:
        dataset_name: Name of the dataset (without extension)
        
    Returns:
        CSV bytes or None if dataset not found
    """
    file_path = PATHS["processed_dir"] / f"{dataset_name}.parquet"
    if not file_path.exists():
        return None
    
    df = pl.read_parquet(file_path)
    
    # Convert to CSV bytes
    buffer = io.BytesIO()
    df.write_csv(buffer)
    return buffer.getvalue()


def export_to_excel(dataset_name: str) -> Optional[bytes]:
    """
    Export a dataset to Excel format.
    
    Args:
        dataset_name: Name of the dataset (without extension)
        
    Returns:
        Excel bytes or None if dataset not found
    """
    file_path = PATHS["processed_dir"] / f"{dataset_name}.parquet"
    if not file_path.exists():
        return None
    
    df = pl.read_parquet(file_path)
    
    # Convert to Excel bytes using openpyxl
    buffer = io.BytesIO()
    df.write_excel(buffer, worksheet="Data")
    return buffer.getvalue()


def generate_summary_report() -> Dict:
    """
    Generate a summary report of all analytics.
    
    Returns:
        Dict with report data for PDF generation
    """
    report = {
        "generated_at": datetime.now().isoformat(),
        "title": "Aadhaar Sanket Analytics Report",
        "sections": []
    }
    
    # MVI Summary
    mvi_path = PATHS["processed_dir"] / "mvi_analytics.parquet"
    if mvi_path.exists():
        mvi_df = pl.read_parquet(mvi_path)
        if "mvi" in mvi_df.columns:
            report["sections"].append({
                "title": "MVI Summary",
                "data": {
                    "total_districts": mvi_df.height,
                    "avg_mvi": round(mvi_df["mvi"].mean(), 2) if mvi_df.height > 0 else 0,
                    "max_mvi": round(mvi_df["mvi"].max(), 2) if mvi_df.height > 0 else 0,
                    "min_mvi": round(mvi_df["mvi"].min(), 2) if mvi_df.height > 0 else 0,
                }
            })
    
    # Zone Distribution
    spatial_path = PATHS["processed_dir"] / "spatial_clusters.parquet"
    if spatial_path.exists():
        spatial_df = pl.read_parquet(spatial_path)
        if "zone_type" in spatial_df.columns:
            zone_counts = spatial_df.group_by("zone_type").count()
            report["sections"].append({
                "title": "Zone Distribution",
                "data": zone_counts.to_dicts()
            })
    
    # Alert Summary
    anomaly_path = PATHS["processed_dir"] / "anomaly_analytics.parquet"
    if anomaly_path.exists():
        anomaly_df = pl.read_parquet(anomaly_path)
        report["sections"].append({
            "title": "Active Alerts",
            "data": {
                "total_anomalies": anomaly_df.height,
                "top_alerts": anomaly_df.head(10).to_dicts() if anomaly_df.height > 0 else []
            }
        })
    
    # Dataset Inventory
    datasets = get_available_datasets()
    report["sections"].append({
        "title": "Available Datasets",
        "data": {
            "datasets": datasets,
            "count": len(datasets)
        }
    })
    
    return report


def export_report_as_text() -> str:
    """Generate a text-based report summary."""
    report = generate_summary_report()
    
    lines = [
        "=" * 60,
        f"AADHAAR SANKET ANALYTICS REPORT",
        f"Generated: {report['generated_at']}",
        "=" * 60,
        ""
    ]
    
    for section in report["sections"]:
        lines.append(f"\n### {section['title']} ###")
        data = section["data"]
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, list):
                    lines.append(f"{key}: {len(value)} items")
                else:
                    lines.append(f"{key}: {value}")
        elif isinstance(data, list):
            for item in data[:10]:
                lines.append(f"  - {item}")
    
    lines.append("\n" + "=" * 60)
    lines.append("End of Report")
    
    return "\n".join(lines)

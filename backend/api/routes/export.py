"""
Aadhaar Sanket API - Export Routes
Data export endpoints for CSV, Excel, and PDF.
"""
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engines.export import (
    get_available_datasets,
    export_to_csv,
    export_to_excel,
    generate_summary_report,
    export_report_as_text
)

router = APIRouter()


@router.get("/datasets")
async def list_datasets():
    """List all available datasets for export."""
    try:
        datasets = get_available_datasets()
        return {
            "status": "success",
            "datasets": datasets,
            "count": len(datasets)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/csv/{dataset_name}")
async def export_csv(dataset_name: str):
    """Export a dataset as CSV."""
    try:
        csv_bytes = export_to_csv(dataset_name)
        if csv_bytes is None:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset_name}' not found")
        
        return StreamingResponse(
            io.BytesIO(csv_bytes),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={dataset_name}.csv"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/excel/{dataset_name}")
async def export_excel(dataset_name: str):
    """Export a dataset as Excel."""
    try:
        excel_bytes = export_to_excel(dataset_name)
        if excel_bytes is None:
            raise HTTPException(status_code=404, detail=f"Dataset '{dataset_name}' not found")
        
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename={dataset_name}.xlsx"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report")
async def get_report():
    """Get summary report data for PDF generation."""
    try:
        report = generate_summary_report()
        return {
            "status": "success",
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/report/text")
async def export_report_text():
    """Export summary report as plain text."""
    try:
        text_report = export_report_as_text()
        return StreamingResponse(
            io.BytesIO(text_report.encode("utf-8")),
            media_type="text/plain",
            headers={
                "Content-Disposition": "attachment; filename=aadhaar_sanket_report.txt"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

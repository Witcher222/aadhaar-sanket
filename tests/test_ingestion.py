import sys
from pathlib import Path
import polars as pl

# Mock PATHS or import from config
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from config import PATHS
from engines.ingestion import classify_csv_by_content, discover_datasets
from engines.data_ingestion_manager import get_ingestion_manager

print("--- Data Discovery Test ---")
datasets = discover_datasets(PATHS["manual_dir"])
for dtype, files in datasets.items():
    print(f"Type {dtype}: {len(files)} files found")
    for f in files:
        print(f"  - {f.relative_to(Path.cwd())}")

print("\n--- Ingestion Manager Scan ---")
try:
    manager = get_ingestion_manager()
    status = manager.get_data_status()
    print(f"New data detected: {status.get('new_data_detected')}")
    print(f"Manual files total: {status.get('manual_files_total')}")
    print(f"Processed files count: {len(status.get('processed_files', {}))}")

    results = manager.scan_and_ingest_all()
    print(f"Ingestion Results (Count): {results.get('new_files_found', 0)}")
    
    validation = manager.validate_dataset_presence()
    print(f"Validation summary (Base Data Present): {validation.get('is_valid')}")
    if not validation.get('is_valid'):
        print(f"Errors: {validation.get('errors')}")
except Exception as e:
    print(f"Ingestion Manager Error: {e}")
    import traceback
    traceback.print_exc()

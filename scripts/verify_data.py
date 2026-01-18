import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from engines.ingestion import load_processed_dataset
from engines.mvi import get_mvi_summary
from engines.spatial import get_zone_distribution
from engines.anomaly import get_alert_summary

datasets = [
    'enrolment_clean', 'demographic_clean', 'biometric_clean', 
    'signal_separated', 'mvi_analytics', 'spatial_clusters', 
    'anomaly_analytics', 'typology_analytics'
]

print("--- Dataset Verification ---")
for ds in datasets:
    df = load_processed_dataset(ds)
    if df is not None:
        print(f"{ds}: {len(df)} rows, columns: {df.columns}")
    else:
        print(f"{ds}: NOT FOUND")

print("\n--- Summary Verification ---")
print(f"MVI Summary: {get_mvi_summary()}")
print(f"Zone Distribution: {get_zone_distribution()}")
print(f"Alert Summary: {get_alert_summary()}")

import polars as pl
from pathlib import Path

processed_dir = Path(__file__).resolve().parent.parent / "data" / "processed"

for p_file in processed_dir.glob("*.parquet"):
    try:
        df = pl.read_parquet(p_file)
        print(f"File: {p_file.name}")
        print(f"Rows: {len(df)}")
        print(f"Sample:\n{df.head(2)}")
        print("-" * 30)
    except Exception as e:
        print(f"Error reading {p_file.name}: {e}")

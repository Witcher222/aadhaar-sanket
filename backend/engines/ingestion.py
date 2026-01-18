"""
Aadhaar Sanket - Data Ingestion Engine
Handles CSV discovery, classification by content, and Parquet conversion.
"""
import zipfile
import shutil
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
import logging
import polars as pl

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import (
    PATHS, ENROLMENT_INDICATORS, DEMOGRAPHIC_INDICATORS, BIOMETRIC_INDICATORS
)
from exceptions import DataIngestionError, DataClassificationError

def extract_archives_recursively(data_dir: Path) -> int:
    """
    Recursively find and extract all ZIP, RAR, 7Z, and TAR files in the data directory.
    Uses native ZIP support and system 'tar' for others.
    
    Returns:
        Number of archives extracted.
    """
    extracted_count = 0
    supported_suffixes = ['.zip', '.rar', '.7z', '.tar']
    
    for suffix in supported_suffixes:
        for arch_path in data_dir.rglob(f"*{suffix}"):
            try:
                extract_path = arch_path.parent / arch_path.stem
                if extract_path.exists() and any(extract_path.iterdir()):
                    continue
                    
                print(f"Extracting {suffix.upper()} archive: {arch_path}")
                extract_path.mkdir(exist_ok=True)
                
                if suffix == '.zip':
                    with zipfile.ZipFile(arch_path, 'r') as zip_ref:
                        zip_ref.extractall(extract_path)
                    extracted_count += 1
                else:
                    # Use system 'tar' for RAR, 7Z, TAR
                    import subprocess
                    try:
                        subprocess.run(['tar', '-xf', str(arch_path), '-C', str(extract_path)], 
                                     check=True, capture_output=True)
                        extracted_count += 1
                    except Exception as e:
                        print(f"Warning: System tar failed to extract {arch_path}: {e}")
                
            except Exception as e:
                print(f"Error extracting {arch_path}: {e}")
                
    return extracted_count


def classify_csv_by_content(file_path: Path) -> str:
    """
    Read CSV headers and classify based on column patterns.
    Classification is done by CONTENT, not filename.
    
    Returns: 'enrolment', 'demographic', or 'biometric'
    Raises: DataClassificationError if classification fails
    """
    try:
        # Read only the header row
        try:
            df = pl.read_csv(file_path, n_rows=0)
        except Exception:
            # Try reading with different encoding if default fails
            try:
                df = pl.read_csv(file_path, n_rows=0, encoding='latin1')
            except:
                raise DataClassificationError(f"Could not read CSV header: {file_path}")

        columns = [col.lower() for col in df.columns]
        columns_str = ' '.join(columns)
        
        # Count matches for each category
        enrol_score = sum(1 for ind in ENROLMENT_INDICATORS if ind.lower() in columns_str)
        demo_score = sum(1 for ind in DEMOGRAPHIC_INDICATORS if ind.lower() in columns_str)
        bio_score = sum(1 for ind in BIOMETRIC_INDICATORS if ind.lower() in columns_str)
        
        # Classify based on highest score
        scores = {
            'enrolment': enrol_score,
            'demographic': demo_score,
            'biometric': bio_score
        }
        
        max_score = max(scores.values())
        if max_score == 0:
            # Fallback: check specific column patterns
            if any('age_0_5' in col or 'age_5_17' in col or 'age_18' in col for col in columns):
                if any('demo' in col for col in columns):
                    return 'demographic'
                elif any('bio' in col for col in columns):
                    return 'biometric'
                else:
                    return 'enrolment'
            raise DataClassificationError(f"Could not classify file: {file_path}")
        
        # Return the category with highest score
        return max(scores, key=scores.get)
        
    except Exception as e:
        if isinstance(e, DataClassificationError):
            raise
        raise DataClassificationError(f"Error classifying {file_path}: {str(e)}")


def discover_datasets(data_dir: Path = None) -> Dict[str, List[Path]]:
    """
    Scan data directory and classify files by CONTENT, not filename.
    Recursively searches the entire data directory (ignoring processed folders).
    
    Returns: {"enrolment": [paths], "demographic": [paths], "biometric": [paths]}
    """
    if data_dir is None:
        data_dir = PATHS["data_dir"]
        
    # Ensure archives are extracted first
    extract_archives_recursively(data_dir)
    
    datasets = {
        "enrolment": [],
        "demographic": [],
        "biometric": [],
    }
    
    processed_dir = PATHS["processed_dir"]
    
    # helper to check if path is inside processed directory
    def is_in_processed(path: Path) -> bool:
        try:
            path.relative_to(processed_dir)
            return True
        except ValueError:
            return False

    # Find all CSV files recursively in data_dir
    search_dirs = [data_dir]
    seen_files = set()
    seen_hashes = set()

    import hashlib
    def get_file_hash(path):
        sha256 = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    for search_root in search_dirs:
        if not search_root.exists():
            continue
            
        for csv_file in search_root.rglob("*.csv"):
            if csv_file in seen_files:
                continue
                
            # Skip files in processed directory
            if is_in_processed(csv_file):
                continue
                
            seen_files.add(csv_file)

            try:
                # Deduplicate by CONTENT
                f_hash = get_file_hash(csv_file)
                if f_hash in seen_hashes:
                    # print(f"Skipping duplicate content: {csv_file}")
                    continue
                seen_hashes.add(f_hash)

                # Classify by content
                file_type = classify_csv_by_content(csv_file)
                datasets[file_type].append(csv_file)
            except DataClassificationError:
                pass
            except Exception as e:
                print(f"Error checking {csv_file}: {e}")
    
    return datasets


def normalize_schema(df: pl.DataFrame, data_type: str) -> pl.DataFrame:
    """
    Standardize column names across different file formats.
    Ensures consistent schema for downstream processing.
    """
    # Lowercase all column names
    df = df.rename({col: col.lower().strip() for col in df.columns})
    
    # Standard columns
    standard_cols = ['date', 'state', 'district', 'pincode']
    
    # Rename common variations
    rename_map = {
        'dt': 'date',
        'st': 'state',
        'dist': 'district',
        'pin': 'pincode',
        'pin_code': 'pincode',
    }
    
    for old, new in rename_map.items():
        if old in df.columns and new not in df.columns:
            df = df.rename({old: new})
    
    # Parse date column if exists
    if 'date' in df.columns:
        try:
            # Try parsing with common formats
            df = df.with_columns([
                pl.col('date').str.to_date(format='%d-%m-%Y', strict=False).alias('date')
            ])
        except:
            try:
                df = df.with_columns([
                    pl.col('date').str.to_date(format='%Y-%m-%d', strict=False).alias('date')
                ])
            except:
                pass  # Keep as string if parsing fails
    
    # Ensure pincode is integer
    if 'pincode' in df.columns:
        df = df.with_columns([
            pl.col('pincode').cast(pl.Int64, strict=False)
        ])
    
    return df


def convert_to_parquet(csv_paths: List[Path], output_path: Path, data_type: str) -> Dict:
    """
    Merge multiple CSVs and save as Parquet with compression.
    
    Returns metadata about the conversion.
    """
    if not csv_paths:
        return {"status": "skipped", "reason": "No files to convert"}
    
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    dfs = []
    total_rows = 0
    
    for csv_path in csv_paths:
        try:
            df = pl.read_csv(csv_path)
            df = normalize_schema(df, data_type)
            dfs.append(df)
            total_rows += len(df)
        except Exception as e:
            print(f"Warning: Error reading {csv_path}: {e}")
            continue
    
    if not dfs:
        return {"status": "error", "reason": "No valid CSVs processed"}
    
    # Concatenate all dataframes
    combined_df = pl.concat(dfs, how="diagonal")
    
    # Save as Parquet
    combined_df.write_parquet(
        output_path,
        compression="snappy"
    )
    
    return {
        "status": "success",
        "output_path": str(output_path),
        "files_processed": len(csv_paths),
        "total_rows": total_rows,
        "final_rows": len(combined_df)
    }


def load_processed_dataset(name: str) -> Optional[pl.DataFrame]:
    """
    Load a processed Parquet file.
    
    Args:
        name: Dataset name (e.g., 'enrolment_clean', 'mvi_analytics')
    
    Returns:
        Polars DataFrame or None if file doesn't exist
    """
    parquet_path = PATHS["processed_dir"] / f"{name}.parquet"
    
    if not parquet_path.exists():
        return None
    
    return pl.read_parquet(parquet_path)


def get_processed_files() -> List[Dict]:
    """
    Get list of all processed Parquet files with metadata.
    """
    processed_dir = PATHS["processed_dir"]
    
    if not processed_dir.exists():
        return []
    
    files = []
    for parquet_file in processed_dir.glob("*.parquet"):
        try:
            df = pl.read_parquet(parquet_file)
            files.append({
                "name": parquet_file.stem,
                "path": str(parquet_file),
                "rows": len(df),
                "columns": len(df.columns),
                "size_mb": parquet_file.stat().st_size / (1024 * 1024)
            })
        except:
            continue
    
    return files


def copy_demo_data_to_manual():
    """
    Copy demo data to manual folder for processing.
    Used on first run when no data exists.
    """
    demodata_dir = PATHS["demodata_dir"]
    manual_dir = PATHS["manual_dir"]
    
    if not demodata_dir.exists():
        return {"status": "error", "reason": "Demo data directory not found"}
    
    copied_files = 0
    
    # Find all CSV files in demodata
    for csv_file in demodata_dir.rglob("*.csv"):
        try:
            # Classify the file
            file_type = classify_csv_by_content(csv_file)
            
            # Create target directory
            target_dir = manual_dir / file_type
            target_dir.mkdir(parents=True, exist_ok=True)
            
            # Copy file
            target_path = target_dir / csv_file.name
            if not target_path.exists():
                shutil.copy2(csv_file, target_path)
                copied_files += 1
                
        except Exception as e:
            print(f"Warning: Could not copy {csv_file}: {e}")
            continue
    
    return {
        "status": "success",
        "files_copied": copied_files
    }

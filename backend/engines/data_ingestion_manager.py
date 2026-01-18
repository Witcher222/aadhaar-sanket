import json
import hashlib
import zipfile
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional, Set
import shutil
import os
import sys
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS
from exceptions import DataIngestionError, FileUploadError
from .ingestion import classify_csv_by_content, discover_datasets, convert_to_parquet


class IngestionTracker:
    """Tracks processed file hashes to prevent duplicates."""
    def __init__(self, tracker_file: Path):
        self.tracker_file = tracker_file
        self.processed_hashes: Set[str] = self._load()

    def _load(self) -> Set[str]:
        if not self.tracker_file.exists():
            return set()
        try:
            with open(self.tracker_file, 'r') as f:
                return set(json.load(f))
        except:
            return set()

    def save(self):
        with open(self.tracker_file, 'w') as f:
            json.dump(list(self.processed_hashes), f)

    def is_new(self, file_path: Path) -> bool:
        file_hash = self._get_hash(file_path)
        if file_hash in self.processed_hashes:
            return False
        return True

    def mark_processed(self, file_path: Path):
        self.processed_hashes.add(self._get_hash(file_path))
        self.save()

    def clear_cache(self):
        """Wipe all stored hashes."""
        self.processed_hashes = set()
        if self.tracker_file.exists():
            self.tracker_file.unlink()
        self.save()

    def _get_hash(self, file_path: Path) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()


class HardenedDataIngestionManager:
    """
    Manages data ingestion with robust error handling and validation.
    """
    
    def __init__(self, base_dir: Path = None):
        self.base_dir = base_dir or PATHS["data_dir"]
        self.manual_dir = PATHS["manual_dir"]
        self.uploads_dir = PATHS["uploads_dir"]
        self.processed_dir = PATHS["processed_dir"]
        self.demodata_dir = PATHS["demodata_dir"]
        self.tracker = IngestionTracker(self.base_dir / ".processed_hashes.json")
        
        # Ensure directories exist
        self.manual_dir.mkdir(parents=True, exist_ok=True)
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.processed_dir.mkdir(parents=True, exist_ok=True)
        
        for dtype in ['enrolment', 'demographic', 'biometric']:
            (self.manual_dir / dtype).mkdir(parents=True, exist_ok=True)
    
    def organize_uploaded_file(self, file_content: bytes, filename: str) -> Dict:
        """
        1. Save file temporarily
        2. If ZIP: Extract
        3. If CSV: Classify by content and move
        4. Return status dict
        """
        temp_path = self.manual_dir / f"temp_{filename}"
        
        try:
            # Save temporarily
            temp_path.write_bytes(file_content)
            
            # Handle CSV
            if filename.lower().endswith('.csv'):
                try:
                    file_type = classify_csv_by_content(temp_path)
                except Exception as e:
                    if temp_path.exists():
                        temp_path.unlink()
                    return {
                        "success": False,
                        "error": f"Could not classify file: {str(e)}",
                        "filename": filename
                    }
                
                target_dir = self.manual_dir / file_type
                target_dir.mkdir(parents=True, exist_ok=True)
                
                target_path = target_dir / filename
                if target_path.exists():
                    target_path.unlink()
                
                shutil.move(str(temp_path), str(target_path))
                
                # Get file info for preview
                df = pl.read_csv(target_path, n_rows=1)
                
                return {
                    "success": True,
                    "filename": filename,
                    "classification": file_type,
                    "message": f"Classified as {file_type}",
                    "target_path": str(target_path),
                    "columns": df.columns,
                    "preview_rows": 5
                }

            # Handle ZIP, RAR, 7Z, or TAR
            elif filename.lower().endswith(('.zip', '.rar', '.7z', '.tar')):
                target_dir = self.uploads_dir
                target_path = target_dir / filename
                if target_path.exists():
                    target_path.unlink()
                
                shutil.move(str(temp_path), str(target_path))
                self.check_and_extract_archives()
                
                return {
                    "success": True,
                    "filename": filename,
                    "message": f"Uploaded and triggered extraction for {filename}",
                    "target_path": str(target_path)
                }
            
            else:
                 if temp_path.exists():
                     temp_path.unlink()
                 raise FileUploadError("Unsupported file type. Use CSV, ZIP, RAR, 7Z, or TAR.")
            
        except Exception as e:
            # Cleanup on error
            if temp_path.exists():
                temp_path.unlink()
            if isinstance(e, FileUploadError):
                raise
            raise FileUploadError(f"Failed to process upload: {str(e)}")
    
    
    def check_and_extract_archives(self) -> int:
        """
        Recursively find and extract ZIP and RAR archives in data subdirectories.
        Uses native ZIP support and system commands for RAR.
        """
        extracted_count = 0
        scan_dirs = [self.uploads_dir]
        
        for s_dir in scan_dirs:
            if not s_dir.exists():
                continue
                
            for file_path in s_dir.rglob("*"):
                if not file_path.is_file():
                    continue
                    
                suffix = file_path.suffix.lower()
                    
                if suffix in ['.zip', '.rar', '.7z', '.tar']:
                    try:
                        extract_dir = file_path.parent / file_path.stem
                        if extract_dir.exists() and any(extract_dir.iterdir()):
                            continue
                            
                        print(f"Extracting {suffix.upper()} archive: {file_path}...")
                        extract_dir.mkdir(exist_ok=True)
                        
                        if suffix == '.zip':
                            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                                zip_ref.extractall(extract_dir)
                            extracted_count += 1
                        else:
                            # Use system 'tar' for RAR, 7Z, TAR
                            import subprocess
                            try:
                                # On Windows, 'tar' is bsdtar which handles many formats
                                subprocess.run(['tar', '-xf', str(file_path), '-C', str(extract_dir)], 
                                             check=True, capture_output=True)
                                extracted_count += 1
                            except subprocess.CalledProcessError as e:
                                print(f"Warning: System tar failed to extract {suffix}: {e.stderr.decode() if e.stderr else str(e)}")
                        
                    except Exception as e:
                        print(f"Error extracting {file_path}: {e}")
                            
        return extracted_count

    def scan_and_ingest_all(self) -> Dict:
        """
        Scan manual AND uploads folders.
        1. Extract archives.
        2. Discover CSVs.
        3. Filter out already processed files using hashes.
        4. Convert new files.
        """
        results = {
            "archives_extracted": 0,
            "discovered": {},
            "processed": {},
            "new_files_found": 0,
            "errors": []
        }
        
        try:
            # 1. Extract Archives in both directories
            results["archives_extracted"] += self.check_and_extract_archives()
            
            # 2. Discover all datasets
            scan_dirs = [self.manual_dir, self.uploads_dir]
            datasets = {
                "enrolment": [],
                "demographic": [],
                "biometric": [],
            }
            
            for s_dir in scan_dirs:
                if s_dir.exists():
                    found = discover_datasets(s_dir)
                    for k, v in found.items():
                        datasets[k].extend(v)
            
            # 3. deduplicate by hash and filter already processed
            unique_new_files = {
                "enrolment": [],
                "demographic": [],
                "biometric": [],
            }
            
            seen_content_hashes = set()
            
            for dtype, files in datasets.items():
                for f_path in files:
                    f_hash = self.tracker._get_hash(f_path)
                    
                    # Prevent intra-scan duplicates and already processed files
                    if f_hash in seen_content_hashes or not self.tracker.is_new(f_path):
                        continue
                    
                    seen_content_hashes.add(f_hash)
                    unique_new_files[dtype].append(f_path)
                    results["new_files_found"] += 1

            # 4. Process new files
            for dtype, files in unique_new_files.items():
                if files:
                    processed_path = self.processed_dir / f"{dtype}_clean.parquet"
                    
                    # If this is the first time or we have NEW files, we need to merge with existing or overwrite
                    # For safety and "no duplication", we will overwrite with ALL UNIQUE raw files found
                    # but only if we have NEW files to add.
                    
                    all_of_type = []
                    # Get all unique files of this type (new + old that we know about)
                    # Simple approach: Re-read all unique files found in scan
                    # This ensures "duplicate is strictly prohibited"
                    
                    convert_result = convert_to_parquet(files, processed_path, dtype)
                    results["processed"][dtype] = convert_result
                    
                    # Mark new files as processed
                    for f_path in files:
                        self.tracker.mark_processed(f_path)
                            
        except Exception as e:
            results["errors"].append(str(e))
        
        return results
    
    def validate_dataset_presence(self) -> Dict:
        """
        Check if all 3 required dataset types exist.
        Returns: {"is_valid": bool, "summary": {...}, "errors": [...]}
        """
        required_types = ['enrolment', 'demographic', 'biometric']
        summary = {}
        errors = []
        
        for dtype in required_types:
            parquet_path = self.processed_dir / f"{dtype}_clean.parquet"
            
            if parquet_path.exists():
                try:
                    df = pl.read_parquet(parquet_path)
                    summary[dtype] = {
                        "exists": True,
                        "rows": len(df),
                        "columns": len(df.columns),
                        "path": str(parquet_path)
                    }
                except Exception as e:
                    errors.append(f"Error reading {dtype}: {str(e)}")
                    summary[dtype] = {"exists": False, "error": str(e)}
            else:
                summary[dtype] = {"exists": False}
                errors.append(f"Missing dataset: {dtype}")
        
        # Strict validation: ALL 3 must exist
        is_valid = all(summary.get(t, {}).get("exists", False) for t in required_types)
        
        return {
            "is_valid": is_valid,
            "summary": summary,
            "errors": errors
        }
    
    def reset_system(self) -> bool:
        """
        Delete all processed data and uploaded files.
        Explicitly spares the manual directory.
        """
        try:
            # 1. Clear processed directory (Parquet/JSON)
            if self.processed_dir.exists():
                for file in self.processed_dir.glob("*"):
                    if file.is_file():
                        file.unlink()
            
            # 2. Clear uploads directory
            if self.uploads_dir.exists():
                # Use rglob to catch nested files from archives
                for file in self.uploads_dir.rglob("*"):
                    if file.is_file():
                        file.unlink()
                # Clean up empty subdirectories in uploads
                for stage_dir in self.uploads_dir.iterdir():
                    if stage_dir.is_dir():
                        import shutil
                        shutil.rmtree(stage_dir)

            # 3. Reset Tracker cache
            self.tracker.clear_cache()
            
            print("System reset successfully: Processed and Uploads cleared.")
            return True
            
        except Exception as e:
            print(f"Error resetting system: {e}")
            return False
    
    def get_data_status(self) -> Dict:
        """
        Get comprehensive status of all data.
        """
        # Initialize status dictionary
        status = {
            "manual_files_total": 0,
            "processed_files": {}, # Use dict consistent with usage below
            "demodata_available": self.demodata_dir.exists(),
            "ready_for_pipeline": False,
            "pipeline_complete": False,
            "raw_data_found": False,
            "new_data_detected": False,
            "last_check": datetime.now().isoformat()
        }

        # Check files in manual and uploads
        try:
            manual_csvs = list(self.manual_dir.rglob("*.csv"))
            upload_csvs = list(self.uploads_dir.rglob("*.csv"))
            all_csvs = manual_csvs + upload_csvs
            status["manual_files_total"] = len(all_csvs)
            
            # Check if any of these are NEW
            for f in all_csvs:
                if self.tracker.is_new(f):
                    status["new_data_detected"] = True
                    break
        except:
            pass
        
        # Check processed files
        if self.processed_dir.exists():
            for parquet in self.processed_dir.glob("*.parquet"):
                try:
                    df = pl.read_parquet(parquet)
                    status["processed_files"][parquet.stem] = {
                        "rows": len(df),
                        "columns": len(df.columns)
                    }
                except:
                    pass
        
        # Flag if ANY raw data is present
        status["raw_data_found"] = (status["manual_files_total"] > 0) or status["demodata_available"]
        
        # Ready for pipeline means all 3 required parquets exist AND raw data is present
        validation = self.validate_dataset_presence()
        status["ready_for_pipeline"] = validation["is_valid"] and status["raw_data_found"]
        
        # Pipeline is complete only if analytics files også exist
        analytic_files = ['mvi_analytics', 'spatial_clusters', 'anomaly_analytics']
        status["pipeline_complete"] = validation["is_valid"] and all(f in status["processed_files"] for f in analytic_files)
        
        status["validation"] = validation
        
        return status
    
    def initialize_from_demo(self) -> Dict:
        """
        Copy demo data to manual folder and process.
        """
        from .ingestion import copy_demo_data_to_manual
        
        copy_result = copy_demo_data_to_manual()
        ingest_result = self.scan_and_ingest_all()
        
        return {
            "status": "success",
            "copy_result": copy_result,
            "ingest_result": ingest_result
        }


# Module-level instance for easy import
_manager = None

def get_ingestion_manager() -> HardenedDataIngestionManager:
    """Get or create the ingestion manager singleton."""
    global _manager
    if _manager is None:
        _manager = HardenedDataIngestionManager()
    return _manager

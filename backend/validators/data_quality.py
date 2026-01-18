"""
Aadhaar Sanket - Data Quality Validators
Validates data quality using statistical checks.
"""
import polars as pl
from pathlib import Path
from typing import Dict, List, Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import PATHS
from engines.ingestion import load_processed_dataset


class DataQualityValidator:
    """
    Data quality validation for Aadhaar Sanket datasets.
    """
    
    def __init__(self):
        self.validation_results = {}
        self.issues = []
    
    def validate_completeness(self, df: pl.DataFrame, required_columns: List[str]) -> Dict:
        """
        Check if all required columns are present and have data.
        """
        result = {
            "passed": True,
            "missing_columns": [],
            "null_percentages": {}
        }
        
        for col in required_columns:
            if col not in df.columns:
                result["passed"] = False
                result["missing_columns"].append(col)
            else:
                null_count = df.select(pl.col(col).is_null().sum()).item() or 0
                null_pct = (null_count / len(df)) * 100 if len(df) > 0 else 0
                result["null_percentages"][col] = round(null_pct, 2)
                
                if null_pct > 10:  # More than 10% nulls is concerning
                    result["passed"] = False
        
        return result
    
    def validate_data_types(self, df: pl.DataFrame, expected_types: Dict[str, str]) -> Dict:
        """
        Validate that columns have expected data types.
        """
        result = {
            "passed": True,
            "type_mismatches": []
        }
        
        for col, expected_type in expected_types.items():
            if col in df.columns:
                actual_type = str(df.schema[col])
                
                # Simplified type checking
                type_ok = False
                if expected_type == "numeric":
                    type_ok = "Int" in actual_type or "Float" in actual_type
                elif expected_type == "string":
                    type_ok = "Utf8" in actual_type or "String" in actual_type
                elif expected_type == "date":
                    type_ok = "Date" in actual_type or "Datetime" in actual_type
                
                if not type_ok:
                    result["type_mismatches"].append({
                        "column": col,
                        "expected": expected_type,
                        "actual": actual_type
                    })
                    result["passed"] = False
        
        return result
    
    def validate_value_ranges(self, df: pl.DataFrame, range_checks: Dict) -> Dict:
        """
        Validate that numeric values fall within expected ranges.
        """
        result = {
            "passed": True,
            "out_of_range": []
        }
        
        for col, (min_val, max_val) in range_checks.items():
            if col in df.columns:
                try:
                    col_min = df.select(pl.col(col).min()).item()
                    col_max = df.select(pl.col(col).max()).item()
                    
                    if col_min is not None and col_min < min_val:
                        result["out_of_range"].append({
                            "column": col,
                            "issue": f"Min value {col_min} < expected {min_val}"
                        })
                        result["passed"] = False
                    
                    if col_max is not None and col_max > max_val:
                        result["out_of_range"].append({
                            "column": col,
                            "issue": f"Max value {col_max} > expected {max_val}"
                        })
                        result["passed"] = False
                except:
                    pass
        
        return result
    
    def validate_uniqueness(self, df: pl.DataFrame, unique_columns: List[str]) -> Dict:
        """
        Check for duplicate values in columns that should be unique.
        """
        result = {
            "passed": True,
            "duplicates": {}
        }
        
        for col in unique_columns:
            if col in df.columns:
                total = len(df)
                unique = df.select(pl.col(col).n_unique()).item()
                
                if unique < total:
                    dup_count = total - unique
                    result["duplicates"][col] = dup_count
                    # Don't fail for duplicates, just report
        
        return result
    
    def validate_referential_integrity(
        self,
        df: pl.DataFrame,
        reference_df: pl.DataFrame,
        join_column: str
    ) -> Dict:
        """
        Check if all values in join column exist in reference dataset.
        """
        result = {
            "passed": True,
            "orphan_count": 0,
            "orphan_sample": []
        }
        
        if join_column not in df.columns or join_column not in reference_df.columns:
            result["passed"] = False
            result["error"] = "Join column not found"
            return result
        
        # Get unique values in each
        main_values = set(df.select(pl.col(join_column)).unique().to_series().to_list())
        ref_values = set(reference_df.select(pl.col(join_column)).unique().to_series().to_list())
        
        # Find orphans (values in main not in reference)
        orphans = main_values - ref_values
        
        if orphans:
            result["orphan_count"] = len(orphans)
            result["orphan_sample"] = list(orphans)[:10]
            # Don't fail for orphans, just report
        
        return result
    
    def run_full_validation(self) -> Dict:
        """
        Run comprehensive validation on all processed datasets.
        """
        validation_report = {
            "overall_status": "passed",
            "datasets": {},
            "summary": {
                "total_datasets": 0,
                "passed": 0,
                "failed": 0,
                "warnings": 0
            }
        }
        
        # Define validations for each dataset type
        validations = {
            "enrolment_clean": {
                "required_columns": ["state", "district", "date"],
                "expected_types": {"state": "string", "district": "string"},
                "range_checks": {}
            },
            "demographic_clean": {
                "required_columns": ["state", "district", "date"],
                "expected_types": {"state": "string", "district": "string"},
                "range_checks": {}
            },
            "biometric_clean": {
                "required_columns": ["state", "district", "date"],
                "expected_types": {"state": "string", "district": "string"},
                "range_checks": {}
            },
            "mvi_analytics": {
                "required_columns": ["geo_key", "state", "district", "mvi", "zone_type"],
                "expected_types": {"mvi": "numeric", "state": "string"},
                "range_checks": {"mvi": (0, 1000)}
            }
        }
        
        for dataset_name, checks in validations.items():
            df = load_processed_dataset(dataset_name)
            
            if df is None:
                validation_report["datasets"][dataset_name] = {
                    "status": "not_found",
                    "message": "Dataset not found"
                }
                continue
            
            validation_report["summary"]["total_datasets"] += 1
            
            dataset_result = {
                "status": "passed",
                "row_count": len(df),
                "column_count": len(df.columns),
                "checks": {}
            }
            
            # Run completeness check
            completeness = self.validate_completeness(
                df, checks.get("required_columns", [])
            )
            dataset_result["checks"]["completeness"] = completeness
            
            # Run type check
            type_check = self.validate_data_types(
                df, checks.get("expected_types", {})
            )
            dataset_result["checks"]["data_types"] = type_check
            
            # Run range check
            range_check = self.validate_value_ranges(
                df, checks.get("range_checks", {})
            )
            dataset_result["checks"]["value_ranges"] = range_check
            
            # Determine overall dataset status
            all_passed = all([
                completeness.get("passed", True),
                type_check.get("passed", True),
                range_check.get("passed", True)
            ])
            
            if all_passed:
                dataset_result["status"] = "passed"
                validation_report["summary"]["passed"] += 1
            else:
                dataset_result["status"] = "failed"
                validation_report["summary"]["failed"] += 1
                validation_report["overall_status"] = "failed"
            
            validation_report["datasets"][dataset_name] = dataset_result
        
        return validation_report


def run_data_validation() -> Dict:
    """
    Run full data validation and return report.
    """
    validator = DataQualityValidator()
    return validator.run_full_validation()


def get_data_quality_score() -> Dict:
    """
    Get simplified data quality score.
    """
    validation = run_data_validation()
    
    total = validation["summary"]["total_datasets"]
    passed = validation["summary"]["passed"]
    
    score = (passed / total * 100) if total > 0 else 0
    
    return {
        "score": round(score, 1),
        "total_datasets": total,
        "passed": passed,
        "failed": validation["summary"]["failed"],
        "status": validation["overall_status"]
    }

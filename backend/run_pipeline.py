"""
Aadhaar Sanket - Main Pipeline Orchestrator
Runs the complete analytics pipeline.
"""
import sys
from pathlib import Path
from datetime import datetime
import time

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent))

from config import PATHS, PIPELINE_CONFIG
from exceptions import PipelineError


def run_full_pipeline(initialize_demo: bool = True) -> dict:
    """
    Run the complete Aadhaar Sanket analytics pipeline.
    
    Pipeline Stages:
    1. Data Discovery & Ingestion
    2. Data Quality Validation (optional)
    3. Signal Separation
    4. MVI Calculation
    5. Spatial Analysis
    6. Anomaly Detection
    7. Trend Typology Analysis
    8. Acceleration Analysis
    9. Seasonality Detection
    10. Policy Mapping
    11. Insight Generation
    12. Metadata Finalization
    
    Args:
        initialize_demo: If True, copy demo data if no data exists
        
    Returns:
        dict with pipeline execution results
    """
    from engines.metadata_tracker import get_tracker, save_data_lineage
    
    tracker = get_tracker()
    tracker.start_pipeline()
    
    results = {
        "status": "running",
        "stages": {},
        "start_time": datetime.now().isoformat()
    }
    
    try:
        # =================================================================
        # Stage 1: Data Discovery & Ingestion
        # =================================================================
        print("Stage 1: Data Discovery & Ingestion...")
        stage_start = time.time()
        
        from engines.data_ingestion_manager import get_ingestion_manager
        from engines.ingestion import discover_datasets, convert_to_parquet
        
        manager = get_ingestion_manager()
        
        # Check if we need to initialize from demo data
        status = manager.get_data_status()
        
        if initialize_demo and not status["ready_for_pipeline"]:
            if status["demodata_available"]:
                print("  - Initializing from demo data...")
                init_result = manager.initialize_from_demo()
                results["stages"]["demo_init"] = init_result
        
        # Discover and ingest all datasets
        datasets = discover_datasets()
        
        rows_in = 0
        rows_out = 0
        
        for dtype, files in datasets.items():
            if files:
                output_path = PATHS["processed_dir"] / f"{dtype}_clean.parquet"
                convert_result = convert_to_parquet(files, output_path, dtype)
                rows_out += convert_result.get("final_rows", 0)
                rows_in += convert_result.get("total_rows", 0)
        
        stage_duration = time.time() - stage_start
        tracker.record_stage("data_ingestion", rows_in, rows_out, 0, {}, stage_duration)
        results["stages"]["data_ingestion"] = {
            "status": "completed",
            "datasets_found": {k: len(v) for k, v in datasets.items()},
            "rows_processed": rows_in,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Stage 2: Signal Separation
        # =================================================================
        print("Stage 2: Signal Separation...")
        stage_start = time.time()
        
        from engines.signal_separation import run_signal_separation
        
        signal_df = run_signal_separation()
        
        stage_duration = time.time() - stage_start
        tracker.record_stage("signal_separation", rows_out, len(signal_df), 0, {}, stage_duration)
        results["stages"]["signal_separation"] = {
            "status": "completed",
            "rows_output": len(signal_df),
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s ({len(signal_df)} regions)")
        
        # =================================================================
        # Stage 3: MVI Calculation
        # =================================================================
        print("Stage 3: MVI Calculation...")
        stage_start = time.time()
        
        from engines.mvi import run_mvi_calculation
        
        mvi_results = run_mvi_calculation()
        mvi_df = mvi_results.get("mvi_analytics")
        
        stage_duration = time.time() - stage_start
        mvi_rows = len(mvi_df) if mvi_df is not None else 0
        tracker.record_stage("mvi_calculation", len(signal_df), mvi_rows, 0, {}, stage_duration)
        results["stages"]["mvi_calculation"] = {
            "status": "completed",
            "rows_output": mvi_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s ({mvi_rows} regions with MVI)")
        
        # =================================================================
        # Stage 4: Spatial Analysis
        # =================================================================
        print("Stage 4: Spatial Analysis...")
        stage_start = time.time()
        
        from engines.spatial import run_spatial_analysis
        
        spatial_results = run_spatial_analysis()
        clusters_df = spatial_results.get("clusters")
        
        stage_duration = time.time() - stage_start
        cluster_count = len(clusters_df) if clusters_df is not None else 0
        tracker.record_stage("spatial_analysis", mvi_rows, cluster_count, 0, {}, stage_duration)
        results["stages"]["spatial_analysis"] = {
            "status": "completed",
            "clusters_found": cluster_count,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s ({cluster_count} clusters)")
        
        # =================================================================
        # Stage 5: Anomaly Detection
        # =================================================================
        print("Stage 5: Anomaly Detection...")
        stage_start = time.time()
        
        from engines.anomaly import run_anomaly_detection
        
        anomaly_df = run_anomaly_detection()
        
        anomaly_count = 0
        if anomaly_df is not None and len(anomaly_df) > 0:
            if 'is_anomaly' in anomaly_df.columns:
                anomaly_count = anomaly_df.filter(anomaly_df['is_anomaly'] == True).height
        
        stage_duration = time.time() - stage_start
        tracker.record_stage("anomaly_detection", mvi_rows, anomaly_count, 0, {}, stage_duration)
        results["stages"]["anomaly_detection"] = {
            "status": "completed",
            "anomalies_found": anomaly_count,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s ({anomaly_count} anomalies)")
        
        # =================================================================
        # Stage 6: Trend Typology
        # =================================================================
        print("Stage 6: Trend Typology...")
        stage_start = time.time()
        
        from engines.trend_typology import run_trend_typology
        
        typology_df = run_trend_typology()
        
        stage_duration = time.time() - stage_start
        typology_rows = len(typology_df) if typology_df is not None else 0
        tracker.record_stage("trend_typology", mvi_rows, typology_rows, 0, {}, stage_duration)
        results["stages"]["trend_typology"] = {
            "status": "completed",
            "rows_output": typology_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Stage 7: Acceleration Analysis
        # =================================================================
        print("Stage 7: Acceleration Analysis...")
        stage_start = time.time()
        
        from engines.acceleration import run_acceleration_analysis
        
        accel_df = run_acceleration_analysis()
        
        stage_duration = time.time() - stage_start
        accel_rows = len(accel_df) if accel_df is not None else 0
        tracker.record_stage("acceleration", mvi_rows, accel_rows, 0, {}, stage_duration)
        results["stages"]["acceleration"] = {
            "status": "completed",
            "rows_output": accel_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Stage 8: Seasonality Detection
        # =================================================================
        print("Stage 8: Seasonality Detection...")
        stage_start = time.time()
        
        from engines.seasonality import run_seasonality_detection
        
        season_df = run_seasonality_detection()
        
        stage_duration = time.time() - stage_start
        season_rows = len(season_df) if season_df is not None else 0
        tracker.record_stage("seasonality", mvi_rows, season_rows, 0, {}, stage_duration)
        results["stages"]["seasonality"] = {
            "status": "completed",
            "months_analyzed": season_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Stage 9: Policy Mapping
        # =================================================================
        print("Stage 9: Policy Mapping...")
        stage_start = time.time()
        
        from engines.policy_mapper import run_policy_mapping
        
        policy_df = run_policy_mapping()
        
        stage_duration = time.time() - stage_start
        policy_rows = len(policy_df) if policy_df is not None else 0
        tracker.record_stage("policy_mapping", typology_rows, policy_rows, 0, {}, stage_duration)
        results["stages"]["policy_mapping"] = {
            "status": "completed",
            "recommendations": policy_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s ({policy_rows} recommendations)")
        
        # =================================================================
        # Stage 10: Insight Generation
        # =================================================================
        print("Stage 10: Insight Generation...")
        stage_start = time.time()
        
        from engines.insight_generator import run_insight_generation
        
        insights_df = run_insight_generation()
        
        stage_duration = time.time() - stage_start
        insight_rows = len(insights_df) if insights_df is not None else 0
        tracker.record_stage("insight_generation", mvi_rows, insight_rows, 0, {}, stage_duration)
        results["stages"]["insight_generation"] = {
            "status": "completed",
            "insights_generated": insight_rows,
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Stage 11: Finalization
        # =================================================================
        print("Stage 11: Finalization...")
        stage_start = time.time()
        
        # Save data lineage
        save_data_lineage()
        
        # Complete pipeline tracking
        tracker.complete_pipeline()
        
        stage_duration = time.time() - stage_start
        results["stages"]["finalization"] = {
            "status": "completed",
            "duration": round(stage_duration, 2)
        }
        print(f"  - Completed in {stage_duration:.2f}s")
        
        # =================================================================
        # Final Summary
        # =================================================================
        results["status"] = "completed"
        results["end_time"] = datetime.now().isoformat()
        
        total_duration = sum(s.get("duration", 0) for s in results["stages"].values())
        results["total_duration"] = round(total_duration, 2)
        
        print(f"\n✓ Pipeline completed successfully in {total_duration:.2f}s")
        print(f"  - {mvi_rows} regions analyzed")
        print(f"  - {cluster_count} clusters identified")
        print(f"  - {anomaly_count} anomalies detected")
        print(f"  - {policy_rows} policy recommendations generated")
        
        return results
        
    except Exception as e:
        tracker.record_error("pipeline", str(e))
        tracker.complete_pipeline()
        
        results["status"] = "failed"
        results["error"] = str(e)
        results["end_time"] = datetime.now().isoformat()
        
        print(f"\n✗ Pipeline failed: {e}")
        raise PipelineError(f"Pipeline execution failed: {e}")


def get_pipeline_status() -> dict:
    """
    Get the status of the last pipeline run.
    """
    from engines.metadata_tracker import MetadataTracker
    
    metadata = MetadataTracker.load()
    
    if metadata.get("status") == "not_found":
        return {
            "status": "not_run",
            "message": "Pipeline has not been run yet"
        }
    
    return {
        "status": metadata.get("status", "unknown"),
        "run_timestamp": metadata.get("run_timestamp"),
        "total_duration": metadata.get("total_duration_seconds"),
        "stages": metadata.get("stages", {}),
        "errors": metadata.get("errors", [])
    }


if __name__ == "__main__":
    print("=" * 60)
    print("Aadhaar Sanket Analytics Pipeline")
    print("=" * 60)
    print()
    
    try:
        results = run_full_pipeline(initialize_demo=True)
        print()
        print("Pipeline Results:")
        print(f"  Status: {results['status']}")
        print(f"  Duration: {results['total_duration']}s")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

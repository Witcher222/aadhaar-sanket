"""
Aadhaar Sanket Backend - Global Configuration
Contains all weights, thresholds, and settings for the analytics pipeline.
"""
from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables
# =============================================================================
# PATH CONFIGURATION
# =============================================================================
BASE_DIR = Path(__file__).parent
ROOT_DIR = BASE_DIR.parent

# Load environment variables from ROOT directory
load_dotenv(ROOT_DIR / ".env")

PATHS = {
    "data_dir": ROOT_DIR / "data",
    "manual_dir": ROOT_DIR / "data" / "manual",
    "uploads_dir": ROOT_DIR / "data" / "uploads",
    "processed_dir": ROOT_DIR / "data" / "processed",
    "demodata_dir": ROOT_DIR / "data" / "demo",
}

# =============================================================================
# SIGNAL SEPARATION WEIGHTS
# =============================================================================
# These weights determine how much each type of update contributes to migration signal
SIGNAL_WEIGHTS = {
    # Demographic updates (address changes = strong migration signal)
    "demographic_adult": 1.0,      # Adult address change = definite migration
    "demographic_youth": 0.6,      # Youth update (age 5-17) = family migration
    "demographic_child": 0.4,      # Child update = weaker signal
    
    # Biometric updates (mandatory re-enrollment = noise)
    "biometric_adult": 0.3,        # Adult biometric = low signal (could be renewal)
    "biometric_child_5": 0.1,      # Age 5 mandatory update = noise
    "biometric_child_15": 0.1,     # Age 15 mandatory update = noise
}

# Age thresholds for classification
AGE_THRESHOLDS = {
    "child": 5,       # 0-5 years
    "youth": 17,      # 5-17 years
    "adult": 18       # 18+ years
}

# =============================================================================
# MVI (MIGRATION VELOCITY INDEX) CONFIGURATION
# =============================================================================
MVI_THRESHOLDS = {
    "stable": 5,           # MVI < 5 = stable zone
    "moderate": 15,        # 5 <= MVI < 15 = moderate inflow
    "elevated": 30,        # 15 <= MVI < 30 = elevated inflow
    # MVI >= 30 = high inflow
}

# Zone type names
ZONE_TYPES = {
    "stable": "stable",
    "moderate_inflow": "moderate_inflow",
    "elevated_inflow": "elevated_inflow",
    "high_inflow": "high_inflow",
}

# Confidence thresholds based on population
CONFIDENCE_THRESHOLDS = {
    "high": 100000,        # population > 100K = high confidence
    "medium": 50000,       # 50K < population <= 100K = medium confidence
    # population <= 50K = low confidence
}

# =============================================================================
# ANOMALY DETECTION CONFIGURATION
# =============================================================================
ANOMALY_CONFIG = {
    "rolling_window": 30,           # Days for rolling statistics
    "z_threshold_critical": 4.0,    # |z| > 4.0 = CRITICAL
    "z_threshold_high": 3.0,        # |z| > 3.0 = HIGH
    "z_threshold_medium": 2.0,      # |z| > 2.0 = MEDIUM
    "z_threshold_low": 1.5,         # |z| > 1.5 = LOW
}

# Anomaly type definitions
ANOMALY_TYPES = {
    "SPIKE": "Sudden increase in activity",
    "DROP": "Sudden decrease in activity",
    "STRUCTURAL": "Sustained deviation from baseline",
    "TRANSIENT": "Isolated single-day event",
}

# =============================================================================
# TREND CLASSIFICATION CONFIGURATION
# =============================================================================
TREND_CONFIG = {
    "slope_high": 2.0,              # High growth slope
    "slope_moderate": 1.0,          # Moderate growth slope
    "slope_decline": -0.5,          # Decline slope
    "variance_high": 10.0,          # High variance = volatile
    "variance_low": 2.0,            # Low variance = stable
    "acceleration_threshold": 0.5,  # Acceleration indicator
}

# Trend type definitions
TREND_TYPES = {
    "persistent_inflow": {
        "description": "Steady, predictable growth pattern",
        "priority": "HIGH",
        "action": "Infrastructure planning required"
    },
    "emerging_inflow": {
        "description": "Accelerating growth pattern",
        "priority": "HIGH",
        "action": "Prepare for increased demand"
    },
    "volatile": {
        "description": "Erratic, unpredictable changes",
        "priority": "MEDIUM",
        "action": "Deploy real-time monitoring"
    },
    "reversal": {
        "description": "Trend reversal detected",
        "priority": "MEDIUM",
        "action": "Investigate cause of reversal"
    },
    "stable": {
        "description": "Minimal demographic change",
        "priority": "LOW",
        "action": "Continue normal operations"
    },
}

# =============================================================================
# POLICY MAPPING CONFIGURATION
# =============================================================================
POLICY_MAPPINGS = {
    "persistent_inflow": {
        "priority": "HIGH",
        "action_type": "infrastructure",
        "primary_action": "Augment Urban Infrastructure",
        "reasoning": "Sustained population growth requires expanded public services"
    },
    "emerging_inflow": {
        "priority": "HIGH",
        "action_type": "social_program", 
        "primary_action": "Expand Healthcare & Social Services",
        "reasoning": "Growing population putting strain on local health systems"
    },
    "moderate_inflow": {
        "priority": "MEDIUM",
        "action_type": "education",
        "primary_action": "Increase School Capacity",
        "reasoning": "Moderate growth requires long-term educational planning"
    },
    "volatile": {
        "priority": "MEDIUM",
        "action_type": "governance",
        "primary_action": "Employment & Labor Monitoring",
        "reasoning": "Erratic migration patterns affect local labor markets"
    },
    "reversal": {
        "priority": "MEDIUM",
        "action_type": "transport",
        "primary_action": "Optimize Transport Networks",
        "reasoning": "Shift in migration flow requires transport logistic review"
    },
    "stable": {
        "priority": "LOW",
        "action_type": "maintenance",
        "primary_action": "Continue Standard Operations",
        "reasoning": "Stable zone requires no immediate intervention"
    },
    "high_inflow": {
        "priority": "CRITICAL",
        "action_type": "emergency",
        "primary_action": "Initiate Emergency Planning Cell",
        "reasoning": "Extreme demographic pressure detected"
    },
}

# =============================================================================
# CSV CLASSIFICATION INDICATORS
# =============================================================================
# Column patterns to identify dataset type (case-insensitive)
ENROLMENT_INDICATORS = [
    'enrol', 'aadhaar_generated', 'age_0_5', 'age_5_17', 'age_18', 
    'total_enrolment', 'age_0_5', 'age_5_10'
]

DEMOGRAPHIC_INDICATORS = [
    'demo', 'demo_age', 'address_update', 'name_update', 'dob_update', 
    'mobile_update', 'demographic'
]

BIOMETRIC_INDICATORS = [
    'bio', 'bio_age', 'fingerprint', 'iris', 'photo_update', 'biometric'
]

# =============================================================================
# API CONFIGURATION
# =============================================================================
API_CONFIG = {
    "title": "Aadhaar Sanket API",
    "description": "Backend API for Aadhaar Sanket Demographic Intelligence Dashboard",
    "version": "1.0.0",
    "cors_origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "*"],
}

# =============================================================================
# AI CONFIGURATION
# =============================================================================
AI_CONFIG = {
    # Prioritizing models with available capacity (lite models have 10 RPM)
    "model_name": "gemini-2.5-flash-lite", 
    "fallback_models": [
        "gemini-3-flash-preview", 
        "gemini-2.0-flash-lite", 
        "gemini-1.5-flash",
        "gemini-2.0-flash"
    ],
    "max_tokens": 2048,
    "temperature": 0.7,
}

# Get Gemini API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Get UIDAI API key from environment
UIDAI_API_KEY = os.getenv("UIDAI_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")

# =============================================================================
# PIPELINE CONFIGURATION
# =============================================================================
PIPELINE_CONFIG = {
    "version": "1.0.0",
    "stages": [
        "data_discovery",
        "data_ingestion",
        "signal_separation",
        "mvi_calculation",
        "spatial_analysis",
        "anomaly_detection",
        "trend_typology",
        "acceleration_analysis",
        "seasonality_detection",
        "policy_mapping",
        "insight_generation",
        "metadata_finalization",
    ]
}

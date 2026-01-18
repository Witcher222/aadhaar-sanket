# Aadhaar Sanket - System Architecture

## Overview

Aadhaar Sanket is a Demographic Intelligence Dashboard that processes Aadhaar enrollment and update data to detect migration patterns, identify high-pressure zones, and generate actionable policy recommendations.

## Technology Stack

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        React["React + TypeScript"]
        Vite["Vite Build Tool"]
        TailwindCSS["TailwindCSS"]
        Recharts["Recharts Visualization"]
    end
    
    subgraph Backend["Backend Layer"]
        FastAPI["FastAPI Server"]
        Uvicorn["Uvicorn ASGI"]
    end
    
    subgraph Processing["Data Processing"]
        Polars["Polars DataFrames"]
        DuckDB["DuckDB Analytics"]
        NumPy["NumPy/SciPy Stats"]
    end
    
    subgraph AI["AI Layer"]
        Gemini["Google Gemini Pro"]
    end
    
    subgraph Storage["Data Storage"]
        CSV["Raw CSVs"]
        Parquet["Parquet Files"]
        JSON["Metadata JSON"]
    end
    
    React --> FastAPI
    FastAPI --> Polars
    FastAPI --> Gemini
    Polars --> Parquet
    CSV --> Polars
```

## Component Details

### Frontend (React + TypeScript)

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build & Dev Server |
| TailwindCSS | Styling |
| Recharts | Data Visualization |
| React Router | Navigation |

### Backend (Python FastAPI)

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API Framework |
| Uvicorn | ASGI Server |
| Polars | High-performance DataFrames |
| NumPy/SciPy | Statistical Calculations |
| Google Generative AI | AI Insights |

## Data Pipeline Architecture

```mermaid
flowchart TD
    subgraph Input["Data Input"]
        CSV1["Enrolment CSVs"]
        CSV2["Demographic CSVs"]
        CSV3["Biometric CSVs"]
    end
    
    subgraph Stage1["Stage 1: Ingestion"]
        Classify["Classify by Content"]
        Normalize["Schema Normalization"]
        Convert["Parquet Conversion"]
    end
    
    subgraph Stage2["Stage 2: Signal Processing"]
        Signal["Signal Separation"]
        Weights["Apply Weight Matrix"]
    end
    
    subgraph Stage3["Stage 3: MVI Calculation"]
        MVI["Migration Velocity Index"]
        Zone["Zone Classification"]
    end
    
    subgraph Stage4["Stage 4: Analytics"]
        Spatial["Spatial Clustering"]
        Anomaly["Anomaly Detection"]
        Trend["Trend Typology"]
        Accel["Acceleration"]
    end
    
    subgraph Stage5["Stage 5: Insights"]
        Policy["Policy Mapping"]
        Insight["Insight Generation"]
    end
    
    CSV1 --> Classify
    CSV2 --> Classify
    CSV3 --> Classify
    Classify --> Normalize
    Normalize --> Convert
    Convert --> Signal
    Signal --> Weights
    Weights --> MVI
    MVI --> Zone
    Zone --> Spatial
    Zone --> Anomaly
    Zone --> Trend
    Zone --> Accel
    Spatial --> Policy
    Anomaly --> Policy
    Trend --> Policy
    Accel --> Policy
    Policy --> Insight
```

## Engine Specifications

### 1. Data Ingestion Engine

**Purpose:** Classify CSVs by content and convert to optimized Parquet format.

**Classification Logic:**
```
ENROLMENT_INDICATORS: ['age_0_5', 'age_5_17', 'age_18']
DEMOGRAPHIC_INDICATORS: ['demo_age', 'demo_']  
BIOMETRIC_INDICATORS: ['bio_age', 'bio_']
```

**Output:** `*_clean.parquet` files in `/processed/`

### 2. Signal Separation Engine

**Purpose:** Separate meaningful migration signals from administrative noise.

**Weight Matrix:**
```
┌──────────────────────┬────────┬─────────────────────────────┐
│ Signal Type          │ Weight │ Reasoning                   │
├──────────────────────┼────────┼─────────────────────────────┤
│ demographic_adult    │ 1.0    │ Address change = migration  │
│ demographic_youth    │ 0.6    │ Family migration indicator  │
│ demographic_child    │ 0.4    │ Weaker signal               │
│ biometric_adult      │ 0.3    │ Could be renewal            │
│ biometric_child_5    │ 0.1    │ Mandatory update = noise    │
│ biometric_child_15   │ 0.1    │ Mandatory update = noise    │
└──────────────────────┴────────┴─────────────────────────────┘
```

**Formula:**
```
organic_signal = Σ(update_count × weight) for each geo_key
```

### 3. MVI Calculation Engine

**Purpose:** Calculate the Migration Velocity Index - the primary metric.

**Formula:**
```
MVI = (Signal-Adjusted Updates / Total Population Base) × 1000
```

**Zone Classification:**
```
┌───────────────────┬────────────┬─────────────────────────┐
│ Zone Type         │ MVI Range  │ Interpretation          │
├───────────────────┼────────────┼─────────────────────────┤
│ stable            │ < 5        │ Minimal change          │
│ moderate_inflow   │ 5 - 15     │ Normal activity         │
│ elevated_inflow   │ 15 - 30    │ Increased pressure      │
│ high_inflow       │ ≥ 30       │ Critical pressure       │
└───────────────────┴────────────┴─────────────────────────┘
```

**Confidence Levels:**
- High: population > 100,000
- Medium: 50,000 < population ≤ 100,000
- Low: population ≤ 50,000

### 4. Anomaly Detection Engine

**Purpose:** Detect statistical anomalies using rolling z-scores.

**Formula:**
```
z_score = (current_value - rolling_mean) / rolling_std
```

**Severity Classification:**
```
┌──────────┬──────────────┬─────────────────────────┐
│ Severity │ Z-Score      │ Action Required         │
├──────────┼──────────────┼─────────────────────────┤
│ CRITICAL │ |z| > 4.0    │ Immediate attention     │
│ HIGH     │ |z| > 3.0    │ Priority investigation  │
│ MEDIUM   │ |z| > 2.0    │ Monitor closely         │
│ LOW      │ |z| > 1.5    │ Track for patterns      │
└──────────┴──────────────┴─────────────────────────┘
```

**Anomaly Types:**
- SPIKE: z > 3 (sudden increase)
- DROP: z < -3 (sudden decrease)
- STRUCTURAL: sustained deviation > 3 consecutive periods
- TRANSIENT: isolated single-period event

### 5. Trend Typology Engine

**Purpose:** Classify regions into behavioral archetypes.

**Classification Logic:**
```
┌────────────────────┬─────────────────────────────────────────┐
│ Trend Type         │ Condition                               │
├────────────────────┼─────────────────────────────────────────┤
│ persistent_inflow  │ slope > 2.0 AND variance < 2.0          │
│ emerging_inflow    │ slope > 1.0 AND acceleration > 0.5      │
│ volatile           │ variance > 10.0                         │
│ reversal           │ slope < -0.5 AND previous_slope > 0.5   │
│ stable             │ |slope| < 0.5 AND variance < 2.0        │
└────────────────────┴─────────────────────────────────────────┘
```

### 6. Acceleration Engine

**Purpose:** Measure rate of change in migration patterns.

**Formula:**
```
acceleration = recent_slope - historical_slope

Where:
  recent_slope = regression over last 30% of data
  historical_slope = regression over first 70% of data
```

**Status Classification:**
- accelerating: acceleration > 0.5
- stable: -0.5 ≤ acceleration ≤ 0.5
- decelerating: acceleration < -0.5

### 7. Policy Mapper Engine

**Purpose:** Map analytics to actionable policy recommendations.

**Mapping Matrix:**
```
┌────────────────────┬──────────┬─────────────────────────────────┐
│ Pattern            │ Priority │ Primary Action                  │
├────────────────────┼──────────┼─────────────────────────────────┤
│ high_inflow        │ CRITICAL │ Initiate Emergency Planning     │
│ persistent_inflow  │ HIGH     │ Augment Urban Infrastructure    │
│ emerging_inflow    │ HIGH     │ Capacity Expansion Planning     │
│ volatile           │ MEDIUM   │ Deploy Real-time Monitoring     │
│ reversal           │ MEDIUM   │ Commission Detailed Analysis    │
│ stable             │ LOW      │ Continue Standard Operations    │
└────────────────────┴──────────┴─────────────────────────────────┘
```

## API Architecture

```mermaid
graph LR
    subgraph Client
        React["React Frontend"]
    end
    
    subgraph Gateway
        CORS["CORS Middleware"]
        FastAPI["FastAPI Router"]
    end
    
    subgraph Routes
        Overview["/api/overview"]
        Upload["/api/upload"]
        Migration["/api/migration"]
        Trends["/api/trends"]
        Spatial["/api/spatial"]
        Alerts["/api/alerts"]
        Map["/api/map"]
        Policy["/api/policy"]
        Trust["/api/trust"]
        AI["/api/ai"]
        Report["/api/report"]
    end
    
    subgraph Engines
        Ingestion["Ingestion Engine"]
        Signal["Signal Engine"]
        MVIEngine["MVI Engine"]
        AnomalyEngine["Anomaly Engine"]
    end
    
    React --> CORS
    CORS --> FastAPI
    FastAPI --> Overview
    FastAPI --> Upload
    FastAPI --> Migration
    FastAPI --> Trends
    FastAPI --> Spatial
    FastAPI --> Alerts
    FastAPI --> Map
    FastAPI --> Policy
    FastAPI --> Trust
    FastAPI --> AI
    FastAPI --> Report
    
    Upload --> Ingestion
    Migration --> MVIEngine
    Alerts --> AnomalyEngine
```

## Data Schema

### Input Data (CSV)

**Enrolment Data:**
```
date, state, district, pincode, age_0_5, age_5_17, age_18_greater
```

**Demographic Data:**
```
date, state, district, pincode, demo_age_5_17, demo_age_17_
```

**Biometric Data:**
```
date, state, district, pincode, bio_age_5_17, bio_age_17_
```

### Output Data (Parquet)

**mvi_analytics.parquet:**
```
geo_key, state, district, mvi, zone_type, confidence,
population_base, organic_signal, raw_updates, noise_ratio
```

**typology_analytics.parquet:**
```
geo_key, state, district, mvi, slope, variance, acceleration,
trend_type, zone_type, confidence, explanation
```

**policy_recommendations.parquet:**
```
geo_key, state, district, mvi, zone_type, trend_type,
priority, action_type, primary_action, reasoning
```

## AI Integration

```mermaid
sequenceDiagram
    participant User
    participant API
    participant AI Engine
    participant Gemini
    participant Data
    
    User->>API: POST /api/ai/ask
    API->>AI Engine: Process Query
    AI Engine->>Data: Load Context
    Data-->>AI Engine: Analytics Data
    AI Engine->>Gemini: Query + Context
    Gemini-->>AI Engine: Response
    AI Engine-->>API: Formatted Response
    API-->>User: AI Insight
```

**AI Capabilities:**
- Natural language queries about data
- Region-specific trend explanations
- Executive summary generation
- Policy recommendation enhancement

## Deployment Architecture

```mermaid
graph TB
    subgraph Development
        DevFrontend["npm run dev :5173"]
        DevBackend["uvicorn --reload :8000"]
    end
    
    subgraph Production
        Frontend["React Build"]
        Nginx["Nginx Reverse Proxy"]
        Uvicorn["Uvicorn Workers"]
        Backend["FastAPI"]
    end
    
    subgraph Storage
        Parquet["Parquet Files"]
        Metadata["metadata.json"]
    end
    
    DevFrontend --> DevBackend
    Frontend --> Nginx
    Nginx --> Uvicorn
    Uvicorn --> Backend
    Backend --> Parquet
    Backend --> Metadata
```

## Performance Considerations

1. **Polars over Pandas**: 10-100x faster for large datasets
2. **Parquet Format**: Columnar storage with compression
3. **Lazy Evaluation**: Polars query optimization
4. **Caching**: Processed data cached in Parquet
5. **Async API**: Non-blocking request handling

## Security Features

1. **CORS Configuration**: Restricted origins
2. **Input Validation**: Pydantic models
3. **Error Handling**: Custom exceptions
4. **Environment Variables**: Sensitive data protection
5. **No Raw SQL**: ORM/DataFrame operations only

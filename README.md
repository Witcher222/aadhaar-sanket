# Aadhaar Sanket - Demographic Intelligence Platform
## UIDAI Data Hackathon 2026 Submission
### Real-time migration analytics and demographic intelligence system for India

---

## 📂 Step 1: Upload Data (Most Important)

Before using the platform, you **must** load the UIDAI dataset. Choose one of the methods below:

### Method 1: Upload via Frontend (Recommended)
1. **Launch the application** (see [Step 2](#-step-2-installation--running-locally) below).
2. Click **Get Started** on the home page.
3. Go to the **Data Ingestion** section in the left sidebar.
4. **Upload your file** (supported formats: `.csv`, `.zip`, `.rar`, `.7z`, `.tar`).
5. Click the **"Run Analytics Pipeline"** button.
6. Wait for the pipeline completion animation.
7. Navigate to any dashboard section to view your results.

### Method 2: Manual Upload (Alternative)

**Steps:**
1. Navigate to: `code` → `data` → `manual`.
2. You will find a **pre-included ZIP file** containing the UIDAI hackathon dataset.
3. **Extract the ZIP file** directly into the same folder (`data/manual/`).
   - *Ensure the extracted files are in `.csv` format.*
4. **Launch the application** (see [Step 2](#-step-2-installation--running-locally) below).
5. The system will auto-detect the files. You can also click **"Scan & Ingest"** or **"Run Analytics Pipeline"** in the Data Ingestion page.

> 💡 **Tip:** You can also directly copy-paste any `.csv` files into the `data/manual/` folder.

---

### 🌐 Fetch from UIDAI API
There is also a **"Fetch from UIDAI"** button in the Data Ingestion page which fetches live data from the API.

To enable this feature, create a `.env` file in the root directory and add the following API key exactly as shown:

```env
UIDAI_API_KEY=579b464db66ec23bdd000001fa2f30e9b08e44b74594d3bb9c31f254
```

---

## 🤖 To Enable AI Features

1. Create a `.env` file in the root folder (if not already present).
2. Copy-paste the following content:

```env
GEMINI_API_KEY=AIzaSyCQnkYCLBruXd0QwlUomRnlCBS4U81b0LY
```

> ⚠️ **Note:** Make sure not to exceed the API rate limit. You can also paste your own Gemini API key if needed.

---

## 🚀 Step 2: Installation & Running Locally

We have simplified the process into a single command for Windows users.

### Method 1: The Easy Way (Windows)

1. Open your terminal or file explorer in the `code/` directory.
2. Run the startup script:
   ```powershell
   .\start.bat
   ```
   *Or simply double-click the `start.bat` file.*

> **What this does:**
> - Automatically detects or creates a Python virtual environment (`.venv`).
> - Activates the environment.
> - Installs all dependencies from `requirements.txt`.
> - Starts the **Backend Server** (Port 8000).
> - Starts the **Frontend Interface** (Port 5173).

---

### Method 2: Manual Setup

If you prefer to run things manually or are on Mac/Linux:

**1. Backend Setup**
```bash
# Create and activate virtual environment
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Backend
cd backend
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**2. Frontend Setup**
```bash
# Open a new terminal
# Install dependencies
npm install

# Run Frontend
npm run dev
```

---

## 📁 Project Structure

```text
code/
├── 📁 backend/
│   ├── 📁 api/            ← FastAPI Routes & Endpoints
│   └── 📁 engines/        ← Core Analytics Logic (MVI, Trends, AI)
├── 📁 data/
│   ├── 📁 manual/         ← Drop CSV/ZIP files here (Auto-detected)
│   └── 📁 processed/      ← System generated analytics cache
├── 📁 src/
│   ├── 📁 components/     ← Reusable UI Components
│   ├── 📁 pages/          ← Dashboard Pages (React)
│   └── 📁 utils/          ← Helper functions (PDF Export, Formatting)
├── 📄 start.bat           ← One-click Launcher
├── 📄 requirements.txt    ← Python Dependencies
└── 📄 package.json        ← Frontend Dependencies
```

---

## 📊 Platform Overview

### Problem Statement
India lacks a real-time system to track internal migration pressure, identify emerging demographic hotspots, and inform evidence-based policy decisions. Traditional census data is delayed; administrative data is noisy.

### Our Solution
**Aadhaar Sanket** transforms official UIDAI datasets into actionable demographic intelligence:

| Feature | Description |
| :--- | :--- |
| **Migration Velocity Index (MVI)** | Quantified migration pressure metric tracking movement intensity. |
| **Trend Analysis** | Acceleration, persistence, and seasonality detection engines. |
| **Predictive Alerts**| Early warning system for emerging stress hotspots. |
| **AI Assistant** | Natural language query interface powered by Google Gemini. |
| **100% Explainable** | No black box algorithms; full transparency in calculations. |

### Dashboard Pages

| Page | Description |
| :--- | :--- |
| **National Overview** | High-level metrics, migration velocity map, and summary stats. |
| **Data Ingestion** | Upload files, scan manual folders, and trigger analytics pipelines. |
| **Migration Patterns** | Interactive flow analysis and state-to-state movement tracking. |
| **Trends Analysis** | Temporal trends, forecasting, and historical data comparison. |
| **Advanced Insights** | Hidden migration detection, seasonal nomad tracking, and policy simulation. |
| **Spatial Stress Map** | 3D visual density mapping of high-stress zones. |
| **Forecasts & Alerts** | Predictive models for future resource allocation. |
| **Reports** | Generate PDF/HTML reports and AI-driven executive summaries. |

---

## 🛠️ Technical Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons |
| **Backend** | Python 3.11+, FastAPI, Uvicorn |
| **Data Engine** | Polars (High-Performance DataFrame), NumPy |
| **AI Integration** | Google Gemini Pro (via LangChain/Direct API) |
| **Infrastructure** | Docker Support, Background Tasks (AsyncIO) |

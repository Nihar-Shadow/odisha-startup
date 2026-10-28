# 🤖 Jal Rakshak AI Service: Predictive Hydrology & Disaster Intelligence
### High-Performance Python Intelligence Microservice (FastAPI + HydroML + Vision)

[![Service Status](https://img.shields.io/badge/Service-Operational-2563EB.svg)](#)
[![Framework](https://img.shields.io/badge/Framework-FastAPI%20%2B%20Uvicorn-009688.svg)](#)
[![Python Version](https://img.shields.io/badge/Python-3.10%2B-3776AB.svg)](#)
[![API Documentation](https://img.shields.io/badge/OpenAPI-Swagger%20%2B%20ReDoc-85EA2D.svg)](#)
[![Provenance](https://img.shields.io/badge/Data%20Provenance-Calibrated%20Tiered-blueviolet.svg)](#)

---

## 📌 Overview

The **Jal Rakshak AI Microservice** is a specialized computational engine providing hydro-meteorological forecasting, multi-factor emergency triage scoring, computer vision flood depth analysis, and multilingual disaster safety guidance. Designed to operate alongside the Node.js EOC backend, it serves as the algorithmic foundation for the **PS-074 Ganjam District Emergency Operations Center (EOC) Platform**.

The microservice ingests live atmospheric parameters from Open-Meteo APIs, computes soil saturation and catchment runoff projections, evaluates vulnerable demographic concentrations, and generates safe vehicular and pedestrian routing paths that actively avoid flooded terrain.

---

## ⚡ Core Intelligence Endpoints

### 1. Predictive Hydrodynamic Flood Risk (`POST /predict/flood`)
- **Input**: Latitude/Longitude coordinates or basin location, rainfall forecast ($mm$), soil saturation percentage, upstream reservoir discharge rates ($cusecs$).
- **Functionality**: Evaluates physical precipitation-runoff equations, soil moisture infiltration capacity, and catchment runoff parameters across the Rushikulya and Bahuda basins.
- **Output**: 
  - Dynamic Flood Risk Score ($0\text{--}100$) and categorical severity (`NORMAL`, `MODERATE`, `ELEVATED`, `HIGH`, `CRITICAL`).
  - Predicted inundation depth ($m$) and $+6\text{h}$, $+12\text{h}$, $+24\text{h}$ water level projections.
  - Factor breakdown (Catchment Saturation, Upstream Inflow, Drainage Choke Factor, Surge Backflow).

### 2. Multi-Factor Emergency Triage Priority (`POST /calculate/priority`)
- **Input**: Incident headcount, demographic stratification (infants, elderly, pregnant women, mobility-impaired), medical emergency flags, localized water depth, and road accessibility status.
- **Functionality**: Applies deterministic additive scoring with transparent weight contributions, guaranteeing full auditability for emergency dispatchers.
- **Output**:
  - Response Priority Score ($P_i \in [0, 100]$) and triage category (`CRITICAL`, `HIGH`, `ELEVATED`, `MONITORING`).
  - Itemized factor breakdown (Demographic Vulnerability, Water Hazard, Road Severance, Critical Infrastructure).

### 3. Safe Evacuation Pathfinder (`POST /routing/safe-route`)
- **Input**: Origin and destination coordinates, transport profile (`driving-car`, `foot-walking`, `wheelchair`), and GeoJSON flood avoidance polygons.
- **Functionality**: Connects with OpenRouteService with automated fallback to localized topological elevation heuristics, actively penalizing edges intersecting submerged terrain ($>0.3\text{m}$).
- **Output**: Safe polyline geometry, estimated transit duration, turn-by-turn road warnings, and distance comparison against direct (submerged) paths.

### 4. Computer Vision Water Depth Analysis (`POST /analyze/water-depth`)
- **Input**: Ground-truth citizen photo upload (JPEG/PNG/WebP).
- **Functionality**: Analyzes visual cues, waterline reference objects (vehicle wheels, doorways, road curbs), and surface reflection properties.
- **Output**: Estimated flood depth bracket ($<0.3\text{m}$, $0.3\text{--}0.6\text{m}$, $>1.0\text{m}$), confidence score, and impassability flag.

### 5. Multilingual RAG Disaster Advisor (`POST /assistant/chat`)
- **Input**: User query, conversation history, user coordinates, and selected language (`en`, `hi`, `or`).
- **Functionality**: Provides immediate, actionable flood survival guidance adhering to official NDMA and Odisha State Disaster Management guidelines.
- **Output**: Context-aware advisory response formatted in clean markdown, nearest high-ground guidance, and emergency hotline references.

---

## 🛡️ Reliability & Offline Fallback Architecture

To ensure zero service failure during cyclone-induced communication outages:
- **Simulation Mode Flag**: All endpoints support `simulationMode: true`, returning calibrated canonical benchmark states for training and demonstration.
- **Weather API Fallback**: If upstream meteorological APIs time out, the service utilizes cached catchment climatological averages.
- **Routing Heuristic Fallback**: If external routing providers are unreachable, a local spatial graph solver computes safe elevated detours automatically.

---

## 📁 Service Directory Structure

```
jal-rakshak-ai-service/
├── app/
│   ├── __init__.py
│   └── main.py              # Core FastAPI application, schemas, algorithms & endpoints
├── main.py                  # Root execution wrapper forwarding to app.main:app
├── requirements.txt         # Production Python dependencies
├── Dockerfile               # Container deployment specification
├── .env                     # Environment variables & API keys
└── README.md                # Technical microservice documentation
```

---

## 🚀 Installation & Local Execution

### 1. Create & Activate Virtual Environment
```bash
cd jal-rakshak-ai-service

# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS:
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Create a `.env` file in `jal-rakshak-ai-service/`:
```env
APP_ENV=development
PORT=8000
OPENROUTESERVICE_API_KEY=your_optional_api_key_here
```

### 4. Run the Service
```bash
# Using uvicorn:
uvicorn app.main:app --reload --port 8000

# Or using the root runner:
python main.py
```

### 5. Explore Interactive API Docs
Once running, open your browser to:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

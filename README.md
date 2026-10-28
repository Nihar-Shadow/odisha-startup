# 🌊 Jal Rakshak: AI-Based Hyperlocal Disaster Intelligence System
### Problem Statement PS-074 — District Emergency Operations Center (EOC) Platform for Ganjam, Odisha

[![System Status](https://img.shields.io/badge/System-Operational-2563EB.svg)](#)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-98%2F98%20Passed-10B981.svg)](#)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-178%2F178%20Passed-10B981.svg)](#)
[![Build Status](https://img.shields.io/badge/Vite%20Build-Passing%20(0%20errors)-success.svg)](#)
[![Data Provenance](https://img.shields.io/badge/Provenance-Tiered%20Audit-blueviolet.svg)](#)

---

## 📌 Executive Summary

**Jal Rakshak** is an enterprise-grade Emergency Operations Center (EOC) decision-support platform engineered specifically for the complex hydrological and cyclonic vulnerabilities of **Ganjam District, Odisha**. Situated at the confluence of the Rushikulya and Bahuda river basins and exposed to the Bay of Bengal coastline, Ganjam faces recurring flash flooding, compound drainage congestion, and severe cyclonic storm surges.

Conventional disaster monitoring tools suffer from severe information fragmentation: meteorological warnings, hydrological river stage forecasts, citizen distress calls, and satellite imagery arrive on disconnected systems without unified spatial or temporal correlation. This creates an unacceptable gap between **detecting a disaster** and **executing coordinated emergency response**.

Jal Rakshak bridges this gap through an end-to-end intelligence-to-action operational loop:

$$\mathbf{Detect} \longrightarrow \mathbf{Verify} \longrightarrow \mathbf{Understand} \longrightarrow \mathbf{Prioritize} \longrightarrow \mathbf{Allocate} \longrightarrow \mathbf{Act} \longrightarrow \mathbf{Reassess}$$

Rather than stopping at passive hazard visualization, Jal Rakshak converts multi-source ground and orbital evidence into **explainable response priority scores, capability-matched tactical rescue dispatches, turn-by-turn flood-safe routing corridors, and capacitated shelter allocations**.

---

## 🏛️ Monorepo Architecture

The platform is architected as a modular, resilient multi-tier system:

```
jal-rakshak/
├── jal-rakshak-frontend/     # React 18 + Vite + TailwindCSS EOC Command Center & Citizen Portals
├── jal-rakshak-backend/      # Node.js + Express + Socket.IO REST & Real-time Geospatial Server
└── jal-rakshak-ai-service/   # Python FastAPI + Hydro-ML + Computer Vision Intelligence Microservice
```

```mermaid
graph TD
    subgraph Data Sources & Telemetry
        W[Catchment Weather Feeds]
        H[Hydrological River Gauges]
        C[Geo-tagged Citizen Distress Reports]
        S[Sentinel-1 SAR Radar Overpasses]
    end

    subgraph Intelligence & Fusion
        FM[Hydrodynamic Flood Inundation Model]
        CV[Computer Vision Depth & Ground Verification]
        SAR[SAR Backscatter Drop Classifier]
        CY[Holland Vortex & SLOSH Cyclone Engine]
        EF[Multi-Source Evidence Fusion Engine]
    end

    subgraph Impact & Decision Layer
        PE[Population Exposure Analyzer]
        VI[Vulnerability Stratification Index]
        CI[Critical Infrastructure Isolation Engine]
        RP[Explainable Response Priority Scorer]
    end

    subgraph Operations & Logistics Layer
        RA[Constrained Greedy Tactical Fleet Matcher]
        SR[Dynamic Safe Routing Engine]
        SP[Capacitated Shelter Allocation Planner]
        EB[Staged Evacuation Batch Scheduler]
    end

    subgraph Command Center UI
        EOC[Unified GIS Leaflet Command Dashboard]
        CP[Multilingual Citizen & Rescue Portals]
    end

    W --> FM
    H --> FM
    C --> CV
    S --> SAR
    FM & CV & SAR & CY --> EF
    EF --> PE & VI & CI
    PE & VI & CI --> RP
    RP --> RA & SR & SP & EB
    RA & SR & SP & EB --> EOC & CP
```

---

## ⚡ Core Capabilities

### 1. Predictive Hydrodynamic Flood Modeling
- Dynamic rainfall-runoff simulation for the **Rushikulya and Bahuda** river catchments.
- Overland flow modeling factoring in antecedent soil moisture index ($I_{API}$) and calibrated Manning's roughness ($n=0.035$).
- Projections of river crest arrival times and $50\text{m} \times 50\text{m}$ discretized 2D inundation depth polygons ($0.2\text{m}$ to $2.8\text{m}$).

### 2. Crowdsourced Ground Evidence Verification
- Citizen emergency reporting with photo uploads, GPS coordinates, and localized water depth indicators.
- Automated NLP extraction of emergency keywords and spatial clustering to filter outliers and false alarms.
- Ground truth verification scoring boosting algorithmic confidence from $0.20 \to 0.58$.

### 3. Sentinel-1 SAR Orbital Radar Verification
- Dual-polarization (VV/VH) radar backscatter change detection capable of penetrating dense monsoon cloud cover.
- Specular reflection classification ($\sigma^0_{VH} < -19.5\text{ dB}$, $\Delta \sigma^0 < -4.5\text{ dB}$) generating validated flood extent masks.
- Increases operational confidence to $0.94$, triggering elevated district emergency workflows.

### 4. Cyclone & SLOSH Storm Surge Intelligence
- Holland parametric atmospheric vortex model computing asymmetric wind radii ($34\text{kt}, 50\text{kt}, 64\text{kt}$).
- SLOSH-based shallow bathymetric storm surge simulation along Gopalpur and the coastal lowlands ($0.5\text{m}$ to $3.5\text{m}$).
- Models compounding back-drafting effects where storm surges block river mouth discharge.

### 5. Hyperlocal Vulnerability & Infrastructure Assessment
- Intersects flood polygons with settlement grids to evaluate demographic exposure (elderly, infants, pregnant women, mobility-impaired).
- Evaluates operational status of critical facilities: Aska Community Health Centre, sub-stations, and bridge approaches.
- Predicts backup power depletion horizons and road culvert submergence.

### 6. Explainable Response Prioritization
- Completely deterministic, auditable multi-factor additive scoring model ($P_i \in [0, 100]$):
  $$P_i = \min\left(100, \; \left(0.25 F_i + 0.20 E_i + 0.15 V_i + 0.15 (1 - A_i) + 0.15 C_i + 0.10 D_i\right) \times 100\right)$$
- Full breakdown of contributing weights (Flood Depth, Exposure, Vulnerability, Road Severance, Infrastructure, Evidence Confidence) eliminating uninterpretable black-box decisions.

### 7. Constrained Tactical Dispatch & Safe Route Planning
- Matches tactical assets (motorized inflatable boats, high-clearance 4x4s, mobile medical units) by draft depth and payload constraints.
- Graph traversal route engine over OpenStreetMap road networks penalizing submerged edges ($>0.3\text{m}$).
- Automatically rejects impassable highways (e.g., submerged State Highway 36) and computes elevated detour corridors with turn-by-turn flood hazard warnings.

### 8. Capacitated Shelter Matching & Evacuation Phasing
- Proximity-constrained shelter assignment verifying elevation, occupancy thresholds, medical personnel, and diesel generator support.
- Schedules multi-cohort evacuation batches based on flood wave arrival times to prevent transit choke points.

---

## 📊 End-to-End Demonstration Scenario

The platform includes five baseline operational scenarios reflecting an escalating flood and cyclonic crisis across Ganjam:

| Timeline | Phase Name | Environmental & Operational Status | District Priority |
|---|---|---|---|
| **$T+00$** | **Baseline Monitoring** | Catchment rainfall reaches $110\text{mm}/6\text{h}$ in upper Eastern Ghats. Stage rising. | $14.2$ (`MONITORING`) |
| **$T+30$** | **Ground Evidence** | 14 citizen alerts log drainage overflows in Aska Ward 4. Confidence rises to $0.58$. | $48.5$ (`ELEVATED`) |
| **$T+60$** | **Satellite Confirmed** | Sentinel-1 SAR overpass validates $4.2\text{ km}^2$ inundation. Confidence locks at $0.94$. | $78.1$ (`HIGH`) |
| **$T+90$** | **Cyclone Approaching** | Severe Cyclonic Storm decelerates offshore Gopalpur; $1.8\text{m}$ storm surge blocks river outflow. | $86.4$ (`CRITICAL`) |
| **$T+180$** | **Critical Operations** | Aska CHC hospital isolated ($0.78\text{m}$ water). Safe detour, boat dispatch, and shelter routing executed. | **$94.8$ (`CRITICAL`)** |

---

## 🛡️ Data Provenance & Reliability Tiers

| Provenance Tier | Description | Source Components |
|---|---|---|
| **LIVE DATA** | Real-time atmospheric conditions and telemetry | Open-Meteo catchment APIs, Socket.IO live broadcasts |
| **MODELLED DATA** | Algorithmic physical simulations and projections | Hydrodynamic runoff, 2D depth grids, SLOSH surge models |
| **DEMO / SYNTHETIC** | Baseline district registries and benchmark rasters | Ganjam infrastructure registry, Sentinel-1 SAR rasters, simulated citizen distress calls |
| **DECISION SUPPORT** | Advisory recommendations requiring human authorization | Unit dispatch proposals, safe detour polylines, shelter assignment plans |

---

## 🧪 Verified Test Suite & Audit Results

The platform has undergone exhaustive automated testing across all subsystems:

- **Frontend Test Suite (Phases 4–10)**: **98 / 98 tests passed (100%)**
  - Phase 4: Hydrograph rendering & catchment depth projections
  - Phase 5: Citizen evidence clustering & NLP extraction
  - Phase 6: Sentinel-1 SAR raster overlay & confidence boosting
  - Phase 7: Cyclone vortex cone & storm surge mapping
  - Phase 8: Demographic vulnerability & infrastructure isolation
  - Phase 9: Response priority scoring & explainability breakdown
  - Phase 10: Resource allocation, safe routing, & shelter capacity
- **Backend API & Service Suite**: **178 / 178 tests passed (100%)**
- **Production Build Status**: Vite production bundle compiled with **zero errors and zero warnings**.
- **Road Safety Enforcement**: 42 edge tests verified **100% rejection of submerged road corridors ($>0.3\text{m}$)**.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10+ (for AI microservice)
- **MongoDB**: v6.0+ (optional, fallback in-memory mock data included)

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/Nihar-Shadow/odisha-startup.git jal-rakshak
cd jal-rakshak
```

### 2. Start the Backend API Server
```bash
cd jal-rakshak-backend
npm install
npm run dev
# Server initializes on http://localhost:5000 (or port assigned via .env)
```

### 3. Start the Frontend Command Center
```bash
cd ../jal-rakshak-frontend
npm install
npm run dev
# EOC Command Center launches on http://localhost:5173
```

### 4. (Optional) Start the Python AI Microservice
```bash
cd ../jal-rakshak-ai-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# OpenAPI Docs: http://localhost:8000/docs
```

---

## 🌐 Multilingual & Offline Resilience

- **Languages Supported**: Full internationalization (`i18n`) in **English**, **Hindi (हिन्दी)**, and **Odia (ଓଡ଼ିଆ)**.
- **Graceful Fallback Matrix**:
  $$\mathbf{LIVE} \longrightarrow \mathbf{CACHED} \longrightarrow \mathbf{DEMONSTRATION} \longrightarrow \mathbf{OFFLINE\_SAFE}$$
  If external communications or mobile towers fail during cyclone landfall, all routing calculations, priority scorers, and scenario simulations continue executing locally in the client browser.

---

## ⚖️ Responsible AI & Ethical Boundaries

1. **Advisory Decision Support**: The platform strictly generates advisory recommendations. It does not replace human emergency incident commanders or issue autonomous statutory orders.
2. **Deterministic Transparency**: High-stakes life-safety allocations use transparent, auditable formulas rather than uninterpretable black-box models.
3. **No Unverified Certifications**: Developed as an advanced technical research prototype for hackathon evaluation; does not claim official certification from IMD, CWC, or NDMA.

---

## 👥 Authors & Acknowledgments

- **Project**: PS-074 — AI-Based Hyperlocal Disaster Intelligence System for Ganjam, Odisha
- **Target Region**: District Emergency Operations Centre (DEOC), Chatrapur, Ganjam, Odisha

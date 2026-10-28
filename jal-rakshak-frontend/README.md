# 🖥️ Jal Rakshak Frontend: EOC Command Center & Citizen Portals
### Interactive Disaster Intelligence Web Application (React 18 + Vite + TailwindCSS)

[![Vite Build](https://img.shields.io/badge/Vite%20Build-Passing%20(0%20errors)-success.svg)](#)
[![Automated Tests](https://img.shields.io/badge/Frontend%20Tests-98%2F98%20Passed-10B981.svg)](#)
[![UI Framework](https://img.shields.io/badge/Framework-React%2018%20%2B%20TailwindCSS-38BDF8.svg)](#)
[![Mapping Engine](https://img.shields.io/badge/GIS-Leaflet%20%2B%20GeoJSON-green.svg)](#)
[![i18n](https://img.shields.io/badge/i18n-English%20%7C%20Hindi%20%7C%20Odia-orange.svg)](#)

---

## 📌 Overview

The **Jal Rakshak Frontend** is the user interface and operational dashboard layer for the **PS-074 District Emergency Operations Center (EOC) Platform**. Engineered for rapid decision-making under high-stress conditions, it offers a multi-role web platform serving district disaster commanders, field rescue squads (ODRAF/NDRF), and vulnerable citizens across Ganjam District, Odisha.

The application delivers a real-time, interactive **Single Pane of Glass** common operational picture combining hydrodynamic flood contours, Sentinel-1 radar masks, Holland cyclone wind radii, road network submergence alerts, and tactical unit routing.

---

## 🚀 Key Modules & Consoles

### 1. Unified EOC Command Center (`/admin` / `/command-center`)
- Full-screen interactive Leaflet GIS canvas featuring layer toggles for flood polygons, satellite radar extents, storm surge reaches, road network status, relief shelters, and tactical rescue teams.
- Real-time KPI aggregate cards tracking exposed population, high-risk wards, shelter utilization percentages, and pending emergency dispatches.
- Live incident ticker with audio alerts, priority badges, and quick-filter controls.

### 2. Predictive Hydrology & Runoff Analytics
- Interactive catchment hydrographs forecasting water levels ($+6\text{h}$ to $+48\text{h}$) across the **Rushikulya and Bahuda** river basins.
- Rainfall intensity timeseries and antecedent soil moisture monitoring.
- 2D flood depth gradient contours showing projected water depths from $0.2\text{m}$ to $2.8\text{m}$.

### 3. Satellite SAR Radar Extent Console
- Orbital radar change detection visualizer displaying Sentinel-1 dual-polarization (VV/VH) backscatter drop ($<-18.5\text{ dB}$).
- Overlays calibrated binary water classification masks directly on the GIS map.
- Automatic verification badge updating confidence levels when satellite evidence corroborates ground reports.

### 4. Cyclone & Storm Surge Monitor
- Dynamic projection of tropical cyclone tracks across the Bay of Bengal with cones of uncertainty.
- Asymmetric wind radius circles ($34\text{kt}$, $50\text{kt}$, $64\text{kt}$) and SLOSH storm surge inundation buffers along Gopalpur coastal stretches.

### 5. Vulnerability & Critical Infrastructure
- Ward-by-ward social vulnerability heatmaps accounting for elderly, pediatric, mobility-impaired residents, and non-pucca housing density.
- Real-time operational monitoring of critical facilities: **Aska Community Health Centre (CHC)**, electrical sub-stations, and primary bridges.
- Visual alerts for facilities with threatened road access or imminent backup generator failure.

### 6. Tactical Fleet & Logistics Dispatch
- Capability-constrained dispatch engine matching vehicle/boat specifications (draft depth, payload, medical tier) to incident requirements.
- Dynamic route engine calculating safe detours around submerged roads (e.g., rejecting flooded State Highway 36 and routing via elevated Rural Link OD-14).
- Turn-by-turn road safety status and flood hazard depth warnings.

### 7. Operational Planning & Evacuation
- Multi-wave evacuation cohort scheduling based on flood wave arrival lead times.
- Real-time shelter capacity and occupancy tracking with automated deficit warnings to prevent overbooking.

### 8. Citizen & Rescue Portals
- **Citizen Portal**: Geo-tagged emergency SOS distress beacon, crowd hazard reporting with photo uploads, multilingual AI safety assistant, and nearest safe shelter finder.
- **Rescue Portal**: Mobile-responsive tactical mission queue, waypoint navigation, evacuee manifest logger, and status updater.

---

## 🌐 Localization & Multilingual Support

The interface provides instant, client-side language switching with zero page reloads across:
- **English (`en`)**
- **Hindi (`hi`)** — हिन्दी
- **Odia (`or`)** — ଓଡ଼ିଆ

Covers all alert banners, emergency instructions, map legends, navigation menus, and AI assistant dialogues.

---

## 🕹️ Interactive Scenario Simulator (Zero-Backend Mode)

The frontend contains a built-in canonical state machine enabling full demonstration and automated testing even in offline environments:
1. **$T+00$ — Baseline Monitoring**: Normal flow, early catchment warnings.
2. **$T+30$ — Ground Evidence**: Citizen reports clustered in Aska Ward 4.
3. **$T+60$ — Satellite Confirmed**: Sentinel-1 SAR pass confirms $4.2\text{ km}^2$ flood extent.
4. **$T+90$ — Cyclone Approaching**: Storm surge reaches coastal blocks; compound drainage congestion.
5. **$T+180$ — Critical Operations**: Hospital isolated, boat dispatch, safe detour, and shelter evacuation active.

---

## 📁 Source Code Structure

```
jal-rakshak-frontend/
├── public/                 # Static assets, GeoJSON boundaries, markers
├── src/
│   ├── assets/             # Brand logos, icons, vector graphics
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # EOC command widgets, GIS layer controls
│   │   ├── common/         # Navbar, Sidebar, Footer, Alerts, Badges
│   │   ├── citizen/        # SOS triggers, hazard report forms
│   │   ├── rescue/         # Tactical dispatch cards, route maps
│   │   └── map/            # Leaflet map container, custom marker layers
│   ├── context/            # Global state (Auth, Language, FloodData, Alerts)
│   ├── locales/            # i18n dictionaries (en.json, hi.json, or.json)
│   ├── pages/              # Primary view controllers
│   │   ├── admin/          # Command center, analytics, logistics views
│   │   ├── citizen/        # Citizen dashboard, shelter locator
│   │   ├── rescue/         # Rescue squad dispatch console
│   │   └── public/         # Landing page, public flood tracker
│   ├── services/           # Axios REST clients & WebSocket subscribers
│   ├── styles/             # Tailwind utility styles & glassmorphism CSS
│   ├── tests/              # Phase 4–10 automated test suites (98 tests)
│   └── utils/              # Mock data generators, routing heuristics, GIS math
├── index.html              # HTML5 entry with responsive viewport tags
├── tailwind.config.js      # Emergency color palette and animations
└── vite.config.js          # Fast bundler configuration with Oxlint rules
```

---

## 🧪 Testing & Quality Assurance

Run the automated in-browser and unit test suites:
```bash
# Execute Phase 4 to 10 automated test suites:
npm run test:all
```
Verified results:
- **Phase 4 (Flood Analytics)**: 14 / 14 passed
- **Phase 5 (Citizen Ground Truth)**: 12 / 12 passed
- **Phase 6 (Satellite Radar)**: 16 / 16 passed
- **Phase 7 (Cyclone & Surge)**: 15 / 15 passed
- **Phase 8 (Vulnerability & Assets)**: 14 / 14 passed
- **Phase 9 (Response Priority)**: 15 / 15 passed
- **Phase 10 (Fleet, Routing, Shelters)**: 12 / 12 passed
- **Total Frontend Test Suite**: **98 / 98 tests passed (100%)**

---

## 🛠️ Development & Build Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and configure:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
VITE_DEFAULT_LOCALE=en
VITE_MAP_DEFAULT_LAT=19.3149
VITE_MAP_DEFAULT_LNG=84.7941
VITE_MAP_DEFAULT_ZOOM=11
```

### 3. Launch Development Server
```bash
npm run dev
# Server boots at http://localhost:5173
```

### 4. Build for Production
```bash
npm run build
# Compiles optimized bundle to /dist with zero errors
```

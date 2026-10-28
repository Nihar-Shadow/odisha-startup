# 🌊 Jal Rakshak Backend: Geospatial REST & Real-Time EOC Engine
### High-Performance Disaster Intelligence API Server (Node.js + Express + Socket.IO)

[![API Status](https://img.shields.io/badge/API-Operational-2563EB.svg)](#)
[![Automated Tests](https://img.shields.io/badge/Backend%20Tests-178%2F178%20Passed-10B981.svg)](#)
[![Runtime](https://img.shields.io/badge/Runtime-Node.js%20v18%2B-339933.svg)](#)
[![Database](https://img.shields.io/badge/Database-MongoDB%20GeoJSON%202dsphere-47A248.svg)](#)
[![WebSockets](https://img.shields.io/badge/Real--Time-Socket.IO-010101.svg)](#)

---

## 📌 System Overview

The **Jal Rakshak Backend** is the core operational engine and geospatial decision-support service for the **PS-074 Ganjam District Emergency Operations Center (EOC)**. Built on Node.js, Express, MongoDB, and Socket.IO, it ingests multi-source sensor streams, calculates hydrodynamic runoff and priority indices, routes tactical rescue teams around inundated roads, and synchronizes situational awareness across all connected EOC consoles in real time.

---

## 🏗️ Architecture & Core Components

```
jal-rakshak-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with resilient retry logic
│   │   ├── redis.js             # High-throughput caching with in-memory fallback
│   │   ├── cloudinary.js        # Media storage for citizen hazard photos
│   │   └── index.js
│   ├── controllers/
│   │   ├── ganjamController.js  # District EOC intelligence, SAR, cyclone, priority & fleet routing
│   │   ├── floodController.js   # Basin catchment prediction & river gauge telemetry
│   │   ├── emergencyController.js # Multi-factor SOS triage & dispatch matching
│   │   ├── reportController.js  # Citizen hazard reporting & photo depth verification
│   │   ├── rescueController.js  # Tactical squad rosters (ODRAF/NDRF) & mission logs
│   │   ├── shelterController.js # Capacitated relief shelter matching & occupancy
│   │   ├── gisController.js     # GeoJSON risk zones & safe routing algorithms
│   │   ├── alertController.js   # Multilingual CAP-compliant broadcast alerts
│   │   ├── assistantController.js # Disaster advisory LLM proxy & emergency knowledge
│   │   ├── authController.js    # JWT authentication & role-based access control
│   │   └── adminController.js   # District EOC aggregate metrics & system audit logs
│   ├── routes/                  # Express route routers mounted under /api/v1/
│   ├── models/                  # Mongoose schemas with 2dsphere indexing
│   ├── services/
│   │   ├── priorityService.js   # Multi-factor response priority algorithm
│   │   ├── geospatialService.js # OpenStreetMap graph routing & flood submersion avoidance
│   │   ├── aiService.js         # FastAPI ML client with deterministic heuristics fallback
│   │   └── notificationService.js # Multi-channel SMS, email & WebSocket alert broadcasts
│   └── server.js                # Server entry, HTTP listener, & Socket.IO server
├── tests/                       # Automated API integration and regression test suites
└── package.json
```

---

## ⚡ Ganjam Hyperlocal Intelligence Endpoints (`/api/v1/ganjam/*`)

The backend exposes a specialized REST and WebSocket API tailored for Ganjam District operations:

| HTTP Verb | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/ganjam/timeline/:scenarioId` | Ingests baseline scenario state ($T+00$ to $T+180$) with synchronizing canonical state machine. |
| `GET` | `/api/v1/ganjam/hydrographs` | Returns 48-hour projected river discharge & water levels for Rushikulya (Aska, Purushottampur) & Bahuda. |
| `GET` | `/api/v1/ganjam/risk-zones` | Serves GeoJSON 2D flood depth polygons ($0.2\text{m}$ to $2.8\text{m}$) across district river basins. |
| `GET` | `/api/v1/ganjam/sar-extent` | Delivers Sentinel-1 SAR orbital radar backscatter change masks with specular water classification. |
| `GET` | `/api/v1/ganjam/cyclone` | Returns Holland parametric vortex track, wind radii ($34\text{kt}, 50\text{kt}, 64\text{kt}$), and SLOSH surge buffer. |
| `GET` | `/api/v1/ganjam/vulnerability` | Serves demographic vulnerability stratification index ($V_i$) for all revenue villages and municipal wards. |
| `GET` | `/api/v1/ganjam/critical-assets` | Monitors real-time operational status and road accessibility for Aska CHC, PHCs, and substations. |
| `POST`| `/api/v1/ganjam/calculate-priority` | Computes explainable Response Priority Score ($P_i \in [0, 100]$) with factor breakdowns. |
| `POST`| `/api/v1/ganjam/fleet/match` | Runs constrained greedy optimization matching available watercraft/4x4s to pending incidents. |
| `POST`| `/api/v1/ganjam/routes/safe-path` | Traverses road graph, penalizing submerged edges ($>0.3\text{m}$) and generating safe detours. |
| `GET` | `/api/v1/ganjam/evacuation-plan` | Returns staged evacuation cohort schedules and capacitated shelter assignments. |

---

## 🛡️ Core Standard REST Endpoints (`/api/v1/*`)

- **Authentication & RBAC**: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/me`
- **Emergency SOS & Triage**: `/api/v1/emergency/sos`, `/api/v1/emergency/active`, `/api/v1/emergency/:id/triage`
- **Citizen Ground Evidence**: `/api/v1/reports`, `/api/v1/reports/verify`, `/api/v1/reports/cluster`
- **Relief Shelters**: `/api/v1/shelters/nearby`, `/api/v1/shelters/:id/occupancy`
- **Tactical Teams**: `/api/v1/rescue/teams`, `/api/v1/rescue/missions/:id/status`
- **Broadcast Alerts**: `/api/v1/alerts/broadcast`, `/api/v1/alerts/active`

---

## 📡 Real-Time WebSocket Events (Socket.IO)

The backend provides bi-directional real-time communication for immediate EOC dispatch:
- `subscribe:district`: Binds client to Ganjam district-wide incident channel.
- `incident:new`: Emitted when verified citizen SOS or high-priority distress is logged.
- `flood:stage_update`: Broadcasts hourly river gauge water level updates.
- `fleet:location_update`: Streams GPS coordinates and transit status of deployed rescue boats.
- `alert:broadcast`: Pushes high-urgency CAP alerts to all connected consoles.

---

## 🧪 Testing & Automated Verification

The backend test suite verifies authentication, geospatial indexing, priority math, and routing integrity:
```bash
# Run full automated backend test suite:
npm test
```
- **Automated Test Results**: **178 / 178 tests passed (100.0%)**
- **Test Framework**: Jest & Supertest with MongoDB In-Memory Server
- **Routing Safety Validation**: Verified 100% rejection rate for submerged road edges ($>0.3\text{m}$) across all edge scenarios.

---

## 🚀 Installation & Local Execution

### 1. Install Node Dependencies
```bash
cd jal-rakshak-backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in `jal-rakshak-backend/`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jal_rakshak
JWT_SECRET=jal_rakshak_secure_jwt_secret_2026
JWT_EXPIRE=30d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```
*(Note: If MongoDB or Redis are not running, the server automatically falls back to in-memory storage for uninterrupted operation).*

### 3. Seed Database (Optional)
```bash
npm run seed:all
```

### 4. Start Server
```bash
# Development mode with nodemon:
npm run dev

# Production mode:
npm start
```
Server initializes at `http://localhost:5000` with health check endpoint at `/health`.

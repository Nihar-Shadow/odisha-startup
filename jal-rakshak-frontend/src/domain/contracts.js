/**
 * Normalized Internal Domain Contracts — PS-074 Ganjam Disaster Intelligence
 *
 * Establishes stable canonical shapes across UI, adapters, and intelligence feeds.
 */

export const SourceCategory = Object.freeze({
  LIVE: 'LIVE',
  MODEL: 'MODEL',
  CITIZEN: 'CITIZEN',
  SOS: 'SOS',
  WEATHER: 'WEATHER',
  SATELLITE: 'SATELLITE',
  DEMO: 'DEMO',
  FALLBACK: 'FALLBACK',
})

export const SeverityLevel = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
})

/**
 * Creates a normalized RiskState object.
 */
export function createRiskState({
  score = 48,
  severity = SeverityLevel.MODERATE,
  confidence = 0.88,
  affectedAreaKm2 = 34.2,
  affectedPopulation = 4850,
  source = SourceCategory.DEMO,
  timestamp = new Date().toISOString(),
  reasons = ['Monsoon rainfall buildup', 'Low-lying coastal drainage delay'],
} = {}) {
  return {
    score: Number(score),
    severity,
    confidence: Number(confidence),
    affectedAreaKm2: Number(affectedAreaKm2),
    affectedPopulation: Number(affectedPopulation),
    source,
    timestamp,
    reasons: Array.isArray(reasons) ? reasons : [reasons],
  }
}

export function createWeatherState({
  location = { lat: 19.31, lng: 84.79, name: 'Brahmapur, Ganjam District' },
  rainfallMmPerHour = 68,
  rainfall1h = null,
  rainfall3h = null,
  rainfall24h = null,
  windSpeedKmh = 42,
  windDirection = 'ENE (Coastal Onshore)',
  windGustKmh = 58,
  temperatureC = 27.5,
  apparentTemperatureC = 31.0,
  humidity = 88,
  pressure = 996,
  precipitationProbability = 85,
  condition = 'Heavy Rain & Coastal Squall',
  forecastCondition = null, // Alias for backward compatibility
  trend = 'STABLE',
  severity = 'WATCH', // Decision-support: NORMAL | WATCH | WARNING | SEVERE
  forecast = [],
  stationName = 'Ganjam EOC Telemetry (Gopalpur / Brahmapur)',
  source = SourceCategory.DEMO,
  freshness = 'Live feed',
  cachedAt = null,
  timestamp = new Date().toISOString(),
} = {}) {
  const rainRate = Number(rainfallMmPerHour)
  const r1h = rainfall1h !== null && rainfall1h !== undefined ? Number(rainfall1h) : rainRate
  const r3h = rainfall3h !== null && rainfall3h !== undefined ? Number(rainfall3h) : Number((rainRate * 1.7).toFixed(1))
  const r24h = rainfall24h !== null && rainfall24h !== undefined ? Number(rainfall24h) : Number((rainRate * 2.7).toFixed(1))

  return {
    location,
    rainfallMmPerHour: rainRate,
    rainfall1h: r1h,
    rainfall3h: r3h,
    rainfall24h: r24h,
    windSpeedKmh: Number(windSpeedKmh),
    windDirection,
    windGustKmh: windGustKmh !== null && windGustKmh !== undefined ? Number(windGustKmh) : null,
    temperatureC: Number(temperatureC),
    apparentTemperatureC: apparentTemperatureC !== null && apparentTemperatureC !== undefined ? Number(apparentTemperatureC) : null,
    humidity: humidity !== null && humidity !== undefined ? Number(humidity) : null,
    pressure: pressure !== null && pressure !== undefined ? Number(pressure) : null,
    precipitationProbability: precipitationProbability !== null && precipitationProbability !== undefined ? Number(precipitationProbability) : null,
    condition: condition || forecastCondition || 'Rain Showers',
    forecastCondition: condition || forecastCondition || 'Rain Showers',
    trend,
    severity,
    forecast: Array.isArray(forecast) ? forecast : [],
    stationName,
    source,
    freshness,
    cachedAt,
    timestamp,
  }
}

/**
 * Creates a normalized CitizenIncident object.
 */
export function createCitizenIncident({
  id = `INC-${Date.now()}`,
  lat = 19.31,
  lng = 84.79,
  locationName = 'Ganjam District',
  category = 'Waterlogging',
  description = 'Water reported on roadway',
  severity = SeverityLevel.MEDIUM,
  source = SourceCategory.CITIZEN,
  verified = false,
  confidence = 0.85,
  imageUrl = null,
  trappedPeople = 0,
  needsBoat = false,
  status = 'PENDING_REVIEW',
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    id: String(id),
    lat: Number(lat),
    lng: Number(lng),
    locationName,
    category,
    description,
    severity,
    source,
    verified: Boolean(verified),
    confidence: Number(confidence),
    imageUrl,
    trappedPeople: Number(trappedPeople),
    needsBoat: Boolean(needsBoat),
    status,
    timestamp,
  }
}

/**
 * Creates a normalized Shelter object.
 */
export function createShelter({
  id,
  name,
  locationName = 'Ganjam District',
  lat,
  lng,
  capacity = 1000,
  occupancy = 0,
  status = 'ACTIVE',
  riskLevel = SeverityLevel.LOW,
  isRecommended = true,
  facilities = [],
  elevationMeters = 30,
  roadCondition = 'Passable',
  phone = '',
  source = SourceCategory.DEMO,
} = {}) {
  const cap = Number(capacity)
  const occ = Number(occupancy)
  return {
    id: String(id),
    name,
    locationName,
    lat: Number(lat),
    lng: Number(lng),
    capacity: cap,
    currentOccupancy: occ,
    availableSlots: Math.max(0, cap - occ),
    occupancyPct: Math.round((occ / (cap || 1)) * 100),
    status,
    riskLevel,
    isRecommended: Boolean(isRecommended),
    facilities,
    elevationMeters: Number(elevationMeters),
    roadCondition,
    phone,
    source,
  }
}

/**
 * Response Unit Enums — Phase 5 Rescue Orchestration
 */
export const ResponseUnitType = Object.freeze({
  RESCUE_TEAM: 'RESCUE_TEAM',
  BOAT: 'BOAT',
  AMBULANCE: 'AMBULANCE',
  MEDICAL_TEAM: 'MEDICAL_TEAM',
  SUPPLY_VEHICLE: 'SUPPLY_VEHICLE',
  FIRE_RESPONSE: 'FIRE_RESPONSE',
})

export const ResponseUnitStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  DISPATCHED: 'DISPATCHED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SCENE: 'ON_SCENE',
  RETURNING: 'RETURNING',
  UNAVAILABLE: 'UNAVAILABLE',
})

export const CapabilityType = Object.freeze({
  WATER_RESCUE: 'WATER_RESCUE',
  MEDICAL: 'MEDICAL',
  EVACUATION: 'EVACUATION',
  FIRE_RESPONSE: 'FIRE_RESPONSE',
  SUPPLIES: 'SUPPLIES',
  SEARCH: 'SEARCH',
})

/**
 * Creates a normalized ResponseUnit object.
 */
export function createResponseUnit({
  id,
  name,
  commander = '',
  type = ResponseUnitType.RESCUE_TEAM,
  unitType,
  status = ResponseUnitStatus.AVAILABLE,
  location,
  currentLocation = 'Ganjam Operational Base',
  lat,
  lng,
  capacity = 15,
  capacityPersons,
  capabilities = [],
  currentIncidentId = null,
  activeMissionId = null,
  availability = true,
  source = SourceCategory.DEMO,
  lastUpdated = new Date().toISOString(),
} = {}) {
  const normLat = lat !== undefined ? Number(lat) : (location?.lat !== undefined ? Number(location.lat) : 19.31)
  const normLng = lng !== undefined ? Number(lng) : (location?.lng !== undefined ? Number(location.lng) : 84.79)
  const normCap = Number(capacity ?? capacityPersons ?? 15)
  const normStatus = status === 'STANDBY_READY' ? ResponseUnitStatus.AVAILABLE : status
  const normIncidentId = currentIncidentId || activeMissionId || null
  const isAvailable = availability && (normStatus === ResponseUnitStatus.AVAILABLE)

  return {
    id: String(id),
    name: String(name || 'Response Unit'),
    type: unitType ? String(unitType).toUpperCase() : type,
    unitType: unitType || type,
    commander: String(commander || ''),
    status: normStatus,
    location: {
      lat: normLat,
      lng: normLng,
      name: location?.name || currentLocation,
    },
    currentLocation: location?.name || currentLocation,
    lat: normLat,
    lng: normLng,
    capacity: normCap,
    capacityPersons: normCap,
    capabilities: Array.isArray(capabilities) && capabilities.length > 0 ? capabilities : [CapabilityType.SEARCH],
    currentIncidentId: normIncidentId,
    activeMissionId: normIncidentId,
    availability: isAvailable,
    source,
    lastUpdated,
  }
}

/**
 * Creates a normalized FloodPrediction object (adapted from FLASH-FLOOD).
 */
export function createFloodPrediction({
  probability = 0.48,
  score = 48,
  severity = SeverityLevel.MODERATE,
  confidence = 0.88,
  affectedAreaKm2 = 34.2,
  affectedPopulation = 4850,
  estimatedArrivalHours = 4.5,
  rainfallMmPerHour = 68,
  contributingFactors = {
    rainfall: 32,
    river: 28,
    soil: 15,
    slope: 12,
    proximity: 8,
    lightning: 5,
  },
  recommendation = 'Monitor local river gauges every 15 min. Advise low-lying residents in Rushikulya basin to review evacuation preparations.',
  source = SourceCategory.MODEL,
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    probability: Number(probability),
    score: Number(score),
    severity,
    confidence: Number(confidence),
    affectedAreaKm2: Number(affectedAreaKm2),
    affectedPopulation: Number(affectedPopulation),
    estimatedArrivalHours: estimatedArrivalHours !== null && estimatedArrivalHours !== undefined ? Number(estimatedArrivalHours) : null,
    rainfallMmPerHour: Number(rainfallMmPerHour),
    contributingFactors,
    recommendation,
    source,
    timestamp,
  }
}

/**
 * Creates a normalized RiskZone object.
 */
export function createRiskZone({
  id,
  name,
  geometry,
  riskScore = 50,
  severity = SeverityLevel.MEDIUM,
  confidence = 0.85,
  affectedPopulation = 5000,
  affectedAreaKm2 = 12.5,
  primaryReason = 'Floodplain Inundation',
  source = SourceCategory.DEMO,
} = {}) {
  return {
    id: String(id),
    name,
    geometry,
    riskScore: Number(riskScore),
    severity,
    confidence: Number(confidence),
    affectedPopulation: Number(affectedPopulation),
    affectedAreaKm2: Number(affectedAreaKm2),
    primaryReason,
    source,
  }
}

export const EvidenceType = Object.freeze({
  IMAGE: 'IMAGE',
  TEXT: 'TEXT',
  SOS: 'SOS',
  FLOOD_REPORT: 'FLOOD_REPORT',
  ROAD_BLOCKAGE: 'ROAD_BLOCKAGE',
  SHELTER_REPORT: 'SHELTER_REPORT',
})

export const EvidenceSource = Object.freeze({
  CITIZEN: 'CITIZEN',
  FIELD_TEAM: 'FIELD_TEAM',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
})

export const EvidenceVerificationStatus = Object.freeze({
  UNVERIFIED: 'UNVERIFIED',
  PROCESSING: 'PROCESSING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
})

/**
 * Creates a canonical Evidence object — Phase 4 Ground Truth Layer
 */
export function createEvidence({
  id = `E-${Date.now()}`,
  type = EvidenceType.FLOOD_REPORT,
  source = EvidenceSource.CITIZEN,
  timestamp = new Date().toISOString(),
  location = { lat: 19.31, lng: 84.79, name: 'Ganjam' },
  imageUrl = null,
  description = '',
  severity = SeverityLevel.HIGH,
  confidence = 0.85,
  verificationStatus = EvidenceVerificationStatus.UNVERIFIED,
  floodIndicators = { detected: false, waterDepthEst: null, confidence: 0.85 },
  affectedRoad = null,
  affectedShelter = null,
  riskContribution = 0,
  appliedToRisk = false,
  processedAt = new Date().toISOString(),
  metadata = {},
} = {}) {
  const normLat = location?.lat !== undefined ? Number(location.lat) : (location?.coordinates?.[1] ? Number(location.coordinates[1]) : 19.31)
  const normLng = location?.lng !== undefined ? Number(location.lng) : (location?.coordinates?.[0] ? Number(location.coordinates[0]) : 84.79)
  const normLocation = {
    lat: normLat,
    lng: normLng,
    name: location?.name || location?.locationName || 'Ganjam, Odisha',
  }

  return {
    id: String(id),
    type,
    source,
    timestamp,
    location: normLocation,
    imageUrl,
    description: String(description || ''),
    severity,
    confidence: Number(Math.max(0, Math.min(1, Number(confidence) || 0)).toFixed(2)),
    verificationStatus,
    floodIndicators: {
      detected: Boolean(floodIndicators?.detected ?? (imageUrl || type === EvidenceType.FLOOD_REPORT || type === EvidenceType.IMAGE)),
      waterDepthEst: floodIndicators?.waterDepthEst || null,
      confidence: Number(floodIndicators?.confidence ?? confidence ?? 0.85),
    },
    affectedRoad: affectedRoad
      ? {
          roadName: affectedRoad.roadName || 'Local Road',
          status: affectedRoad.status || 'CAUTION',
          confidence: Number(affectedRoad.confidence ?? confidence ?? 0.85),
        }
      : null,
    affectedShelter: affectedShelter
      ? {
          shelterId: affectedShelter.shelterId || 'SH-01',
          shelterName: affectedShelter.shelterName || 'Relief Shelter',
          status: affectedShelter.status || 'AT_RISK',
          confidence: Number(affectedShelter.confidence ?? confidence ?? 0.85),
        }
      : null,
    riskContribution: Number(riskContribution || 0),
    appliedToRisk: Boolean(appliedToRisk),
    processedAt,
    metadata: {
      locationValid: Boolean(normLat >= 19.0 && normLat <= 19.8 && normLng >= 84.4 && normLng <= 85.2),
      imageAttached: Boolean(imageUrl),
      triageMethod: 'AI-assisted demo triage & decision support',
      ...metadata,
    },
  }
}

/**
 * Phase 5 Incident Types and Canonical Incident Contract
 */
export const IncidentType = Object.freeze({
  SOS: 'SOS',
  FLOOD: 'FLOOD',
  TRAPPED_PERSONS: 'TRAPPED_PERSONS',
  ROAD_BLOCKAGE: 'ROAD_BLOCKAGE',
  SHELTER_RISK: 'SHELTER_RISK',
  MEDICAL: 'MEDICAL',
  EVACUATION: 'EVACUATION',
})

export const DecisionAction = Object.freeze({
  MONITOR: 'MONITOR',
  DISPATCH: 'DISPATCH',
  RESCUE: 'RESCUE',
  EVACUATE: 'EVACUATE',
  REDIRECT: 'REDIRECT',
  SUPPLY: 'SUPPLY',
  MEDICAL_RESPONSE: 'MEDICAL_RESPONSE',
  ROAD_CAUTION: 'ROAD_CAUTION',
})

export const PriorityClass = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
})

/**
 * Creates a canonical Incident object.
 */
export function createIncident({
  id = `INC-${Date.now()}`,
  type = IncidentType.FLOOD,
  location = { lat: 19.31, lng: 84.79, name: 'Ganjam Operational Sector' },
  severity = SeverityLevel.HIGH,
  priority = PriorityClass.HIGH,
  priorityScore = 75,
  evidenceIds = [],
  affectedZone = 'Ganjam Central Basin',
  affectedPopulation = 500,
  roadStatus = 'OPEN',
  shelterImpact = null,
  recommendedAction = DecisionAction.DISPATCH,
  assignedUnitId = null,
  dispatchStatus = 'PENDING',
  route = null,
  eta = null,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) {
  const normLat = location?.lat !== undefined ? Number(location.lat) : 19.31
  const normLng = location?.lng !== undefined ? Number(location.lng) : 84.79
  return {
    id: String(id),
    type,
    location: {
      lat: normLat,
      lng: normLng,
      name: location?.name || 'Ganjam Operational Sector',
    },
    severity,
    priority,
    priorityScore: Number(priorityScore),
    evidenceIds: Array.isArray(evidenceIds) ? evidenceIds : [],
    affectedZone: String(affectedZone),
    affectedPopulation: Number(affectedPopulation),
    roadStatus: String(roadStatus),
    shelterImpact,
    recommendedAction,
    assignedUnitId: assignedUnitId ? String(assignedUnitId) : null,
    dispatchStatus: String(dispatchStatus),
    route,
    eta: eta !== null && eta !== undefined ? Number(eta) : null,
    createdAt,
    updatedAt,
  }
}

/**
 * Creates a canonical Decision object — Phase 5 Decision Intelligence
 */
export function createDecision({
  id = `DEC-${Date.now()}`,
  incidentId,
  priority = PriorityClass.MEDIUM,
  action = DecisionAction.MONITOR,
  responseUnitId = null,
  route = null,
  shelterId = null,
  resources = [],
  rationale = [],
  confidence = 0.9,
  status = 'RECOMMENDED',
  createdAt = new Date().toISOString(),
} = {}) {
  return {
    id: String(id),
    incidentId: String(incidentId),
    priority,
    action,
    responseUnitId: responseUnitId ? String(responseUnitId) : null,
    route,
    shelterId: shelterId ? String(shelterId) : null,
    resources: Array.isArray(resources) ? resources : [],
    rationale: Array.isArray(rationale) ? rationale : [rationale].filter(Boolean),
    confidence: Number(confidence),
    status,
    createdAt,
  }
}

/**
 * Phase 6 — Earth Observation + Satellite Verification Contracts
 */
export const SatelliteSource = Object.freeze({
  DRISHTI: 'DRISHTI',
  SENTINEL: 'SENTINEL',
  CACHE: 'CACHE',
  DEMO: 'DEMO',
})

export const SatelliteType = Object.freeze({
  SENTINEL_1: 'SENTINEL-1',
  SENTINEL_2: 'SENTINEL-2',
  UNKNOWN: 'UNKNOWN',
})

export const SensorType = Object.freeze({
  SAR: 'SAR',
  OPTICAL: 'OPTICAL',
  NDWI: 'NDWI',
  CHANGE_DETECTION: 'CHANGE_DETECTION',
})

export const ObservationType = Object.freeze({
  FLOOD_EXTENT: 'FLOOD_EXTENT',
  WATER_CHANGE: 'WATER_CHANGE',
  VEGETATION_CHANGE: 'VEGETATION_CHANGE',
  DAMAGE_CHANGE: 'DAMAGE_CHANGE',
})

export const DataStatus = Object.freeze({
  LIVE: 'LIVE',
  CACHED: 'CACHED',
  DEMO: 'DEMO',
  UNAVAILABLE: 'UNAVAILABLE',
})

/**
 * Creates a canonical SatelliteObservation object — Phase 6 EO Layer
 */
export function createSatelliteObservation({
  id = `SAT-${Date.now()}`,
  source = SatelliteSource.DRISHTI,
  satellite = SatelliteType.SENTINEL_1,
  sensor = SensorType.SAR,
  acquisitionTime = new Date(Date.now() - 45 * 60000).toISOString(),
  processingTime = new Date(Date.now() - 15 * 60000).toISOString(),
  observationType = ObservationType.FLOOD_EXTENT,
  bbox = [84.65, 19.22, 84.98, 19.65],
  geometry = null,
  floodDetected = true,
  floodProbability = 0.89,
  affectedAreaKm2 = 51.8,
  changePercent = 18.0,
  confidence = 0.89,
  affectedZones = ['ZONE-GANJAM-01', 'ZONE-GANJAM-02'],
  metadata = {},
  dataStatus = DataStatus.DEMO,
} = {}) {
  return {
    id: String(id),
    source,
    satellite,
    sensor,
    acquisitionTime,
    processingTime,
    observationType,
    bbox: Array.isArray(bbox) ? bbox : [84.65, 19.22, 84.98, 19.65],
    geometry: geometry || {
      type: 'Polygon',
      coordinates: [[
        [84.85, 19.22],
        [84.98, 19.25],
        [84.92, 19.34],
        [84.75, 19.32],
        [84.68, 19.26],
        [84.85, 19.22],
      ]],
    },
    floodDetected: Boolean(floodDetected),
    floodProbability: Number(floodProbability),
    affectedAreaKm2: Number(affectedAreaKm2),
    changePercent: Number(changePercent),
    confidence: Number(confidence),
    affectedZones: Array.isArray(affectedZones) ? affectedZones : [affectedZones].filter(Boolean),
    metadata: {
      provider: 'Drishti EO Engine / Copernicus Sentinel Hub Adapter',
      pixelResolutionMeters: 10.0,
      orbitDirection: 'DESCENDING',
      polarization: 'VV+VH Dual-Pol',
      ...metadata,
    },
    dataStatus,
  }
}

/**
 * Creates a canonical EvidenceConflict object
 */
export function createEvidenceConflict({
  id = `CONF-${Date.now()}`,
  type = 'EVIDENCE_CONFLICT',
  sources = ['CITIZEN', 'SATELLITE'],
  severity = SeverityLevel.MODERATE,
  overlap = 0.15,
  explanation = 'Satellite observation does not strongly overlap reported citizen location. Manual verification recommended.',
  recommendedAction = 'MANUAL_REVIEW',
  timestamp = new Date().toISOString(),
  metadata = {},
} = {}) {
  return {
    id: String(id),
    type,
    sources,
    severity,
    overlap: Number(overlap),
    explanation: String(explanation),
    recommendedAction,
    timestamp,
    metadata,
  }
}

/**
 * Phase 7 — Cyclone Intelligence & Bay of Bengal Track Contracts
 */
export const CycloneStatus = Object.freeze({
  NO_CYCLONE: 'NO_CYCLONE',
  MONITORING: 'MONITORING',
  DEPRESSION: 'DEPRESSION',
  DEEP_DEPRESSION: 'DEEP_DEPRESSION',
  CYCLONIC_STORM: 'CYCLONIC_STORM',
  SEVERE_CYCLONIC_STORM: 'SEVERE_CYCLONIC_STORM',
  VERY_SEVERE_CYCLONIC_STORM: 'VERY_SEVERE_CYCLONIC_STORM',
  EXTREMELY_SEVERE_CYCLONIC_STORM: 'EXTREMELY_SEVERE_CYCLONIC_STORM',
  SUPER_CYCLONIC_STORM: 'SUPER_CYCLONIC_STORM',
})

export const CycloneCategory = Object.freeze({
  BOB_DEPRESSION: 'BOB_DEPRESSION',
  CYCLONIC_STORM: 'CYCLONIC_STORM',
  SEVERE_CYCLONIC_STORM: 'SEVERE_CYCLONIC_STORM',
  VERY_SEVERE_CYCLONIC_STORM: 'VERY_SEVERE_CYCLONIC_STORM',
  SUPER_CYCLONE: 'SUPER_CYCLONE',
})

export const CycloneProximityBand = Object.freeze({
  LOW: 'LOW',         // > 500 km
  WATCH: 'WATCH',     // 300 - 500 km
  WARNING: 'WARNING', // 150 - 300 km
  SEVERE: 'SEVERE',   // < 150 km
})

export const CycloneSource = Object.freeze({
  GDACS: 'GDACS',
  CYCLONE_AI: 'CYCLONE_AI',
  CACHE: 'CACHE',
  DEMO: 'DEMO',
})

/**
 * Creates a canonical CycloneObservation object — Phase 7 Track & Proximity Layer
 */
export function createCycloneObservation({
  id = 'CYCLONE-BOB-01',
  source = CycloneSource.GDACS,
  sourceUrl = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=TC',
  cycloneName = 'CYCLONE-01',
  basin = 'Coastal Basin',
  status = CycloneStatus.SEVERE_CYCLONIC_STORM,
  category = CycloneCategory.SEVERE_CYCLONIC_STORM,
  intensity = 'Severe',
  maxWindKph = 120,
  centralPressureHpa = 972,
  position = { lat: 18.40, lng: 86.20 },
  movementDirection = 'NW',
  movementSpeedKph = 18,
  distanceToGanjamKm = 182,
  approachTimeHours = 12,
  landfallProbability = 0.78,
  historicalTrack = [
    { lat: 14.60, lng: 89.40, timestamp: '2026-10-19T00:00:00Z', windKph: 85, pressureHpa: 998, status: 'DEEP_DEPRESSION' },
    { lat: 16.80, lng: 88.10, timestamp: '2026-10-19T06:00:00Z', windKph: 105, pressureHpa: 990, status: 'CYCLONIC_STORM' },
    { lat: 18.40, lng: 86.20, timestamp: '2026-10-19T12:00:00Z', windKph: 120, pressureHpa: 972, status: 'SEVERE_CYCLONIC_STORM' },
  ],
  forecastTrack = [
    { lat: 18.90, lng: 85.40, timestamp: '2026-10-19T18:00:00Z', windKph: 130, pressureHpa: 968, status: 'SEVERE_CYCLONIC_STORM' },
    { lat: 19.35, lng: 84.85, timestamp: '2026-10-20T00:00:00Z', windKph: 135, pressureHpa: 964, status: 'VERY_SEVERE_CYCLONIC_STORM' },
    { lat: 19.80, lng: 84.20, timestamp: '2026-10-20T06:00:00Z', windKph: 110, pressureHpa: 975, status: 'CYCLONIC_STORM' },
  ],
  uncertaintyCone = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [86.20, 18.40],
        [86.10, 18.90],
        [85.80, 19.70],
        [84.90, 20.20],
        [83.80, 19.90],
        [84.30, 19.10],
        [85.10, 18.50],
        [86.20, 18.40],
      ]],
    },
  },
  confidence = 0.88,
  coastalRisk = 'HIGH',
  stormSurgeRisk = 76,
  cycloneRiskScore = null,
  dataStatus = DataStatus.DEMO,
  observedAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  metadata = {},
} = {}) {
  const normLat = position?.lat !== undefined ? Number(position.lat) : 18.40
  const normLng = position?.lng !== undefined ? Number(position.lng) : 86.20

  return {
    id: String(id),
    source,
    sourceUrl,
    cycloneName: String(cycloneName),
    basin: String(basin),
    status,
    category,
    intensity,
    maxWindKph: Number(maxWindKph),
    centralPressureHpa: Number(centralPressureHpa),
    position: {
      lat: normLat,
      lng: normLng,
      latitude: normLat,
      longitude: normLng,
    },
    lat: normLat,
    lng: normLng,
    latitude: normLat,
    longitude: normLng,
    movementDirection: String(movementDirection),
    movementSpeedKph: Number(movementSpeedKph),
    distanceToGanjamKm: Number(distanceToGanjamKm),
    approachTimeHours: Number(approachTimeHours),
    landfallProbability: Number(landfallProbability),
    historicalTrack: (Array.isArray(historicalTrack) ? historicalTrack : []).map((pt) => ({
      ...pt,
      lat: pt.lat !== undefined ? pt.lat : pt.latitude,
      lng: pt.lng !== undefined ? pt.lng : pt.longitude,
      latitude: pt.latitude !== undefined ? pt.latitude : pt.lat,
      longitude: pt.longitude !== undefined ? pt.longitude : pt.lng,
    })),
    forecastTrack: (Array.isArray(forecastTrack) ? forecastTrack : []).map((pt) => ({
      ...pt,
      lat: pt.lat !== undefined ? pt.lat : pt.latitude,
      lng: pt.lng !== undefined ? pt.lng : pt.longitude,
      latitude: pt.latitude !== undefined ? pt.latitude : pt.lat,
      longitude: pt.longitude !== undefined ? pt.longitude : pt.lng,
    })),
    uncertaintyCone: uncertaintyCone || null,
    confidence: Number(confidence),
    coastalRisk,
    stormSurgeRisk: Number(stormSurgeRisk),
    cycloneRiskScore: Number(cycloneRiskScore),
    proximityBand: distanceToGanjamKm < 150
      ? CycloneProximityBand.SEVERE
      : distanceToGanjamKm < 300
      ? CycloneProximityBand.WARNING
      : distanceToGanjamKm < 500
      ? CycloneProximityBand.WATCH
      : CycloneProximityBand.LOW,
    dataStatus: dataStatus || DataStatus.DEMO,
    observedAt,
    updatedAt,
    metadata: {
      provider: 'CycloneAI GDACS Adapter / Coastal Ingestion Pipeline',
      basinCenter: [19.31, 84.79],
      targetDistrict: 'Ganjam, Odisha',
      ...metadata,
    },
  }
}

/**
 * Phase 8 Contracts — Population Exposure, Vulnerability & Critical Infrastructure Intelligence
 * PS-074 Ganjam District, Odisha
 */

export const InfrastructureType = Object.freeze({
  HOSPITAL: 'HOSPITAL',
  HEALTH_CENTER: 'HEALTH_CENTER',
  SCHOOL: 'SCHOOL',
  SHELTER: 'SHELTER',
  POLICE: 'POLICE',
  FIRE_STATION: 'FIRE_STATION',
  POWER_SUBSTATION: 'POWER_SUBSTATION',
  WATER_SUPPLY: 'WATER_SUPPLY',
  BRIDGE: 'BRIDGE',
  ROAD: 'ROAD',
  COMMUNICATION_TOWER: 'COMMUNICATION_TOWER',
  GOVERNMENT_FACILITY: 'GOVERNMENT_FACILITY',
})

export const InfrastructureStatus = Object.freeze({
  OPERATIONAL: 'OPERATIONAL',
  AT_RISK: 'AT_RISK',
  PARTIALLY_ACCESSIBLE: 'PARTIALLY_ACCESSIBLE',
  BLOCKED: 'BLOCKED',
  OFFLINE: 'OFFLINE',
  UNKNOWN: 'UNKNOWN',
})

export const ImpactLevel = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
})

export const VulnerabilityLevel = Object.freeze({
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
})

/**
 * Canonical PopulationExposure object
 * Explicitly labeled MODELLED EXPOSURE / DEMO EXPOSURE DATA
 */
export function createPopulationExposure({
  id = 'EXP-DEMO-01',
  zoneId = 'ZONE-GANJAM-02',
  geometry = null,
  population = 18000,
  exposedPopulation = 7200,
  highRiskPopulation = 4100,
  vulnerablePopulation = 2600,
  elderlyPopulation = 1100,
  childrenPopulation = 900,
  mobilityLimitedPopulation = 600,
  households = 3800,
  exposurePercentage = 40,
  source = 'MODELLED_DEMO',
  provenance = 'MODELLED EXPOSURE',
  confidence = 0.85,
  updatedAt = new Date().toISOString(),
  metadata = {},
} = {}) {
  const normPop = Number(population) || 0
  const normExposed = Number(exposedPopulation) || 0
  const normVuln = Number(vulnerablePopulation) || 0
  const expPct = normPop > 0 ? Number(((normExposed / normPop) * 100).toFixed(1)) : Number(exposurePercentage) || 0

  return {
    id: String(id),
    zoneId: String(zoneId),
    geometry,
    population: normPop,
    exposedPopulation: normExposed,
    highRiskPopulation: Number(highRiskPopulation) || 0,
    vulnerablePopulation: normVuln,
    elderlyPopulation: Number(elderlyPopulation) || 0,
    childrenPopulation: Number(childrenPopulation) || 0,
    mobilityLimitedPopulation: Number(mobilityLimitedPopulation) || 0,
    households: Number(households) || 0,
    exposurePercentage: expPct,
    source,
    provenance,
    confidence: Number(Number(confidence).toFixed(2)),
    updatedAt,
    metadata: {
      disclaimer: 'MODELLED DEMO DATA: Not an official Census of India enumeration.',
      ...metadata,
    },
  }
}

/**
 * Canonical CriticalInfrastructure object
 * Explicitly labeled MODELLED INFRASTRUCTURE
 */
export function createCriticalInfrastructure({
  id = 'INFRA-01',
  name = 'Ganjam Critical Facility',
  type = InfrastructureType.HOSPITAL,
  location = { lat: 19.31, lng: 84.79, name: 'Ganjam Sector' },
  zoneId = 'ZONE-GANJAM-01',
  capacity = 100,
  currentStatus = InfrastructureStatus.OPERATIONAL,
  riskLevel = 'LOW',
  accessibility = 'OPEN',
  floodExposure = 0,
  cycloneExposure = 0,
  serviceDependency = {},
  source = 'MODELLED_INFRASTRUCTURE',
  provenance = 'DEMO INFRASTRUCTURE INVENTORY',
  confidence = 0.85,
  updatedAt = new Date().toISOString(),
  metadata = {},
} = {}) {
  const normLat = location?.lat !== undefined ? Number(location.lat) : 19.31
  const normLng = location?.lng !== undefined ? Number(location.lng) : 84.79

  return {
    id: String(id),
    name: String(name),
    type,
    location: {
      lat: normLat,
      lng: normLng,
      latitude: normLat,
      longitude: normLng,
      name: location?.name || name,
    },
    lat: normLat,
    lng: normLng,
    zoneId: String(zoneId),
    capacity: Number(capacity) || 0,
    currentStatus,
    riskLevel,
    accessibility,
    floodExposure: Number(floodExposure) || 0,
    cycloneExposure: Number(cycloneExposure) || 0,
    serviceDependency: {
      roadAccess: serviceDependency?.roadAccess || 'OPEN',
      powerGrid: serviceDependency?.powerGrid || 'OPERATIONAL',
      waterSupply: serviceDependency?.waterSupply || 'OPERATIONAL',
      supplyCorridor: serviceDependency?.supplyCorridor || 'OPEN',
      backupGenerator: serviceDependency?.backupGenerator ?? true,
      ...serviceDependency,
    },
    source,
    provenance,
    confidence: Number(Number(confidence).toFixed(2)),
    updatedAt,
    metadata: {
      disclaimer: 'DEMO INFRASTRUCTURE INVENTORY: Modelled operational facility.',
      ...metadata,
    },
  }
}

/**
 * Canonical InfrastructureImpact object
 */
export function createInfrastructureImpact({
  infrastructureId = 'INFRA-01',
  impactScore = 0,
  impactLevel = ImpactLevel.LOW,
  accessRisk = 'LOW',
  serviceRisk = 'LOW',
  recommendedAction = 'Routine operational surveillance.',
  contributingFactors = {},
  confidence = 0.85,
  provenance = 'MODELLED IMPACT',
} = {}) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(Number(impactScore) || 0)))
  let level = impactLevel
  if (!impactLevel || impactLevel === ImpactLevel.LOW) {
    if (clampedScore >= 75) level = ImpactLevel.CRITICAL
    else if (clampedScore >= 50) level = ImpactLevel.HIGH
    else if (clampedScore >= 25) level = ImpactLevel.MODERATE
    else level = ImpactLevel.LOW
  }

  return {
    infrastructureId: String(infrastructureId),
    impactScore: clampedScore,
    impactLevel: level,
    accessRisk,
    serviceRisk,
    recommendedAction: String(recommendedAction),
    contributingFactors: {
      hazardBase: contributingFactors.hazardBase || 0,
      floodModifier: contributingFactors.floodModifier || 0,
      cycloneModifier: contributingFactors.cycloneModifier || 0,
      roadBlockageModifier: contributingFactors.roadBlockageModifier || 0,
      citizenEvidenceModifier: contributingFactors.citizenEvidenceModifier || 0,
      satelliteConfirmationModifier: contributingFactors.satelliteConfirmationModifier || 0,
      ...contributingFactors,
    },
    confidence: Number(Number(confidence).toFixed(2)),
    provenance,
  }
}

/**
 * Canonical VulnerabilityProfile object
 * Explicitly labeled MODELLED VULNERABILITY SCORE
 */
export function createVulnerabilityProfile({
  zoneId = 'ZONE-GANJAM-01',
  vulnerabilityScore = 0,
  vulnerabilityLevel = VulnerabilityLevel.LOW,
  factors = {},
  contributingFactors = [],
  confidence = 0.85,
  provenance = 'MODELLED VULNERABILITY SCORE',
  updatedAt = new Date().toISOString(),
} = {}) {
  const score = Math.max(0, Math.min(100, Math.round(Number(vulnerabilityScore) || 0)))
  let level = vulnerabilityLevel
  if (!vulnerabilityLevel || vulnerabilityLevel === VulnerabilityLevel.LOW) {
    if (score >= 75) level = VulnerabilityLevel.CRITICAL
    else if (score >= 50) level = VulnerabilityLevel.HIGH
    else if (score >= 25) level = VulnerabilityLevel.MODERATE
    else level = VulnerabilityLevel.LOW
  }

  return {
    zoneId: String(zoneId),
    vulnerabilityScore: score,
    vulnerabilityLevel: level,
    factors: {
      exposureScore: factors.exposureScore || 0,
      floodHazardScore: factors.floodHazardScore || 0,
      cycloneScore: factors.cycloneScore || 0,
      accessibilityScore: factors.accessibilityScore || 0,
      shelterAccessibilityScore: factors.shelterAccessibilityScore || 0,
      medicalAccessibilityScore: factors.medicalAccessibilityScore || 0,
      vulnerablePopulationScore: factors.vulnerablePopulationScore || 0,
      infrastructureDependencyScore: factors.infrastructureDependencyScore || 0,
      ...factors,
    },
    contributingFactors: Array.isArray(contributingFactors) ? contributingFactors : [],
    confidence: Number(Number(confidence).toFixed(2)),
    provenance,
    updatedAt,
  }
}

/**
 * Canonical ZonePriority object
 * Explicitly labeled DETERMINISTIC PRIORITY SCORE / RESPONSE PRIORITY
 */
export function createZonePriority({
  zoneId = 'ZONE-GANJAM-02',
  priorityScore = 0,
  priorityClass = PriorityClass.LOW,
  exposedPopulation = 0,
  vulnerablePopulation = 0,
  infrastructureAtRisk = 0,
  primaryThreat = '',
  recommendedAction = '',
  rationale = [],
  contributingFactors = {},
  provenance = 'DETERMINISTIC PRIORITY SCORE',
} = {}) {
  const score = Math.max(0, Math.min(100, Math.round(Number(priorityScore) || 0)))
  let pClass = priorityClass
  if (!priorityClass || priorityClass === PriorityClass.LOW) {
    if (score >= 80) pClass = PriorityClass.CRITICAL
    else if (score >= 60) pClass = PriorityClass.HIGH
    else if (score >= 40) pClass = PriorityClass.MEDIUM
    else pClass = PriorityClass.LOW
  }

  return {
    zoneId: String(zoneId),
    priorityScore: score,
    priorityClass: pClass,
    exposedPopulation: Number(exposedPopulation) || 0,
    vulnerablePopulation: Number(vulnerablePopulation) || 0,
    infrastructureAtRisk: Number(infrastructureAtRisk) || 0,
    primaryThreat: String(primaryThreat),
    recommendedAction: String(recommendedAction),
    rationale: Array.isArray(rationale) ? rationale : [rationale],
    contributingFactors,
    provenance,
  }
}

/**
 * Phase 9 — Resource Allocation, Evacuation Optimization & Operational Planning Contracts
 */
export const ResourceAssetType = Object.freeze({
  RESCUE_UNIT: 'RESCUE_UNIT',
  BOAT: 'BOAT',
  AMBULANCE: 'AMBULANCE',
  FIRE_TEAM: 'FIRE_TEAM',
  SUPPLY_VEHICLE: 'SUPPLY_VEHICLE',
  MEDICAL_TEAM: 'MEDICAL_TEAM',
  WATER_TANKER: 'WATER_TANKER',
  PUMP: 'PUMP',
  LIFE_JACKET: 'LIFE_JACKET',
  MEDICAL_KIT: 'MEDICAL_KIT',
  DRINKING_WATER: 'DRINKING_WATER',
  FOOD: 'FOOD',
  COMMUNICATION_KIT: 'COMMUNICATION_KIT',
  FUEL: 'FUEL',
  SHELTER_CAPACITY: 'SHELTER_CAPACITY',
})

export const ResourceAssetStatus = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ON_SCENE: 'ON_SCENE',
  UNAVAILABLE: 'UNAVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
})

/**
 * Canonical ResourceAsset contract — respects physical capacity & availability
 */
export function createResourceAsset({
  id = `RES-${Date.now()}`,
  type = ResourceAssetType.RESCUE_UNIT,
  name = 'Operational Resource',
  location = { lat: 19.31, lng: 84.79, name: 'Ganjam Central Depot' },
  capacity = 10,
  availableCapacity = 10,
  capabilities = [],
  status = ResourceAssetStatus.AVAILABLE,
  operatingRange = 45, // km
  responseTime = 15, // minutes
  currentAssignment = null,
  source = 'MODELLED_OPERATIONAL_CAPACITY',
  provenance = 'DETERMINISTIC RESOURCE ALLOCATION',
  updatedAt = new Date().toISOString(),
  metadata = {},
} = {}) {
  const normLat = location?.lat !== undefined ? Number(location.lat) : 19.31
  const normLng = location?.lng !== undefined ? Number(location.lng) : 84.79
  const totalCap = Number(capacity) || 0
  const availCap = availableCapacity !== undefined ? Math.min(totalCap, Math.max(0, Number(availableCapacity))) : totalCap

  return {
    id: String(id),
    type,
    name: String(name),
    location: {
      lat: normLat,
      lng: normLng,
      latitude: normLat,
      longitude: normLng,
      name: location?.name || name,
    },
    capacity: totalCap,
    availableCapacity: availCap,
    capabilities: Array.isArray(capabilities) ? capabilities : [capabilities].filter(Boolean),
    status,
    operatingRange: Number(operatingRange) || 0,
    responseTime: Number(responseTime) || 0,
    currentAssignment: currentAssignment ? String(currentAssignment) : null,
    source,
    provenance,
    updatedAt,
    metadata: {
      disclaimer: 'MODELLED OPERATIONAL CAPACITY: Deterministic planning resource.',
      ...metadata,
    },
  }
}

export const MissionType = Object.freeze({
  EVACUATION: 'EVACUATION',
  WATER_RESCUE: 'WATER_RESCUE',
  MEDICAL_ACCESS: 'MEDICAL_ACCESS',
  MEDICAL_EVACUATION: 'MEDICAL_EVACUATION',
  SUPPLY_DELIVERY: 'SUPPLY_DELIVERY',
  ROAD_CLEARANCE: 'ROAD_CLEARANCE',
  SHELTER_SUPPORT: 'SHELTER_SUPPORT',
  INFRASTRUCTURE_PROTECTION: 'INFRASTRUCTURE_PROTECTION',
  SEARCH_AND_RESCUE: 'SEARCH_AND_RESCUE',
  COMMUNICATION_SUPPORT: 'COMMUNICATION_SUPPORT',
})

export const MissionStatus = Object.freeze({
  PLANNED: 'PLANNED',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  CANCELLED: 'CANCELLED',
  DELAYED: 'DELAYED',
  RESOURCE_CONSTRAINED: 'RESOURCE_CONSTRAINED',
})

export const MissionPriorityClass = Object.freeze({
  IMMEDIATE: 'IMMEDIATE', // 90–100
  URGENT: 'URGENT',       // 75–89
  HIGH: 'HIGH',           // 50–74
  PLANNED: 'PLANNED',     // 25–49
  MONITOR: 'MONITOR',     // 0–24
})

/**
 * Canonical Mission contract
 */
export function createMission({
  id = `MIS-${Date.now()}`,
  incidentId = null,
  zoneId = 'ZONE-GANJAM-02',
  missionType = MissionType.WATER_RESCUE,
  priority = 90,
  priorityClass = MissionPriorityClass.IMMEDIATE,
  assignedResources = [],
  origin = { lat: 19.31, lng: 84.79, name: 'Aska Staging Post' },
  destination = { lat: 19.61, lng: 84.66, name: 'Aska Floodplain Sector' },
  route = null,
  estimatedTravelTime = 14,
  estimatedDuration = 45,
  requiredCapacity = 16,
  completedCapacity = 0,
  status = MissionStatus.PLANNED,
  rationale = [],
  constraints = [],
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
  provenance = 'MODELLED OPERATIONAL PLAN',
} = {}) {
  const normPriority = Math.max(0, Math.min(100, Math.round(Number(priority) || 0)))
  let pClass = priorityClass
  if (!priorityClass || priorityClass === MissionPriorityClass.MONITOR) {
    if (normPriority >= 90) pClass = MissionPriorityClass.IMMEDIATE
    else if (normPriority >= 75) pClass = MissionPriorityClass.URGENT
    else if (normPriority >= 50) pClass = MissionPriorityClass.HIGH
    else if (normPriority >= 25) pClass = MissionPriorityClass.PLANNED
    else pClass = MissionPriorityClass.MONITOR
  }

  return {
    id: String(id),
    incidentId: incidentId ? String(incidentId) : null,
    zoneId: String(zoneId),
    missionType,
    priority: normPriority,
    priorityClass: pClass,
    assignedResources: Array.isArray(assignedResources) ? assignedResources : [assignedResources].filter(Boolean),
    origin: {
      lat: origin?.lat !== undefined ? Number(origin.lat) : 19.31,
      lng: origin?.lng !== undefined ? Number(origin.lng) : 84.79,
      name: origin?.name || 'Origin Base',
    },
    destination: {
      lat: destination?.lat !== undefined ? Number(destination.lat) : 19.61,
      lng: destination?.lng !== undefined ? Number(destination.lng) : 84.66,
      name: destination?.name || 'Target Mission Area',
    },
    route,
    estimatedTravelTime: Number(estimatedTravelTime) || 0,
    estimatedDuration: Number(estimatedDuration) || 0,
    requiredCapacity: Number(requiredCapacity) || 0,
    completedCapacity: Number(completedCapacity) || 0,
    status,
    rationale: Array.isArray(rationale) ? rationale : [rationale].filter(Boolean),
    constraints: Array.isArray(constraints) ? constraints : [constraints].filter(Boolean),
    createdAt,
    updatedAt,
    provenance,
  }
}

export const EvacuationStatus = Object.freeze({
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  CAPACITY_LIMITED: 'CAPACITY_LIMITED',
  ROUTE_BLOCKED: 'ROUTE_BLOCKED',
  COMPLETED: 'COMPLETED',
})

/**
 * Canonical EvacuationPlan contract
 */
export function createEvacuationPlan({
  id = `EVAC-${Date.now()}`,
  zoneId = 'ZONE-GANJAM-02',
  sourcePopulation = 7200,
  vulnerablePopulation = 2600,
  destinationShelter = 'SH-02',
  shelterAllocations = [],
  requiredCapacity = 2600,
  allocatedCapacity = 2600,
  remainingPopulation = 0,
  route = null,
  estimatedTime = 25,
  priority = 96,
  batches = [],
  status = EvacuationStatus.PLANNED,
  rationale = [],
  provenance = 'MODELLED EVACUATION PRIORITY',
  updatedAt = new Date().toISOString(),
} = {}) {
  return {
    id: String(id),
    zoneId: String(zoneId),
    sourcePopulation: Number(sourcePopulation) || 0,
    vulnerablePopulation: Number(vulnerablePopulation) || 0,
    destinationShelter: String(destinationShelter),
    shelterAllocations: Array.isArray(shelterAllocations) ? shelterAllocations : [],
    requiredCapacity: Number(requiredCapacity) || 0,
    allocatedCapacity: Number(allocatedCapacity) || 0,
    remainingPopulation: Number(remainingPopulation) || 0,
    route,
    estimatedTime: Number(estimatedTime) || 0,
    priority: Math.max(0, Math.min(100, Math.round(Number(priority) || 0))),
    batches: Array.isArray(batches) ? batches : [],
    status,
    rationale: Array.isArray(rationale) ? rationale : [rationale].filter(Boolean),
    provenance,
    updatedAt,
  }
}

export const SupplyType = Object.freeze({
  DRINKING_WATER: 'DRINKING_WATER',
  FOOD: 'FOOD',
  MEDICAL_KIT: 'MEDICAL_KIT',
  LIFE_JACKET: 'LIFE_JACKET',
  FUEL: 'FUEL',
  EMERGENCY_POWER: 'EMERGENCY_POWER',
  COMMUNICATION_KIT: 'COMMUNICATION_KIT',
})

/**
 * Canonical SupplyRequirement contract
 */
export function createSupplyRequirement({
  id = `SUP-${Date.now()}`,
  zoneId = 'ZONE-GANJAM-02',
  type = SupplyType.DRINKING_WATER,
  requiredQuantity = 5200,
  allocatedQuantity = 5200,
  priority = 90,
  unit = 'Liters',
  destination = 'Aska Relief Center',
  status = 'ALLOCATED',
  provenance = 'MODELLED OPERATIONAL ASSUMPTION',
} = {}) {
  return {
    id: String(id),
    zoneId: String(zoneId),
    type,
    requiredQuantity: Number(requiredQuantity) || 0,
    allocatedQuantity: Number(allocatedQuantity) || 0,
    priority: Math.max(0, Math.min(100, Math.round(Number(priority) || 0))),
    unit: String(unit),
    destination: String(destination),
    status: String(status),
    provenance,
  }
}

/**
 * Canonical OperationalPlan contract
 */
export function createOperationalPlan({
  scenario = 'CRITICAL_OPERATION',
  generatedAt = new Date().toISOString(),
  priorityMissions = [],
  evacuationPlans = [],
  resourceAllocations = [],
  shelterAllocations = [],
  supplyAllocations = [],
  prePositioning = [],
  blockedActions = [],
  unresolvedNeeds = [],
  assumptions = [
    'Drinking water baseline: 2 Liters per person per day (MODELLED OPERATIONAL ASSUMPTION)',
    'High-ground shelter access prioritized via cleared state corridors',
    'Resource assignments respect max crew and transport capacities',
  ],
  provenance = 'MODELLED OPERATIONAL PLAN',
} = {}) {
  return {
    scenario: String(scenario),
    generatedAt,
    priorityMissions: Array.isArray(priorityMissions) ? priorityMissions : [],
    evacuationPlans: Array.isArray(evacuationPlans) ? evacuationPlans : [],
    resourceAllocations: Array.isArray(resourceAllocations) ? resourceAllocations : [],
    shelterAllocations: Array.isArray(shelterAllocations) ? shelterAllocations : [],
    supplyAllocations: Array.isArray(supplyAllocations) ? supplyAllocations : [],
    prePositioning: Array.isArray(prePositioning) ? prePositioning : [],
    blockedActions: Array.isArray(blockedActions) ? blockedActions : [],
    unresolvedNeeds: Array.isArray(unresolvedNeeds) ? unresolvedNeeds : [],
    assumptions: Array.isArray(assumptions) ? assumptions : [],
    provenance,
  }
}

/**
 * Canonical OperationalTimeline contract
 */
export function createOperationalTimeline({
  scenario = 'CRITICAL_OPERATION',
  stages = [],
  provenance = 'MODELLED RESPONSE TIMELINE',
  updatedAt = new Date().toISOString(),
} = {}) {
  return {
    scenario: String(scenario),
    stages: Array.isArray(stages) ? stages : [],
    provenance,
    updatedAt,
  }
}




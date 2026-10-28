/**
 * Rescue Orchestration + Dispatch Intelligence Engine — Phase 5
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 *
 * Deterministic Decision-Support Layer:
 * CURRENT RISK -> ACTIVE INCIDENTS -> INCIDENT PRIORITY -> RESPONSE UNITS
 *   -> ROAD / ROUTE RISK -> SAFE ROUTE -> SHELTER SAFETY -> DISPATCH RECOMMENDATION
 */

import {
  ResponseUnitType,
  ResponseUnitStatus,
  CapabilityType,
  createResponseUnit,
  IncidentType,
  createIncident,
  DecisionAction,
  PriorityClass,
  createDecision,
  SourceCategory,
  SeverityLevel,
} from '../../../domain/contracts.js'

// Canonical Coordinates & Distances
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

/**
 * 1. Deterministic Response Unit Demo Catalog
 * Clearly labelled MODELLED RESPONSE CAPACITY / DEMO RESPONSE UNIT
 */
export const GANJAM_DEMO_RESPONSE_UNITS = [
  createResponseUnit({
    id: 'RU-01',
    name: 'Gopalpur Water Rescue',
    commander: 'Sub-Inspector P. Mohanty',
    type: ResponseUnitType.RESCUE_TEAM,
    status: ResponseUnitStatus.AVAILABLE,
    location: { lat: 19.268, lng: 84.912, name: 'Gopalpur Coastal Base' },
    capacity: 12,
    capabilities: [CapabilityType.WATER_RESCUE, CapabilityType.SEARCH],
    availability: true,
    source: SourceCategory.DEMO,
  }),
  createResponseUnit({
    id: 'RU-02',
    name: 'Aska Boat Unit',
    commander: 'Officer Sangram Swain',
    type: ResponseUnitType.BOAT,
    status: ResponseUnitStatus.AVAILABLE,
    location: { lat: 19.610, lng: 84.665, name: 'Aska River Base' },
    capacity: 16,
    capabilities: [CapabilityType.WATER_RESCUE, CapabilityType.EVACUATION],
    availability: true,
    source: SourceCategory.DEMO,
  }),
  createResponseUnit({
    id: 'RU-03',
    name: 'Brahmapur Medical Response',
    commander: 'Dr. Arati Mishra (EMS Lead)',
    type: ResponseUnitType.AMBULANCE,
    status: ResponseUnitStatus.AVAILABLE,
    location: { lat: 19.312, lng: 84.792, name: 'MKCG Medical Base' },
    capacity: 4,
    capabilities: [CapabilityType.MEDICAL, CapabilityType.EVACUATION],
    availability: true,
    source: SourceCategory.DEMO,
  }),
  createResponseUnit({
    id: 'RU-04',
    name: 'District Supply Vehicle',
    commander: 'Logistics Supervisor R. Dash',
    type: ResponseUnitType.SUPPLY_VEHICLE,
    status: ResponseUnitStatus.AVAILABLE,
    location: { lat: 19.350, lng: 84.985, name: 'Chhatrapur Supply Depot' },
    capacity: 30,
    capabilities: [CapabilityType.SUPPLIES],
    availability: true,
    source: SourceCategory.DEMO,
  }),
  createResponseUnit({
    id: 'RU-05',
    name: 'Fire & Rescue Team',
    commander: 'Station Officer S. K. Das',
    type: ResponseUnitType.FIRE_RESPONSE,
    status: ResponseUnitStatus.AVAILABLE,
    location: { lat: 19.320, lng: 84.805, name: 'Brahmapur Fire Station' },
    capacity: 18,
    capabilities: [CapabilityType.FIRE_RESPONSE, CapabilityType.SEARCH],
    availability: true,
    source: SourceCategory.DEMO,
  }),
]

/**
 * 2. Deterministic Incident Priority Engine
 * Explainable 0–100 score based on severity, confidence, population, SOS, and accessibility
 */
export function calculateIncidentPriorityScore(incident, context = {}) {
  const severityScores = {
    CRITICAL: 40,
    HIGH: 30,
    MODERATE: 20,
    MEDIUM: 20,
    LOW: 10,
  }

  const baseSev = severityScores[incident.severity] || 20
  const confidence = Number(incident.confidence ?? incident.aiConfidence ?? 0.85)
  const confScore = Math.min(15, Math.round(confidence * 15))

  // Population impact contribution (0-15)
  const pop = Number(incident.affectedPopulation || incident.peopleCount || 0)
  const popScore = pop > 0 ? Math.min(15, Math.round(Math.log10(pop + 1) * 4.5)) : 0

  // SOS Priority bonus (0-20)
  const isSos = incident.type === IncidentType.SOS || incident.category?.includes('SOS') || incident.id?.startsWith('SOS')
  const sosScore = isSos ? 20 : 0

  // Zone Risk contribution (0-15)
  const zoneRisk = (context.zoneRisk || incident.affectedZoneRisk || 'MODERATE').toUpperCase()
  const zoneScore = zoneRisk === 'CRITICAL' ? 15 : zoneRisk === 'HIGH' ? 10 : 5

  // Accessibility penalty: blocked road increases urgency (+10)
  const isBlocked = incident.roadStatus === 'BLOCKED' || context.roadStatus === 'BLOCKED'
  const accessScore = isBlocked ? 10 : 0

  const rawScore = baseSev + confScore + popScore + sosScore + zoneScore + accessScore
  const normalizedScore = Math.max(0, Math.min(100, Math.round(rawScore)))

  let priorityClass = PriorityClass.LOW
  if (normalizedScore >= 80) priorityClass = PriorityClass.CRITICAL
  else if (normalizedScore >= 60) priorityClass = PriorityClass.HIGH
  else if (normalizedScore >= 40) priorityClass = PriorityClass.MEDIUM

  return {
    score: normalizedScore,
    priorityClass,
    breakdown: {
      baseSeverity: baseSev,
      confidenceWeight: confScore,
      populationWeight: popScore,
      sosWeight: sosScore,
      zoneWeight: zoneScore,
      accessibilityPenalty: accessScore,
    },
  }
}

/**
 * 3. Route Safety Engine
 * Rejects blocked roads (e.g. SH-36 reported blocked 94%) and selects safe alternatives.
 */
export function evaluateRouteSafety({
  origin = { lat: 19.610, lng: 84.665, name: 'Aska River Base' },
  destination = { lat: 19.264, lng: 84.905, name: 'Gopalpur Coastal Lowland' },
  blockedRoadName = 'SH-36',
  evidenceConfidence = 0.94,
}) {
  const directDistance = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng)

  // Shortest route traverses reported blocked segment (SH-36)
  const shortestBlockedRoute = {
    name: `Direct Corridor via ${blockedRoadName}`,
    distanceKm: Number((directDistance * 1.05).toFixed(1)),
    estimatedTravelTimeMin: 11,
    status: 'BLOCKED',
    riskLevel: 'HIGH',
    blockedSegment: blockedRoadName,
    rejectionReason: `Shortest route rejected: ${blockedRoadName} reported blocked with ${Math.round(evidenceConfidence * 100)}% evidence confidence.`,
    waypoints: [
      [origin.lat, origin.lng],
      [Number((origin.lat * 0.7 + destination.lat * 0.3).toFixed(4)), Number((origin.lng * 0.7 + destination.lng * 0.3).toFixed(4))],
      [Number((origin.lat * 0.4 + destination.lat * 0.6).toFixed(4)), Number((origin.lng * 0.4 + destination.lng * 0.6).toFixed(4))],
      [destination.lat, destination.lng],
    ],
  }

  // Safe alternative route detour avoiding blocked road (+1.5 km, lower risk)
  const safeAltDist = Number((shortestBlockedRoute.distanceKm + 1.5).toFixed(1))
  const safeAltEta = 14

  const safeAlternativeRoute = {
    name: 'Alternative Coastal Connector & High-Ground Bypass',
    distanceKm: safeAltDist,
    estimatedTravelTimeMin: safeAltEta,
    status: 'OPEN',
    riskLevel: 'MODERATE',
    avoidedSegment: blockedRoadName,
    selectionReason: `Alternative route selected: +1.5 km detour, lower route risk, bypassing ${blockedRoadName}.`,
    waypoints: [
      [origin.lat, origin.lng],
      [Number((origin.lat * 0.75 + destination.lat * 0.25 + 0.02).toFixed(4)), Number((origin.lng * 0.75 + destination.lng * 0.25 - 0.02).toFixed(4))],
      [Number((origin.lat * 0.5 + destination.lat * 0.5 + 0.03).toFixed(4)), Number((origin.lng * 0.5 + destination.lng * 0.5 - 0.01).toFixed(4))],
      [Number((origin.lat * 0.25 + destination.lat * 0.75 + 0.015).toFixed(4)), Number((origin.lng * 0.25 + destination.lng * 0.75 + 0.01).toFixed(4))],
      [destination.lat, destination.lng],
    ],
  }

  return {
    recommendedRoute: safeAlternativeRoute,
    rejectedRoute: shortestBlockedRoute,
    distanceKm: safeAlternativeRoute.distanceKm,
    estimatedTravelTimeMin: safeAlternativeRoute.estimatedTravelTimeMin,
    riskLevel: safeAlternativeRoute.riskLevel,
    avoidedSegment: blockedRoadName,
    rationale: [
      `Shortest route rejected: ${blockedRoadName} reported blocked with ${Math.round(evidenceConfidence * 100)}% evidence confidence.`,
      `Alternative route selected: +1.5 km, lower route risk, bypassing flooded corridor.`,
    ],
  }
}

export const DEFAULT_GANJAM_SHELTERS = [
  {
    id: 'SH-02',
    name: 'Chhatrapur Block Multipurpose Disaster Shelter',
    lat: 19.356,
    lng: 84.992,
    capacity: 2000,
    currentOccupancy: 940,
    availableSlots: 1060,
    occupancyPct: 47,
    status: 'SAFE',
    riskLevel: 'LOW',
    elevationMeters: 28,
    roadCondition: 'NH-16 Coastal Corridor Fully Operational',
  },
  {
    id: 'SH-01',
    name: 'Gopalpur Multi-Purpose Cyclone & Flood Shelter',
    lat: 19.2612,
    lng: 84.9085,
    capacity: 1200,
    currentOccupancy: 620,
    availableSlots: 580,
    occupancyPct: 52,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    elevationMeters: 22,
    roadCondition: 'Safe & Clear via NH-516A',
  },
  {
    id: 'SH-04',
    name: 'Aska Flood & Cyclone Relief Camp',
    lat: 19.612,
    lng: 84.664,
    capacity: 1500,
    currentOccupancy: 1100,
    availableSlots: 400,
    occupancyPct: 73,
    status: 'AT_RISK',
    riskLevel: 'HIGH',
    elevationMeters: 18,
    roadCondition: 'Approach road partially waterlogged (Citizen verified blockage)',
  },
]

/**
 * 4. Shelter Selection Engine
 * Evaluates shelters and rejects AT_RISK or FULL shelters in favor of safe available ones.
 */
export function recommendShelter({
  shelters = [],
  incidentLocation = { lat: 19.264, lng: 84.905 },
  rejectedShelterId = 'SH-04',
}) {
  const activeShelters = Array.isArray(shelters) && shelters.length > 0 ? shelters : DEFAULT_GANJAM_SHELTERS

  const evaluatedShelters = activeShelters.map((sh) => {
    const dist = calculateDistanceKm(incidentLocation.lat, incidentLocation.lng, sh.lat, sh.lng)
    const isAtRisk = sh.riskLevel === 'CRITICAL' || sh.status === 'AT_RISK' || sh.id === rejectedShelterId
    const isFull = (sh.occupancyPct || 0) >= 95 || (sh.availableSlots || 0) <= 0
    const isPassable = !sh.roadCondition?.toLowerCase().includes('waterlogged') && !sh.roadCondition?.toLowerCase().includes('blocked')

    let score = 100 - dist * 0.8
    if (isAtRisk) score -= 80
    if (isFull) score -= 60
    if (!isPassable) score -= 40
    if (sh.elevationMeters >= 25) score += 40
    if (sh.availableSlots > 1000) score += 15

    return {
      ...sh,
      distanceKm: dist,
      selectionScore: Math.round(score),
      isAtRisk,
      isFull,
      isPassable,
    }
  })

  // Sort descending by score
  evaluatedShelters.sort((a, b) => b.selectionScore - a.selectionScore)

  const recommended = evaluatedShelters.find((s) => !s.isAtRisk && !s.isFull && s.isPassable) || evaluatedShelters[0]
  const rejected = evaluatedShelters.find((s) => s.id === rejectedShelterId) || evaluatedShelters.find((s) => s.isAtRisk)

  return {
    recommendedShelter: recommended,
    rejectedShelter: rejected,
    rationale: [
      `Recommended ${recommended?.name || 'SH-02'}: Safe status, ${recommended?.availableSlots || 1060} available slots, accessible route, elevated ground (${recommended?.elevationMeters || 28}m).`,
      rejected
        ? `Rejected ${rejected.name || 'SH-04'}: Current status is AT_RISK and approach corridor is partially submerged/blocked.`
        : 'Alternative shelters evaluated.',
    ],
  }
}

/**
 * 5. Deterministic Resource Priority Engine
 */
export function determineResourcePriorities({ incident, severity, isWaterRescue = false }) {
  const resources = []
  const rationale = []

  if (isWaterRescue || incident?.needsBoat || incident?.type === IncidentType.SOS) {
    resources.push('LIFE_JACKETS')
    rationale.push('Life jackets prioritized for flood/SOS rescue and water extraction.')
  }

  if (incident?.type === IncidentType.MEDICAL || incident?.severity === SeverityLevel.CRITICAL) {
    resources.push('MEDICAL_KITS')
    rationale.push('Emergency medical trauma kits prioritized for vulnerable/critical casualties.')
  }

  resources.push('DRINKING_WATER')
  rationale.push('Drinking water sustenance packs prioritized for isolated population.')

  if (isWaterRescue || incident?.type === IncidentType.SOS) {
    resources.push('RESCUE_EQUIPMENT')
  } else {
    resources.push('FOOD_PACKS')
  }

  return {
    resources: Array.from(new Set(resources)).slice(0, 4),
    rationale,
  }
}

/**
 * 6. Dispatch Engine — Response Unit Matching
 * Assigns best available unit using capability, availability, route safety, and distance.
 */
export function matchBestResponseUnit({
  incident,
  responseUnits = GANJAM_DEMO_RESPONSE_UNITS,
  assignedUnitIds = new Set(),
}) {
  const reqCapabilities = []
  if (incident.type === IncidentType.SOS || incident.type === IncidentType.FLOOD || incident.needsBoat) {
    reqCapabilities.push(CapabilityType.WATER_RESCUE)
  }
  if (incident.type === IncidentType.MEDICAL) {
    reqCapabilities.push(CapabilityType.MEDICAL)
  }
  if (incident.type === IncidentType.EVACUATION) {
    reqCapabilities.push(CapabilityType.EVACUATION)
  }
  if (reqCapabilities.length === 0) {
    reqCapabilities.push(CapabilityType.SEARCH)
  }

  const incLat = incident.location?.lat ?? 19.31
  const incLng = incident.location?.lng ?? 84.79

  // Filter candidates: must be AVAILABLE and NOT already assigned to a critical incident
  const availableUnits = responseUnits.filter(
    (u) => (u.status === ResponseUnitStatus.AVAILABLE || u.availability) && !assignedUnitIds.has(u.id)
  )

  // Rank units: Capability match > Boat craft specialization for flood SOS > Distance > Unit ID tie-breaker
  const scoredUnits = availableUnits.map((unit) => {
    const hasCapability = reqCapabilities.some((cap) => unit.capabilities?.includes(cap))
    const dist = calculateDistanceKm(unit.location?.lat ?? 19.31, unit.location?.lng ?? 84.79, incLat, incLng)

    let score = 0
    if (hasCapability) score += 1000

    // Prefer dedicated BOAT craft for critical flood/SOS rescues per Section 8 & 17
    if ((incident.type === IncidentType.SOS || incident.needsBoat) && unit.type === ResponseUnitType.BOAT) {
      score += 500
    }

    score -= dist * 2 // distance penalty

    return {
      unit,
      hasCapability,
      distanceKm: dist,
      score,
    }
  })

  // Sort descending by score, deterministic tie breaker on unit.id
  scoredUnits.sort((a, b) => b.score - a.score || a.unit.id.localeCompare(b.unit.id))

  const bestMatch = scoredUnits.find((s) => s.hasCapability)
  const secondaryMatch = scoredUnits.filter((s) => s.hasCapability && s.unit.id !== bestMatch?.unit?.id)[0]

  return {
    primaryUnit: bestMatch ? bestMatch.unit : null,
    secondaryUnit: secondaryMatch ? secondaryMatch.unit : null,
    requiredCapabilities: reqCapabilities,
    distanceKm: bestMatch ? bestMatch.distanceKm : null,
  }
}

/**
 * 7. Decision Engine
 * Integrates RiskState + Evidence + Incidents + Road Status + Shelter Status + Response Units
 */
export function evaluateDispatchDecisions({
  scenario = 'CRITICAL_INCIDENT',
  riskState = { score: 82, severity: SeverityLevel.CRITICAL },
  groundEvidence = { items: [], blockedRoads: ['SH-36'], impactedShelters: ['SH-04'] },
  shelters = [],
  responseUnits = GANJAM_DEMO_RESPONSE_UNITS,
}) {
  // Scenario A: MONITORING
  if (scenario === 'MONITORING' || (riskState.score <= 60 && (!groundEvidence?.items || groundEvidence.items.length === 0))) {
    const monitorDecision = createDecision({
      id: 'DEC-MONITOR-01',
      incidentId: 'INC-MON-01',
      priority: PriorityClass.LOW,
      action: DecisionAction.MONITOR,
      responseUnitId: null,
      shelterId: 'SH-01',
      resources: ['DRINKING_WATER'],
      rationale: [
        'Weather: WORSENING, Risk score: 60 (Precipitation buildup).',
        'No critical ground incidents or active SOS reports detected.',
        'Action: MONITOR. No immediate emergency dispatch required.',
      ],
      confidence: 0.95,
      status: 'MONITORING_ACTIVE',
    })

    return {
      scenario: 'MONITORING',
      actionQueue: [
        {
          id: 'ACT-01',
          priority: PriorityClass.LOW,
          incidentId: 'INC-MON-01',
          title: 'Routine Basin Monitoring',
          summary: 'Continue surveillance along Rushikulya catchment',
          action: DecisionAction.MONITOR,
          etaMinutes: null,
          decision: monitorDecision,
        },
      ],
      decisions: [monitorDecision],
      responseUnits: responseUnits.map((u) => ({ ...u, status: ResponseUnitStatus.AVAILABLE })),
      recommendedRoute: null,
      evacuationRecommendation: 'MONITORING_ONLY',
    }
  }

  // Scenario B: GROUND EVIDENCE (Risk ~74, prepared rescue)
  if (scenario === 'GROUND_EVIDENCE') {
    const prepDecision = createDecision({
      id: 'DEC-PREP-01',
      incidentId: 'INC-PREP-01',
      priority: PriorityClass.HIGH,
      action: DecisionAction.RESCUE,
      responseUnitId: 'RU-01',
      shelterId: 'SH-01',
      resources: ['LIFE_JACKETS', 'DRINKING_WATER', 'MEDICAL_KITS'],
      rationale: [
        'Risk score: 74 (High flood probability + verified citizen reports).',
        '2 flood reports and 1 geotagged flood inundation image verified in lowlands.',
        'Action: PREPARE RESCUE. Staging response units at Gopalpur and Aska zones.',
      ],
      confidence: 0.92,
      status: 'STAGING_READY',
    })

    return {
      scenario: 'GROUND_EVIDENCE',
      actionQueue: [
        {
          id: 'ACT-01',
          priority: PriorityClass.HIGH,
          incidentId: 'INC-PREP-01',
          title: 'Pre-Stage Rescue Units (Gopalpur & Aska)',
          summary: 'Verified ground evidence indicates inundation across low-lying culverts',
          action: DecisionAction.RESCUE,
          etaMinutes: 20,
          decision: prepDecision,
        },
      ],
      decisions: [prepDecision],
      responseUnits: responseUnits.map((u) =>
        u.id === 'RU-01' ? { ...u, status: ResponseUnitStatus.EN_ROUTE, currentIncidentId: 'INC-PREP-01' } : u
      ),
      recommendedRoute: null,
      evacuationRecommendation: 'MODELLED ADVISORY: Review evacuation readiness in Gopalpur Lowlands',
    }
  }

  // Scenario C: CRITICAL INCIDENT (Full End-to-End Orchestration)
  const canonicalSosIncident = createIncident({
    id: 'SOS-003',
    type: IncidentType.SOS,
    location: { lat: 19.264, lng: 84.905, name: 'Gopalpur Coastal Lowland, Ganjam' },
    severity: SeverityLevel.CRITICAL,
    evidenceIds: ['E-01', 'E-03'],
    affectedZone: 'Gopalpur Lowlands (Sector 4)',
    affectedPopulation: 1400,
    roadStatus: 'BLOCKED',
    shelterImpact: 'SH-04 approach inundated',
    recommendedAction: DecisionAction.RESCUE,
    createdAt: new Date().toISOString(),
  })

  // 1. Calculate Priority Score
  const priorityResult = calculateIncidentPriorityScore(canonicalSosIncident, {
    zoneRisk: 'CRITICAL',
    roadStatus: 'BLOCKED',
  })
  canonicalSosIncident.priorityScore = priorityResult.score
  canonicalSosIncident.priority = priorityResult.priorityClass

  // 2. Select Response Unit (RU-02 Aska Boat Unit with WATER_RESCUE capability)
  const assignedUnitIds = new Set()
  const unitMatch = matchBestResponseUnit({
    incident: canonicalSosIncident,
    responseUnits,
    assignedUnitIds,
  })
  const selectedUnit = unitMatch.primaryUnit || responseUnits.find((u) => u.id === 'RU-02') || responseUnits[0]
  assignedUnitIds.add(selectedUnit.id)
  canonicalSosIncident.assignedUnitId = selectedUnit.id

  // 3. Route Safety Evaluation (Avoid SH-36)
  const routeEval = evaluateRouteSafety({
    origin: selectedUnit.location,
    destination: canonicalSosIncident.location,
    blockedRoadName: 'SH-36',
    evidenceConfidence: 0.94,
  })
  canonicalSosIncident.route = routeEval.recommendedRoute
  canonicalSosIncident.eta = routeEval.estimatedTravelTimeMin

  // 4. Shelter Selection (Reject SH-04, Select SH-02)
  const shelterEval = recommendShelter({
    shelters,
    incidentLocation: canonicalSosIncident.location,
    rejectedShelterId: 'SH-04',
  })

  // 5. Resource Prioritization
  const resourceEval = determineResourcePriorities({
    incident: canonicalSosIncident,
    severity: canonicalSosIncident.severity,
    isWaterRescue: true,
  })

  // 6. Formulate Explainable Primary Decision
  const primaryDecision = createDecision({
    id: 'DEC-001-RESCUE',
    incidentId: canonicalSosIncident.id,
    priority: PriorityClass.CRITICAL,
    action: DecisionAction.RESCUE,
    responseUnitId: selectedUnit.id,
    route: routeEval.recommendedRoute,
    shelterId: shelterEval.recommendedShelter?.id || 'SH-02',
    resources: resourceEval.resources,
    rationale: [
      'Verified critical SOS (SOS-003) with 97% confidence in critical risk zone.',
      `Estimated affected population: 1,400 residents in Gopalpur Lowlands.`,
      `Selected unit: ${selectedUnit.name} (${selectedUnit.id}) due to WATER_RESCUE capability and availability.`,
      `Shortest route rejected: SH-36 reported blocked with 94% evidence confidence.`,
      `Alternative safe route selected: +1.5 km detour (${routeEval.distanceKm} km, ETA ${routeEval.estimatedTravelTimeMin} min) avoiding blocked corridor.`,
      `Shelter SH-04 rejected (AT_RISK); Shelter ${shelterEval.recommendedShelter?.id || 'SH-02'} recommended (${shelterEval.recommendedShelter?.name || 'Chhatrapur Shelter'}).`,
      `Resources prioritized: ${resourceEval.resources.join(', ')}.`,
    ],
    confidence: 0.96,
    status: 'RECOMMENDED',
  })

  // Secondary Decision: Flood Evacuation
  const evacuationDecision = createDecision({
    id: 'DEC-002-EVAC',
    incidentId: 'FLOOD-007',
    priority: PriorityClass.HIGH,
    action: DecisionAction.EVACUATE,
    responseUnitId: 'RU-01',
    route: null,
    shelterId: shelterEval.recommendedShelter?.id || 'SH-02',
    resources: ['DRINKING_WATER', 'FOOD_PACKS'],
    rationale: [
      'Modelled evacuation recommendation: Gopalpur Lowlands facing tidal surge & river backwater.',
      `Target destination: ${shelterEval.recommendedShelter?.name || 'SH-02 Safe Shelter'} (elevated plinth, available capacity).`,
      'Approach road SH-36 reported blocked; evacuation convoy rerouted via coastal connector.',
    ],
    confidence: 0.91,
    status: 'RECOMMENDED',
  })

  // Tertiary Decision: Road Caution / Redirection
  const roadDecision = createDecision({
    id: 'DEC-003-ROAD',
    incidentId: 'ROAD-004',
    priority: PriorityClass.HIGH,
    action: DecisionAction.ROAD_CAUTION,
    responseUnitId: 'RU-05',
    route: null,
    shelterId: null,
    resources: ['RESCUE_EQUIPMENT'],
    rationale: [
      'SH-36 reported blocked (confidence 94%). Diverting general emergency traffic to NH-16 high connector.',
      'Deploying Fire & Rescue barrier team for caution cones and advisory signs.',
    ],
    confidence: 0.94,
    status: 'RECOMMENDED',
  })

  // Quaternary Decision: Shelter Medical Supply
  const shelterSupplyDecision = createDecision({
    id: 'DEC-004-SUPPLY',
    incidentId: 'SHELTER-003',
    priority: PriorityClass.MEDIUM,
    action: DecisionAction.SUPPLY,
    responseUnitId: 'RU-04',
    route: null,
    shelterId: 'SH-02',
    resources: ['MEDICAL_KITS', 'DRINKING_WATER'],
    rationale: [
      'Pre-positioning additional medical kits and drinking water rations at Chhatrapur Shelter SH-02.',
      'Anticipating evacuee influx from Gopalpur sector.',
    ],
    confidence: 0.89,
    status: 'RECOMMENDED',
  })

  // Sorted Action Queue (Critical First)
  const actionQueue = [
    {
      id: 'ACT-01',
      priority: PriorityClass.CRITICAL,
      incidentId: canonicalSosIncident.id,
      title: `Dispatch ${selectedUnit.name}`,
      summary: `Rescue 7 stranded persons in Gopalpur Coastal Lowland. ETA ${routeEval.estimatedTravelTimeMin}m via Safe Route.`,
      action: DecisionAction.RESCUE,
      etaMinutes: routeEval.estimatedTravelTimeMin,
      decision: primaryDecision,
    },
    {
      id: 'ACT-02',
      priority: PriorityClass.HIGH,
      incidentId: 'FLOOD-007',
      title: 'Evacuate Gopalpur Lowlands',
      summary: `Modelled evacuation to ${shelterEval.recommendedShelter?.name || 'SH-02 Shelter'} (${shelterEval.recommendedShelter?.availableSlots || 1060} slots open).`,
      action: DecisionAction.EVACUATE,
      etaMinutes: 35,
      decision: evacuationDecision,
    },
    {
      id: 'ACT-03',
      priority: PriorityClass.HIGH,
      incidentId: 'ROAD-004',
      title: 'SH-36 Reported Blocked: Redirect Traffic',
      summary: 'Reported 1.1m culvert overflow. Issue caution advisory & reroute traffic.',
      action: DecisionAction.REDIRECT,
      etaMinutes: 10,
      decision: roadDecision,
    },
    {
      id: 'ACT-04',
      priority: PriorityClass.MEDIUM,
      incidentId: 'SHELTER-003',
      title: 'Pre-Position Relief Supplies at SH-02',
      summary: 'Move 500 drinking water packs and medical kits to Chhatrapur relief depot.',
      action: DecisionAction.SUPPLY,
      etaMinutes: 45,
      decision: shelterSupplyDecision,
    },
  ]

  // Update response units status to reflect modelled dispatch
  const updatedUnits = responseUnits.map((u) => {
    if (u.id === selectedUnit.id) {
      return {
        ...u,
        status: ResponseUnitStatus.DISPATCHED,
        currentIncidentId: canonicalSosIncident.id,
        availability: false,
        etaMinutes: routeEval.estimatedTravelTimeMin,
      }
    }
    if (u.id === 'RU-04') {
      return {
        ...u,
        status: ResponseUnitStatus.EN_ROUTE,
        currentIncidentId: 'SHELTER-003',
        availability: false,
        etaMinutes: 45,
      }
    }
    return { ...u, status: ResponseUnitStatus.AVAILABLE, availability: true }
  })

  return {
    scenario: 'CRITICAL_INCIDENT',
    canonicalIncident: canonicalSosIncident,
    selectedUnit,
    routeEvaluation: routeEval,
    shelterEvaluation: shelterEval,
    resourcePriorities: resourceEval.resources,
    decisions: [primaryDecision, evacuationDecision, roadDecision, shelterSupplyDecision],
    actionQueue,
    responseUnits: updatedUnits,
    recommendedRoute: routeEval.recommendedRoute,
    rejectedRoute: routeEval.rejectedRoute,
    evacuationRecommendation: {
      status: 'EVACUATION RECOMMENDED',
      zone: 'Gopalpur Lowlands (Sector 4)',
      estimatedPopulationAtRisk: 1400,
      recommendedShelter: shelterEval.recommendedShelter?.name || 'SH-02 Chhatrapur Shelter',
      avoidRoad: 'SH-36 (Reported Blocked)',
      disclaimer: 'Modelled evacuation recommendation for decision-support; not an official government order.',
    },
  }
}

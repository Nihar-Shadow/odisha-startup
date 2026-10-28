/**
 * Resource Allocation, Evacuation Optimization & Operational Planning Engine — Phase 9
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 *
 * Deterministic Decision & Optimization Layer:
 * Canonical Risk + Exposure + Vulnerability + Infrastructure + Response Priority
 *   -> Resource Allocation Engine
 *   -> Evacuation Planning & Batches
 *   -> Multi-Shelter Capacity Matching
 *   -> Mission Sequencing & Conflict Resolution
 *   -> Dynamic Reallocation & Pre-Positioning
 *   -> Operational Timeline
 */

import {
  ResourceAssetType,
  ResourceAssetStatus,
  createResourceAsset,
  MissionType,
  MissionStatus,
  MissionPriorityClass,
  createMission,
  EvacuationStatus,
  createEvacuationPlan,
  SupplyType,
  createSupplyRequirement,
  createOperationalPlan,
  createOperationalTimeline,
} from '../../../domain/contracts.js'

import { GANJAM_DEMO_RESPONSE_UNITS, calculateDistanceKm } from '../dispatch/dispatchEngine.js'

/**
 * 1. Deterministic Resource Catalog
 * Reuses existing Response Units from Phase 5 and adds specialized logistical assets.
 * Explicitly tagged with DEMO / MODELLED OPERATIONAL CAPACITY provenance.
 */
export function getModelledResourceAssets() {
  const units = GANJAM_DEMO_RESPONSE_UNITS.map((u) =>
    createResourceAsset({
      id: u.id,
      name: u.name,
      type: u.type === 'BOAT' ? ResourceAssetType.BOAT :
            u.type === 'AMBULANCE' ? ResourceAssetType.AMBULANCE :
            u.type === 'SUPPLY_VEHICLE' ? ResourceAssetType.SUPPLY_VEHICLE :
            u.type === 'FIRE_RESPONSE' ? ResourceAssetType.FIRE_TEAM :
            ResourceAssetType.RESCUE_UNIT,
      location: u.location,
      capacity: u.capacity || 15,
      availableCapacity: u.capacity || 15,
      capabilities: u.capabilities || [],
      status: u.status === 'AVAILABLE' ? ResourceAssetStatus.AVAILABLE : ResourceAssetStatus.ASSIGNED,
      operatingRange: u.type === 'BOAT' ? 30 : 65,
      responseTime: u.id === 'RU-02' ? 14 : 18,
      currentAssignment: null,
      source: 'MODELLED_OPERATIONAL_CAPACITY',
      provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
      metadata: { commander: u.commander },
    })
  )

  // Additional support assets
  const extraAssets = [
    createResourceAsset({
      id: 'RES-MED-01',
      name: 'MKCG Mobile Trauma Team',
      type: ResourceAssetType.MEDICAL_TEAM,
      location: { lat: 19.312, lng: 84.792, name: 'MKCG Medical College' },
      capacity: 8,
      availableCapacity: 8,
      capabilities: ['MEDICAL', 'TRAUMA_CARE', 'EVACUATION'],
      status: ResourceAssetStatus.AVAILABLE,
      operatingRange: 50,
      responseTime: 15,
      source: 'MODELLED_OPERATIONAL_CAPACITY',
      provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    }),
    createResourceAsset({
      id: 'RES-TANK-01',
      name: 'Chhatrapur Water Tanker 01',
      type: ResourceAssetType.WATER_TANKER,
      location: { lat: 19.355, lng: 84.99, name: 'Chhatrapur Municipal Yard' },
      capacity: 5000, // Liters
      availableCapacity: 5000,
      capabilities: ['SUPPLIES', 'DRINKING_WATER'],
      status: ResourceAssetStatus.AVAILABLE,
      operatingRange: 70,
      responseTime: 22,
      source: 'MODELLED_OPERATIONAL_CAPACITY',
      provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    }),
    createResourceAsset({
      id: 'RES-PUMP-01',
      name: 'Aska Dewatering High-Volume Pump',
      type: ResourceAssetType.PUMP,
      location: { lat: 19.612, lng: 84.658, name: 'Aska Irrigation Office' },
      capacity: 2500, // Liters/min
      availableCapacity: 2500,
      capabilities: ['INFRASTRUCTURE_PROTECTION', 'DEWATERING'],
      status: ResourceAssetStatus.AVAILABLE,
      operatingRange: 20,
      responseTime: 12,
      source: 'MODELLED_OPERATIONAL_CAPACITY',
      provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    }),
    createResourceAsset({
      id: 'RES-SUP-02',
      name: 'Brahmapur Relief Cargo Truck',
      type: ResourceAssetType.SUPPLY_VEHICLE,
      location: { lat: 19.318, lng: 84.802, name: 'Brahmapur Civil Supplies Depot' },
      capacity: 40,
      availableCapacity: 40,
      capabilities: ['SUPPLIES', 'FOOD', 'LOGISTICS'],
      status: ResourceAssetStatus.AVAILABLE,
      operatingRange: 80,
      responseTime: 20,
      source: 'MODELLED_OPERATIONAL_CAPACITY',
      provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    }),
  ]

  return [...units, ...extraAssets]
}

/**
 * 2. Deterministic Mission Priority Score Formula
 * Normalizes 0–100 score based on 8 core operational criteria:
 * Zone Priority + Incident Severity + Vulnerable Population + SOS + Infra Criticality + Time Sensitivity + Route Access + Resource Avail
 */
export function calculateMissionPriorityScore({
  zonePriority = 80,
  incidentSeverity = 'HIGH',
  vulnerablePopulation = 1000,
  isSOS = false,
  infrastructureCriticality = 'HIGH',
  timeSensitivity = 'URGENT',
  routeAccessible = true,
  resourceAvailable = true,
} = {}) {
  const sevScores = { CRITICAL: 20, HIGH: 15, MODERATE: 10, MEDIUM: 10, LOW: 5 }
  const infraScores = { CRITICAL: 15, HIGH: 10, MODERATE: 7, LOW: 3 }
  const timeScores = { IMMEDIATE: 15, URGENT: 12, STANDARD: 8, FLEXIBLE: 4 }

  let score = 0
  score += Math.round((Number(zonePriority) || 0) * 0.25) // Up to 25 pts
  score += (sevScores[incidentSeverity] || 10)             // Up to 20 pts
  score += Math.min(15, Math.round(((Number(vulnerablePopulation) || 0) / 2500) * 15)) // Up to 15 pts
  if (isSOS) score += 15                                  // 15 pts bonus for SOS
  score += (infraScores[infrastructureCriticality] || 5)  // Up to 15 pts
  score += (timeScores[timeSensitivity] || 8)             // Up to 15 pts
  if (routeAccessible) score += 5                         // 5 pts for reachable route
  if (resourceAvailable) score += 5                       // 5 pts for ready compatibility

  return Math.max(0, Math.min(100, score))
}

/**
 * 3. Shelter Catalog with Capacity and Elevation
 * Phase 8/9 Ground Truth
 */
export const MODELLED_SHELTERS = [
  {
    id: 'SH-02',
    name: 'Chhatrapur Multi-Purpose Cyclone Shelter',
    location: { lat: 19.352, lng: 84.988, name: 'Chhatrapur Inland Ridge' },
    elevationMeters: 28,
    totalCapacity: 1200,
    availableSlots: 1060,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'LOW',
    isSafe: true,
  },
  {
    id: 'SH-03',
    name: 'Hinjilicut High School Cyclone Shelter',
    location: { lat: 19.48, lng: 84.75, name: 'Hinjilicut Higher Grounds' },
    elevationMeters: 22,
    totalCapacity: 1000,
    availableSlots: 900,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'LOW',
    isSafe: true,
  },
  {
    id: 'SH-05',
    name: 'Digapahandi Community Hall & Shelter',
    location: { lat: 19.37, lng: 84.58, name: 'Digapahandi Elevated Campus' },
    elevationMeters: 35,
    totalCapacity: 950,
    availableSlots: 800,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'LOW',
    isSafe: true,
  },
  {
    id: 'SH-04',
    name: 'Gopalpur Coastal Cyclone Shelter',
    location: { lat: 19.26, lng: 84.91, name: 'Gopalpur Coastal Belt' },
    elevationMeters: 4,
    totalCapacity: 800,
    availableSlots: 540,
    currentStatus: 'AT_RISK',
    riskLevel: 'CRITICAL',
    isSafe: false,
    surgeExposureRisk: 92,
    rejectionReason: 'Coastal surge corridor risk (92%) — Inaccessible approach road. DO NOT ROUTE EVACUEES.',
  },
]

/**
 * 4. Multi-Shelter Evacuation Optimizer
 * Allocates vulnerable populations across safe shelters while respecting capacity.
 * Strictly skips AT_RISK or unsafe shelters.
 */
export function optimizeMultiShelterAllocation({
  zoneId = 'ZONE-GANJAM-02',
  targetPopulation = 2600,
  shelters = MODELLED_SHELTERS,
} = {}) {
  let remaining = Number(targetPopulation) || 0
  const allocations = []
  const rejectedShelters = []

  // Filter and sort safe shelters by elevation and available capacity descending
  const safeShelters = shelters.filter((s) => {
    if (!s.isSafe || s.currentStatus === 'AT_RISK' || s.riskLevel === 'CRITICAL') {
      rejectedShelters.push({
        shelterId: s.id,
        name: s.name,
        reason: s.rejectionReason || 'Shelter is AT_RISK or structurally compromised',
      })
      return false
    }
    return s.availableSlots > 0
  }).sort((a, b) => b.availableSlots - a.availableSlots)

  for (const s of safeShelters) {
    if (remaining <= 0) break
    const take = Math.min(remaining, s.availableSlots)
    allocations.push({
      shelterId: s.id,
      shelterName: s.name,
      allocatedCount: take,
      availableCapacity: s.availableSlots,
      remainingAvailableAfter: s.availableSlots - take,
      elevationMeters: s.elevationMeters,
      location: s.location,
      reason: `Safe elevated shelter with ${s.availableSlots} available slots.`,
    })
    remaining -= take
  }

  const totalAllocated = allocations.reduce((acc, curr) => acc + curr.allocatedCount, 0)

  return {
    zoneId,
    targetPopulation,
    totalAllocated,
    unallocatedPopulation: remaining,
    allocations,
    rejectedShelters,
    status: remaining === 0 ? 'FULLY_ALLOCATED' : 'CAPACITY_LIMITED',
  }
}

/**
 * 5. Evacuation Batch Generator
 * Sequentially prioritizes mobility-limited, elderly + children, and high-risk residents.
 */
export function generateEvacuationBatches({
  vulnerablePopulation = 2600,
  elderlyPopulation = 1150,
  childrenPopulation = 920,
  mobilityLimitedPopulation = 530,
  highRiskPopulation = 1500,
  totalExposed = 7200,
} = {}) {
  const batch1Count = mobilityLimitedPopulation || 530
  const batch2Count = (elderlyPopulation && childrenPopulation) ? (elderlyPopulation + childrenPopulation) : 2070
  const batch3Count = highRiskPopulation || 1500
  const batch4Count = Math.max(0, totalExposed - (batch1Count + batch2Count + batch3Count)) || 3100

  return [
    {
      batchNumber: 1,
      category: 'VULNERABLE_PRIORITY',
      targetGroup: 'Mobility-Limited Residents & Wheelchair Dependent',
      count: batch1Count,
      priority: 98,
      recommendedTransport: 'Low-floor ambulances & high-clearance medical vans (RU-03 / RES-MED-01)',
      status: 'IMMEDIATE',
    },
    {
      batchNumber: 2,
      category: 'VULNERABLE_PRIORITY',
      targetGroup: 'Elderly (≥65) and Young Children (<10)',
      count: batch2Count,
      priority: 94,
      recommendedTransport: 'Shuttle buses and high-capacity rescue vehicles (RU-02 / RU-05)',
      status: 'URGENT',
    },
    {
      batchNumber: 3,
      category: 'GENERAL_EXPOSURE',
      targetGroup: 'Inundated Low-Lying Households',
      count: batch3Count,
      priority: 84,
      recommendedTransport: 'Multi-trip boat and all-terrain rescue transports',
      status: 'HIGH',
    },
    {
      batchNumber: 4,
      category: 'GENERAL_EXPOSURE',
      targetGroup: 'General Exposed Population in Buffer Zone',
      count: batch4Count,
      priority: 65,
      recommendedTransport: 'Standard road convoy via designated safe detour corridors',
      status: 'PLANNED',
    },
  ]
}

/**
 * 6. Deterministic Supply Demand Calculator
 * Modelled operational demand formulas.
 */
export function calculateSupplyRequirements({
  zoneId = 'ZONE-GANJAM-02',
  vulnerableCount = 2600,
  exposedCount = 7200,
  days = 2,
  isIsolated = true,
} = {}) {
  // Modelled operational assumptions:
  // Water: 2L per person per day
  // Food: 2 rations per person per day
  // Medical kits: 1 kit per 50 vulnerable persons
  // Life jackets: 1 per vulnerable person in severe flood zone
  const waterLiters = exposedCount * 2 * days
  const foodPacks = exposedCount * 2 * days
  const medKits = Math.ceil(vulnerableCount / 50) * (isIsolated ? 2 : 1)
  const lifeJackets = Math.min(3000, vulnerableCount + 400)

  return [
    createSupplyRequirement({
      id: `SUP-WAT-${zoneId}`,
      zoneId,
      type: SupplyType.DRINKING_WATER,
      requiredQuantity: waterLiters,
      allocatedQuantity: Math.min(15000, waterLiters),
      priority: 92,
      unit: 'Liters',
      destination: 'Aska Central Evacuation Staging Post',
      status: 'ALLOCATED',
    }),
    createSupplyRequirement({
      id: `SUP-MED-${zoneId}`,
      zoneId,
      type: SupplyType.MEDICAL_KIT,
      requiredQuantity: medKits,
      allocatedQuantity: medKits,
      priority: 95,
      unit: 'Standard Emergency Kits',
      destination: 'Aska Sub-Divisional Hospital Support Post',
      status: 'ALLOCATED',
    }),
    createSupplyRequirement({
      id: `SUP-LJ-${zoneId}`,
      zoneId,
      type: SupplyType.LIFE_JACKET,
      requiredQuantity: lifeJackets,
      allocatedQuantity: lifeJackets,
      priority: 90,
      unit: 'Units',
      destination: 'Aska Boat Rescue Staging Post',
      status: 'ALLOCATED',
    }),
    createSupplyRequirement({
      id: `SUP-FOOD-${zoneId}`,
      zoneId,
      type: SupplyType.FOOD,
      requiredQuantity: foodPacks,
      allocatedQuantity: Math.min(10000, foodPacks),
      priority: 80,
      unit: 'Dry Ration Packs',
      destination: 'Chhatrapur Relief Shelter SH-02',
      status: 'ALLOCATED',
    }),
    createSupplyRequirement({
      id: `SUP-PWR-${zoneId}`,
      zoneId,
      type: SupplyType.EMERGENCY_POWER,
      requiredQuantity: 4,
      allocatedQuantity: 4,
      priority: 88,
      unit: '25kVA Mobile Diesel Generators',
      destination: 'Aska Substation / Hospital Backup Grid',
      status: 'ALLOCATED',
    }),
  ]
}

/**
 * 7. Constrained Resource Allocation Optimizer (Greedy with Preemption / Dynamic Reallocation)
 * Core Phase 9 algorithm matching requirements from Sections 8, 9, 10, 20, 28:
 * - Capability matching (e.g. WATER_RESCUE requires boat)
 * - Capacity matching (assigns multiple units or flags trip requirements)
 * - Route accessibility check (rejects missions through BLOCKED paths unless water rescue)
 * - Conflict resolution (higher priority preempts or reserves units; displaced mission becomes RESOURCE_CONSTRAINED)
 */
export function optimizeResourceAllocation({
  missions = [],
  resources = getModelledResourceAssets(),
  routes = { primaryBlocked: true, detourAvailable: true },
} = {}) {
  // Deep clone resources to track dynamic availability & capacity
  const resourcePool = resources.map((r) => ({
    ...r,
    currentAssignment: r.currentAssignment || null,
    availableCapacity: r.availableCapacity !== undefined ? r.availableCapacity : r.capacity,
  }))

  // Sort missions descending by priority
  const sortedMissions = [...missions].sort((a, b) => b.priority - a.priority)

  const allocations = []
  const constrainedMissions = []
  const reassignmentLogs = []

  for (const mission of sortedMissions) {
    // Route Safety Validation: If primary route is blocked and mission has no safe detour and requires land access
    if (routes.primaryBlocked && !routes.detourAvailable && mission.missionType !== MissionType.WATER_RESCUE) {
      allocations.push({
        missionId: mission.id,
        missionType: mission.missionType,
        priority: mission.priority,
        status: MissionStatus.BLOCKED,
        selectedResources: [],
        rejectedResources: [],
        capacityCoverage: 0,
        estimatedETA: null,
        constraints: ['EVACUATION_ROUTE_UNAVAILABLE: Arterial route blocked and no certified detour corridor.'],
        rationale: 'Mission blocked pending access clearance or alternative amphibian transport.',
      })
      continue
    }

    // Filter compatible resources
    const compatible = resourcePool.filter((r) => {
      if (r.status === ResourceAssetStatus.MAINTENANCE || r.status === ResourceAssetStatus.UNAVAILABLE) return false
      // Capability Check
      if (mission.missionType === MissionType.WATER_RESCUE) {
        return r.capabilities.includes('WATER_RESCUE') || r.type === ResourceAssetType.BOAT
      }
      if (mission.missionType === MissionType.MEDICAL_EVACUATION || mission.missionType === MissionType.MEDICAL_ACCESS) {
        return r.capabilities.includes('MEDICAL') || r.type === ResourceAssetType.AMBULANCE || r.type === ResourceAssetType.MEDICAL_TEAM
      }
      if (mission.missionType === MissionType.SUPPLY_DELIVERY) {
        return r.capabilities.includes('SUPPLIES') || r.type === ResourceAssetType.SUPPLY_VEHICLE
      }
      if (mission.missionType === MissionType.INFRASTRUCTURE_PROTECTION) {
        return r.capabilities.includes('INFRASTRUCTURE_PROTECTION') || r.type === ResourceAssetType.PUMP || r.type === ResourceAssetType.FIRE_TEAM
      }
      return true
    })

    if (compatible.length === 0) {
      constrainedMissions.push(mission)
      allocations.push({
        missionId: mission.id,
        missionType: mission.missionType,
        priority: mission.priority,
        status: MissionStatus.RESOURCE_CONSTRAINED,
        selectedResources: [],
        rejectedResources: [],
        capacityCoverage: 0,
        estimatedETA: null,
        constraints: ['No compatible available rescue resource in operational sector.'],
        rationale: 'Reassign lower-priority mission or request external state NDRF/ODRAF support.',
      })
      continue
    }

    // Sort compatible resources:
    // 1. Currently AVAILABLE first
    // 2. Shortest distance / response time
    // 3. Higher capacity
    const availableNow = compatible.filter((r) => r.status === ResourceAssetStatus.AVAILABLE && r.availableCapacity > 0)

    let selected = []
    let coveredCapacity = 0
    const neededCapacity = mission.requiredCapacity || 1

    if (availableNow.length > 0) {
      // Sort by proximity to destination
      availableNow.sort((a, b) => {
        const distA = calculateDistanceKm(a.location.lat, a.location.lng, mission.destination.lat, mission.destination.lng)
        const distB = calculateDistanceKm(b.location.lat, b.location.lng, mission.destination.lat, mission.destination.lng)
        return distA - distB
      })

      // Select resources until capacity met
      for (const res of availableNow) {
        selected.push(res)
        coveredCapacity += res.availableCapacity
        res.status = ResourceAssetStatus.ASSIGNED
        res.currentAssignment = mission.id
        if (coveredCapacity >= neededCapacity) break
      }
    } else {
      // Dynamic Reallocation / Preemption:
      // Check if lower priority mission holds a needed resource
      const preemptable = compatible.find((r) => {
        if (!r.currentAssignment) return false
        const currentM = sortedMissions.find((m) => m.id === r.currentAssignment)
        return currentM && currentM.priority < mission.priority
      })

      if (preemptable) {
        const displacedMission = sortedMissions.find((m) => m.id === preemptable.currentAssignment)
        const logMsg = `${preemptable.name} (${preemptable.id}) reassigned from lower-priority mission (${displacedMission.id}, priority ${displacedMission.priority}) to higher-priority life-safety mission (${mission.id}, priority ${mission.priority}).`
        reassignmentLogs.push(logMsg)

        // Preempt unit
        preemptable.currentAssignment = mission.id
        preemptable.status = ResourceAssetStatus.ASSIGNED
        selected.push(preemptable)
        coveredCapacity += preemptable.capacity

        // Mark displaced mission as constrained/delayed in allocations
        const existingAlloc = allocations.find((a) => a.missionId === displacedMission.id)
        if (existingAlloc) {
          existingAlloc.status = MissionStatus.DELAYED
          existingAlloc.constraints.push('Resource preempted for higher-priority life-safety mission.')
          existingAlloc.rationale = `Displaced: ${logMsg}`
          existingAlloc.selectedResources = existingAlloc.selectedResources.filter((r) => r.id !== preemptable.id)
        }
      }
    }

    if (selected.length === 0) {
      constrainedMissions.push(mission)
      const isPreemptedOrDelayed = reassignmentLogs.some((l) => l.includes(mission.id))
      allocations.push({
        missionId: mission.id,
        missionType: mission.missionType,
        priority: mission.priority,
        status: isPreemptedOrDelayed ? MissionStatus.DELAYED : MissionStatus.RESOURCE_CONSTRAINED,
        selectedResources: [],
        rejectedResources: compatible.map((r) => ({ id: r.id, name: r.name, reason: `Currently occupied by assignment ${r.currentAssignment}` })),
        capacityCoverage: 0,
        estimatedETA: null,
        constraints: [
          isPreemptedOrDelayed
            ? 'Resource preempted and reassigned to higher-priority life-safety mission.'
            : 'All compatible resources currently committed to equal or higher priority operations.',
        ],
        rationale: isPreemptedOrDelayed
          ? 'DELAYED: Resource reassigned to higher-priority life-safety water rescue.'
          : 'RESOURCE CONSTRAINED: Mission delayed until fleet returns or external support arrives.',
      })
    } else {
      const eta = Math.max(...selected.map((r) => r.responseTime || 15))
      const multiTripNeeded = coveredCapacity < neededCapacity
      allocations.push({
        missionId: mission.id,
        missionType: mission.missionType,
        priority: mission.priority,
        status: MissionStatus.ASSIGNED,
        selectedResources: selected.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          capacity: r.capacity,
          capabilities: r.capabilities,
        })),
        rejectedResources: compatible.filter((r) => !selected.some((s) => s.id === r.id)).map((r) => ({ id: r.id, name: r.name, reason: 'Secondary option or capacity already fulfilled' })),
        capacityCoverage: coveredCapacity,
        requiredCapacity: neededCapacity,
        multiTripNeeded,
        estimatedETA: eta,
        constraints: multiTripNeeded ? [`Total required capacity (${neededCapacity}) exceeds single-pass fleet capacity (${coveredCapacity}); 2 trips required.`] : [],
        rationale: `${selected.map((r) => r.id).join(' + ')} selected based on capability match (${mission.missionType}), proximity, and safe detour corridor.`,
      })
    }
  }

  return {
    allocations,
    constrainedMissions,
    reassignmentLogs,
    updatedResources: resourcePool,
  }
}

/**
 * 8. Resource Pre-Positioning Advisory Engine
 * Section 18: Generates operational recommendations where resources should stage BEFORE storm surge or flash flood peak.
 */
export function getPrePositioningRecommendations({
  scenario = 'CRITICAL_OPERATION',
  cycloneActive = true,
  floodRiskHigh = true,
} = {}) {
  return [
    {
      id: 'PREPOS-01',
      resourceId: 'RU-02',
      resourceName: 'Aska Boat Unit',
      stagingArea: 'Aska River Bridge Staging Post (Elevated NH Corridor)',
      targetZone: 'ZONE-GANJAM-02 (Aska Floodplain)',
      reason: 'Rushikulya River gauge at 16.40m nearing danger mark. Pre-stage boat fleet before SH-36 cuts off road access.',
      status: 'RECOMMENDED',
      urgency: 'HIGH',
    },
    {
      id: 'PREPOS-02',
      resourceId: 'RU-03',
      resourceName: 'Brahmapur Medical Response (EMS)',
      stagingArea: 'Aska Sub-Divisional Hospital High-Ground Perimeter',
      targetZone: 'INFRA-HOSP-01 Sector',
      reason: 'Protect critical medical access corridor and ensure continuous emergency patient transfer.',
      status: 'RECOMMENDED',
      urgency: 'HIGH',
    },
    {
      id: 'PREPOS-03',
      resourceId: 'RES-TANK-01',
      resourceName: 'Chhatrapur Water Tanker 01',
      stagingArea: 'Chhatrapur Multi-Purpose Shelter SH-02',
      targetZone: 'SHELTER-SH02',
      reason: 'Pre-position 5,000L potable drinking water at primary reception shelter before vulnerable evacuee arrival.',
      status: 'RECOMMENDED',
      urgency: 'HIGH',
    },
    {
      id: 'PREPOS-04',
      resourceId: 'RU-05',
      resourceName: 'Fire & Rescue Team',
      stagingArea: 'Hinjilicut Inland Road Junction',
      targetZone: 'Detour Bypass Highway Corridor',
      reason: 'Maintain heavy tree-clearing and pump capabilities along designated evacuation detour route.',
      status: 'RECOMMENDED',
      urgency: 'MEDIUM',
    },
  ]
}

/**
 * 9. Operational Timeline Engine
 * Section 21: Modelled Response Timeline
 */
export function getOperationalTimeline(scenario = 'CRITICAL_OPERATION') {
  const stages = [
    {
      step: 1,
      timeOffset: 'T+00 min',
      event: 'Risk Escalation Detected',
      details: 'Multi-hazard sensor fusion registers 89 CRITICAL composite risk across Ganjam basin.',
      status: 'COMPLETED',
    },
    {
      step: 2,
      timeOffset: 'T+05 min',
      event: 'Critical Zone & Vulnerability Identified',
      details: 'Aska Floodplain flagged with Priority 96: 2,600 vulnerable residents and isolated hospital.',
      status: 'COMPLETED',
    },
    {
      step: 3,
      timeOffset: 'T+08 min',
      event: 'RU-02 Boat Fleet Pre-Positioned',
      details: 'Officer Swain tasked to stage boat units at Aska Bridge access point ahead of road cutoff.',
      status: 'ACTIVE',
    },
    {
      step: 4,
      timeOffset: 'T+12 min',
      event: 'Evacuation Batch 1 Begins',
      details: 'Mobility-limited residents (530 persons) initiated transfer via medical transports to SH-02.',
      status: 'IN_PROGRESS',
    },
    {
      step: 5,
      timeOffset: 'T+15 min',
      event: 'SH-36 Closed & Detour Activated',
      details: 'State Highway 36 closed due to 1.8m inundation; traffic diverted to safe inland detour (+1.5 km).',
      status: 'SCHEDULED',
    },
    {
      step: 6,
      timeOffset: 'T+20 min',
      event: 'Hospital Alternate Access Corridor Secured',
      details: 'Amphibian transfer staging established at Aska Sub-Divisional Hospital.',
      status: 'SCHEDULED',
    },
    {
      step: 7,
      timeOffset: 'T+25 min',
      event: 'Chhatrapur Shelter SH-02 Receives Evacuees',
      details: 'First batch of 1,060 evacuees processed into elevated shelter with pre-positioned water and kits.',
      status: 'SCHEDULED',
    },
  ]

  return createOperationalTimeline({
    scenario,
    stages,
    provenance: 'MODELLED RESPONSE TIMELINE',
  })
}

/**
 * 10. Master Operational Plan Generator
 * Synthesizes the full Phase 9 operational plan across all 5 demo scenarios:
 * MONITORING, GROUND_EVIDENCE, SATELLITE_CONFIRMED, CYCLONE_APPROACHING, CRITICAL_OPERATION
 */
export function generateOperationalPlan(scenario = 'CRITICAL_OPERATION', overrides = {}) {
  const resources = overrides.resources || getModelledResourceAssets()

  // Scenario specific parameters
  let missions = []
  let vulnerableTarget = 2600
  let shelterDemand = 2600
  let primaryBlocked = true
  let detourAvailable = true

  if (scenario === 'MONITORING') {
    vulnerableTarget = 1800
    primaryBlocked = false
    missions = [
      createMission({
        id: 'MIS-MON-01',
        zoneId: 'ZONE-GANJAM-01',
        missionType: MissionType.SEARCH_AND_RESCUE,
        priority: 45,
        requiredCapacity: 4,
        rationale: 'Baseline surveillance and gauge monitoring along Rushikulya riverbanks.',
      }),
    ]
  } else if (scenario === 'GROUND_EVIDENCE') {
    vulnerableTarget = 2300
    primaryBlocked = true
    missions = [
      createMission({
        id: 'MIS-GRD-01',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.ROAD_CLEARANCE,
        priority: 76,
        requiredCapacity: 10,
        rationale: 'Inspect and clear drainage obstacles near SH-36 approach road.',
      }),
      createMission({
        id: 'MIS-GRD-02',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.MEDICAL_ACCESS,
        priority: 72,
        requiredCapacity: 4,
        rationale: 'Establish medical support link to Gopalpur Primary Health Center.',
      }),
    ]
  } else if (scenario === 'SATELLITE_CONFIRMED') {
    vulnerableTarget = 2600
    primaryBlocked = true
    missions = [
      createMission({
        id: 'MIS-SAT-01',
        incidentId: 'SOS-003',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.WATER_RESCUE,
        priority: 94,
        requiredCapacity: 16,
        rationale: 'Radar confirms 57 km² inundation; extract 16 trapped individuals in Aska flood sector.',
      }),
      createMission({
        id: 'MIS-SAT-02',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.SUPPLY_DELIVERY,
        priority: 82,
        requiredCapacity: 25,
        rationale: 'Deliver drinking water and rations to Aska high-ground staging post.',
      }),
    ]
  } else if (scenario === 'CYCLONE_APPROACHING') {
    vulnerableTarget = 2900
    primaryBlocked = true
    missions = [
      createMission({
        id: 'MIS-CYC-01',
        incidentId: 'SOS-003',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.WATER_RESCUE,
        priority: 98,
        requiredCapacity: 16,
        rationale: 'Severe gale & storm surge threat; immediate water rescue for vulnerable family.',
      }),
      createMission({
        id: 'MIS-CYC-02',
        zoneId: 'ZONE-GANJAM-01',
        missionType: MissionType.SHELTER_SUPPORT,
        priority: 91,
        requiredCapacity: 12,
        rationale: 'Close surge-compromised SH-04 shelter and enforce redirect to inland SH-02.',
      }),
      createMission({
        id: 'MIS-CYC-03',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.MEDICAL_EVACUATION,
        priority: 89,
        requiredCapacity: 6,
        rationale: 'Evacuate high-dependency patients from isolated Aska Sub-Divisional Hospital.',
      }),
    ]
  } else {
    // CRITICAL_OPERATION (Default full comprehensive plan)
    vulnerableTarget = 3600
    shelterDemand = 2600
    primaryBlocked = true
    detourAvailable = true
    missions = [
      createMission({
        id: 'MIS-CRIT-01',
        incidentId: 'SOS-003',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.WATER_RESCUE,
        priority: 98,
        requiredCapacity: 16,
        rationale: 'URGENT LIFE SAFETY: Extract 16 trapped villagers in Aska low-lying floodplain sector.',
      }),
      createMission({
        id: 'MIS-CRIT-02',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.EVACUATION,
        priority: 96,
        requiredCapacity: 18, // Intentionally exceeds 16 to demonstrate multi-unit / multi-trip
        rationale: 'Batch 1 Evacuation: Transfer mobility-limited and elderly residents to Shelter SH-02.',
      }),
      createMission({
        id: 'MIS-CRIT-03',
        zoneId: 'INFRA-HOSP-01',
        missionType: MissionType.MEDICAL_ACCESS,
        priority: 91,
        requiredCapacity: 8,
        rationale: 'Protect Aska Sub-Divisional Hospital alternate corridor and deliver trauma packs.',
      }),
      createMission({
        id: 'MIS-CRIT-04',
        zoneId: 'INFRA-SHELTER-04',
        missionType: MissionType.SHELTER_SUPPORT,
        priority: 89,
        requiredCapacity: 10,
        rationale: 'Enforce perimeter closure of surge-threatened SH-04; divert incoming buses to SH-02.',
      }),
      createMission({
        id: 'MIS-CRIT-05',
        zoneId: 'ZONE-GANJAM-02',
        missionType: MissionType.SUPPLY_DELIVERY,
        priority: 78,
        requiredCapacity: 25,
        rationale: 'Deliver 5,000L drinking water and emergency kits to primary evacuation staging post.',
      }),
    ]
  }

  // 1. Optimize Resources
  const allocationResult = optimizeResourceAllocation({
    missions,
    resources,
    routes: { primaryBlocked, detourAvailable },
  })

  // 2. Multi-Shelter Evacuation
  const shelterResult = optimizeMultiShelterAllocation({
    zoneId: 'ZONE-GANJAM-02',
    targetPopulation: shelterDemand,
  })

  // 3. Evacuation Batches
  const evacuationBatches = generateEvacuationBatches({
    vulnerablePopulation: vulnerableTarget,
    elderlyPopulation: Math.round(vulnerableTarget * 0.44),
    childrenPopulation: Math.round(vulnerableTarget * 0.35),
    mobilityLimitedPopulation: Math.round(vulnerableTarget * 0.21),
    totalExposed: 7200,
  })

  // 4. Evacuation Plan
  const evacuationPlan = createEvacuationPlan({
    id: `EVAC-ASKA-${scenario}`,
    zoneId: 'ZONE-GANJAM-02',
    sourcePopulation: 7200,
    vulnerablePopulation: vulnerableTarget,
    destinationShelter: 'SH-02',
    shelterAllocations: shelterResult.allocations,
    requiredCapacity: shelterDemand,
    allocatedCapacity: shelterResult.totalAllocated,
    remainingPopulation: shelterResult.unallocatedPopulation,
    route: detourAvailable ? 'Safe Detour via SH-36 Bypass (+1.5 km, 14 min ETA)' : 'BLOCKED',
    estimatedTime: 25,
    priority: 96,
    batches: evacuationBatches,
    status: shelterResult.unallocatedPopulation === 0 ? EvacuationStatus.IN_PROGRESS : EvacuationStatus.CAPACITY_LIMITED,
    rationale: [
      'Multi-shelter distribution ensures zero overcrowding at primary elevated facility SH-02.',
      'Coastal shelter SH-04 strictly excluded due to coastal surge risk.',
      'Batched evacuation ensures mobility-limited and elderly residents are rescued first.',
    ],
  })

  // 5. Supply Requirements
  const supplyRequirements = calculateSupplyRequirements({
    zoneId: 'ZONE-GANJAM-02',
    vulnerableCount: vulnerableTarget,
    exposedCount: 7200,
    days: 2,
    isIsolated: primaryBlocked,
  })

  // 6. Pre-Positioning
  const prePositioning = getPrePositioningRecommendations({
    scenario,
    cycloneActive: scenario === 'CYCLONE_APPROACHING' || scenario === 'CRITICAL_OPERATION',
    floodRiskHigh: true,
  })

  return createOperationalPlan({
    scenario,
    generatedAt: new Date().toISOString(),
    priorityMissions: allocationResult.allocations,
    evacuationPlans: [evacuationPlan],
    resourceAllocations: allocationResult.allocations,
    shelterAllocations: shelterResult.allocations,
    supplyAllocations: supplyRequirements,
    prePositioning,
    blockedActions: allocationResult.allocations.filter((a) => a.status === MissionStatus.BLOCKED),
    unresolvedNeeds: allocationResult.constrainedMissions,
    assumptions: [
      'Drinking water baseline: 2 Liters per person per day (MODELLED OPERATIONAL ASSUMPTION)',
      'Primary evacuation route via SH-36 bypass detour (+1.5 km) actively patrolled',
      'High-ground shelters (SH-02, SH-03, SH-05) maintain backup generators and safe plinths',
      'All allocations are decision-support recommendations and respect physical asset capacities',
    ],
    provenance: 'MODELLED OPERATIONAL PLAN',
  })
}

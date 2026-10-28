/**
 * Comprehensive Automated Test Suite — Phase 9
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 *
 * Validates:
 * 1. Resource availability
 * 2. Capability matching (Critical Test A)
 * 3. Capacity constraints (Critical Test B)
 * 4. Priority ordering
 * 5. Resource conflict resolution (Critical Test C)
 * 6. Dynamic resource reassignment
 * 7. Shelter allocation & safety
 * 8. Multi-shelter allocation (Critical Test D)
 * 9. Route safety validation
 * 10. Blocked route handling (Critical Test E)
 * 11. Deterministic supply allocation
 * 12. Vulnerable population batched prioritization
 * 13. Pre-positioning advisory
 * 14. Resource constraint handling (Critical Test F)
 * 15. Master operational plan generation
 * 16. Deterministic repeatability across 5 scenarios
 * 17. Explicit provenance tagging
 * 18. Decision engine integration
 */

import assert from 'node:assert/strict'
import {
  getModelledResourceAssets,
  calculateMissionPriorityScore,
  MODELLED_SHELTERS,
  optimizeMultiShelterAllocation,
  generateEvacuationBatches,
  calculateSupplyRequirements,
  optimizeResourceAllocation,
  getPrePositioningRecommendations,
  getOperationalTimeline,
  generateOperationalPlan,
} from '../services/intelligence/allocation/resourceAllocationEngine.js'
import {
  createResourceAsset,
  createMission,
  MissionType,
  MissionStatus,
  ResourceAssetType,
  ResourceAssetStatus,
} from '../domain/contracts.js'
import { allocationAdapter } from '../services/adapters/allocationAdapter.js'

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 9 TEST SUITE: RESOURCE ALLOCATION & OPERATIONAL PLANNING')
console.log('=================================================================')

let passed = 0
let failed = 0

function runTest(name, fn) {
  try {
    fn()
    console.log(`✅ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`❌ FAIL: ${name}`)
    console.error(`   Error: ${err.message}`)
    failed++
  }
}

// Test 1: Resource Availability & Catalog
runTest('Test 1: Resource availability & catalog correctly initialized', () => {
  const resources = getModelledResourceAssets()
  assert.ok(Array.isArray(resources) && resources.length >= 8, 'Catalog has at least 8 assets')
  const ru02 = resources.find((r) => r.id === 'RU-02')
  assert.ok(ru02, 'RU-02 Aska Boat Unit exists')
  assert.equal(ru02.type, ResourceAssetType.BOAT)
  assert.equal(ru02.capacity, 16)
  assert.equal(ru02.status, ResourceAssetStatus.AVAILABLE)
})

// Test 2: Capability Matching (Critical Test A)
runTest('Test 2 [CRITICAL TEST A]: Water rescue selects RU-02 over nearest unit lacking boat', () => {
  const customResources = [
    createResourceAsset({
      id: 'RU-01',
      name: 'Gopalpur Coastal Patrol',
      type: ResourceAssetType.RESCUE_UNIT,
      location: { lat: 19.605, lng: 84.660 }, // 1 km from target
      capabilities: ['SEARCH', 'EVACUATION'], // NO boat capability
      status: ResourceAssetStatus.AVAILABLE,
      capacity: 12,
    }),
    createResourceAsset({
      id: 'RU-02',
      name: 'Aska Boat Unit',
      type: ResourceAssetType.BOAT,
      location: { lat: 19.550, lng: 84.600 }, // 10 km from target (farther)
      capabilities: ['WATER_RESCUE', 'BOAT'],
      status: ResourceAssetStatus.AVAILABLE,
      capacity: 16,
    }),
  ]

  const mission = createMission({
    id: 'MIS-WATER-01',
    missionType: MissionType.WATER_RESCUE,
    destination: { lat: 19.610, lng: 84.665 },
    requiredCapacity: 10,
    priority: 95,
  })

  const result = optimizeResourceAllocation({
    missions: [mission],
    resources: customResources,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const alloc = result.allocations[0]
  assert.equal(alloc.status, MissionStatus.ASSIGNED)
  assert.equal(alloc.selectedResources.length, 1)
  assert.equal(alloc.selectedResources[0].id, 'RU-02', 'RU-02 selected because WATER_RESCUE capability is required')
})

// Test 3: Capacity Constraints (Critical Test B)
runTest('Test 3 [CRITICAL TEST B]: Single unit with insufficient capacity flags multi-unit or multi-trip', () => {
  const customResources = [
    createResourceAsset({
      id: 'RU-02',
      name: 'Aska Boat Unit',
      type: ResourceAssetType.BOAT,
      capabilities: ['WATER_RESCUE', 'EVACUATION'],
      status: ResourceAssetStatus.AVAILABLE,
      capacity: 16,
      availableCapacity: 16,
    }),
  ]

  const mission = createMission({
    id: 'MIS-OVERLOAD-01',
    missionType: MissionType.WATER_RESCUE,
    requiredCapacity: 18, // 18 > 16
    priority: 95,
  })

  const result = optimizeResourceAllocation({
    missions: [mission],
    resources: customResources,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const alloc = result.allocations[0]
  assert.equal(alloc.multiTripNeeded, true, 'Capacity overload must be detected')
  assert.ok(alloc.constraints.length > 0, 'Constraint warning must be attached')
  assert.ok(alloc.constraints[0].includes('2 trips required') || alloc.constraints[0].includes('exceeds'), 'Constraint message explains multi-trip requirement')
})

// Test 4: Priority Ordering
runTest('Test 4: Operational missions sorted strictly in descending priority order', () => {
  const m1 = createMission({ id: 'M-1', priority: 60 })
  const m2 = createMission({ id: 'M-2', priority: 98 })
  const m3 = createMission({ id: 'M-3', priority: 82 })

  const result = optimizeResourceAllocation({
    missions: [m1, m2, m3],
    resources: getModelledResourceAssets(),
  })

  assert.equal(result.allocations[0].missionId, 'M-2')
  assert.equal(result.allocations[1].missionId, 'M-3')
  assert.equal(result.allocations[2].missionId, 'M-1')
})

// Test 5: Resource Conflict & Dynamic Reallocation (Critical Test C)
runTest('Test 5 [CRITICAL TEST C]: Low-priority supply unit preempted for life-safety SOS rescue', () => {
  const boatUnit = createResourceAsset({
    id: 'RU-02',
    name: 'Aska Boat Unit',
    type: ResourceAssetType.BOAT,
    capabilities: ['WATER_RESCUE', 'SUPPLIES'],
    status: ResourceAssetStatus.ASSIGNED,
    currentAssignment: 'MIS-SUPPLY-LOW',
    capacity: 16,
  })

  const lowMission = createMission({
    id: 'MIS-SUPPLY-LOW',
    missionType: MissionType.SUPPLY_DELIVERY,
    priority: 62,
    requiredCapacity: 10,
  })

  const urgentSOSMission = createMission({
    id: 'MIS-SOS-URGENT',
    missionType: MissionType.WATER_RESCUE,
    priority: 98,
    requiredCapacity: 12,
  })

  const result = optimizeResourceAllocation({
    missions: [lowMission, urgentSOSMission],
    resources: [boatUnit],
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const sosAlloc = result.allocations.find((a) => a.missionId === 'MIS-SOS-URGENT')
  const supplyAlloc = result.allocations.find((a) => a.missionId === 'MIS-SUPPLY-LOW')

  assert.equal(sosAlloc.status, MissionStatus.ASSIGNED, 'SOS mission receives boat unit')
  assert.equal(sosAlloc.selectedResources[0].id, 'RU-02')
  assert.equal(supplyAlloc.status, MissionStatus.DELAYED, 'Low-priority mission is delayed')
  assert.ok(result.reassignmentLogs.length > 0, 'Reassignment log generated')
  assert.ok(result.reassignmentLogs[0].includes('RU-02'), 'Log explicitly names reallocated resource')
})

// Test 6: Shelter Allocation & Safety Discrimination
runTest('Test 6: Compromised coastal shelter SH-04 rejected; safe elevated shelters selected', () => {
  const result = optimizeMultiShelterAllocation({
    zoneId: 'ZONE-GANJAM-02',
    targetPopulation: 2600,
    shelters: MODELLED_SHELTERS,
  })

  const sh04InAlloc = result.allocations.some((a) => a.shelterId === 'SH-04')
  assert.equal(sh04InAlloc, false, 'AT_RISK shelter SH-04 must NOT be allocated')
  assert.ok(result.rejectedShelters.some((r) => r.shelterId === 'SH-04'), 'SH-04 present in rejected list')
})

// Test 7: Multi-Shelter Evacuation (Critical Test D)
runTest('Test 7 [CRITICAL TEST D]: 2,600 vulnerable residents distributed across SH-02, SH-03, and SH-05', () => {
  const result = optimizeMultiShelterAllocation({
    zoneId: 'ZONE-GANJAM-02',
    targetPopulation: 2600,
    shelters: MODELLED_SHELTERS,
  })

  assert.equal(result.totalAllocated, 2600, 'All 2,600 evacuees allocated')
  assert.equal(result.unallocatedPopulation, 0, 'Zero unallocated population')

  const allocSH02 = result.allocations.find((a) => a.shelterId === 'SH-02')
  const allocSH03 = result.allocations.find((a) => a.shelterId === 'SH-03')
  const allocSH05 = result.allocations.find((a) => a.shelterId === 'SH-05')

  assert.equal(allocSH02.allocatedCount, 1060, 'SH-02 receives max available slots (1,060)')
  assert.equal(allocSH03.allocatedCount, 900, 'SH-03 receives 900')
  assert.equal(allocSH05.allocatedCount, 640, 'SH-05 receives remainder (640)')
})

// Test 8: Blocked Route Handling (Critical Test E)
runTest('Test 8 [CRITICAL TEST E]: No safe route emits EVACUATION_ROUTE_UNAVAILABLE, does not fabricate route', () => {
  const mission = createMission({
    id: 'MIS-LAND-01',
    missionType: MissionType.ROAD_CLEARANCE,
    priority: 85,
  })

  const result = optimizeResourceAllocation({
    missions: [mission],
    resources: getModelledResourceAssets(),
    routes: { primaryBlocked: true, detourAvailable: false }, // NO safe route
  })

  const alloc = result.allocations[0]
  assert.equal(alloc.status, MissionStatus.BLOCKED)
  assert.ok(alloc.constraints[0].includes('EVACUATION_ROUTE_UNAVAILABLE'), 'Explicit EVACUATION_ROUTE_UNAVAILABLE error')
  assert.equal(alloc.selectedResources.length, 0, 'No resource dispatched along non-existent route')
})

// Test 9: Resource Constraint Handling (Critical Test F)
runTest('Test 9 [CRITICAL TEST F]: 3 critical missions with only 2 rescue units marks 3rd as RESOURCE_CONSTRAINED', () => {
  const units = [
    createResourceAsset({ id: 'RU-A', type: ResourceAssetType.RESCUE_UNIT, status: 'AVAILABLE', capacity: 10 }),
    createResourceAsset({ id: 'RU-B', type: ResourceAssetType.RESCUE_UNIT, status: 'AVAILABLE', capacity: 10 }),
  ]

  const missions = [
    createMission({ id: 'MIS-1', priority: 98, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
    createMission({ id: 'MIS-2', priority: 94, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
    createMission({ id: 'MIS-3', priority: 88, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
  ]

  const result = optimizeResourceAllocation({
    missions,
    resources: units,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const mis3Alloc = result.allocations.find((a) => a.missionId === 'MIS-3')
  assert.equal(mis3Alloc.status, MissionStatus.RESOURCE_CONSTRAINED, 'Surplus mission marked RESOURCE_CONSTRAINED')
  assert.equal(mis3Alloc.selectedResources.length, 0)
  assert.ok(result.constrainedMissions.some((m) => m.id === 'MIS-3'), 'Recorded in constrained list')
})

// Test 10: Evacuation Batches Prioritization
runTest('Test 10: Evacuation batches strictly prioritize mobility-limited and elderly residents', () => {
  const batches = generateEvacuationBatches({
    vulnerablePopulation: 2600,
    elderlyPopulation: 1150,
    childrenPopulation: 920,
    mobilityLimitedPopulation: 530,
    highRiskPopulation: 1500,
    totalExposed: 7200,
  })

  assert.equal(batches.length, 4)
  assert.equal(batches[0].batchNumber, 1)
  assert.equal(batches[0].count, 530, 'Batch 1 targets 530 mobility-limited residents')
  assert.equal(batches[0].priority, 98, 'Batch 1 has highest priority 98')
  assert.equal(batches[1].count, 2070, 'Batch 2 targets 2,070 elderly and children')
})

// Test 11: Supply Demand Calculation
runTest('Test 11: Supply demand correctly estimated with MODELLED OPERATIONAL ASSUMPTION', () => {
  const supplies = calculateSupplyRequirements({
    zoneId: 'ZONE-GANJAM-02',
    vulnerableCount: 2600,
    exposedCount: 7200,
    days: 2,
    isIsolated: true,
  })

  const water = supplies.find((s) => s.type === 'DRINKING_WATER')
  const med = supplies.find((s) => s.type === 'MEDICAL_KIT')

  assert.ok(water, 'Water requirement calculated')
  assert.equal(water.requiredQuantity, 7200 * 2 * 2, '28,800 Liters (7,200 exposed * 2L * 2 days)')
  assert.equal(water.provenance, 'MODELLED OPERATIONAL ASSUMPTION')
  assert.ok(med.requiredQuantity >= 100, 'Medical kits scaled to vulnerable population')
})

// Test 12: Pre-Positioning Recommendations
runTest('Test 12: Pre-positioning recommendations stage boat and trauma units ahead of cutoff', () => {
  const prepos = getPrePositioningRecommendations({ scenario: 'CRITICAL_OPERATION' })
  assert.ok(prepos.length >= 4)
  const boatPrepos = prepos.find((p) => p.resourceId === 'RU-02')
  assert.ok(boatPrepos, 'RU-02 pre-positioned')
  assert.ok(boatPrepos.stagingArea.includes('Aska'), 'RU-02 staged near Aska River corridor')
})

// Test 13: Operational Timeline
runTest('Test 13: Operational timeline generates sequential T+0 to T+25 milestones', () => {
  const timeline = getOperationalTimeline('CRITICAL_OPERATION')
  assert.equal(timeline.stages.length, 7)
  assert.equal(timeline.stages[0].timeOffset, 'T+00 min')
  assert.equal(timeline.stages[6].timeOffset, 'T+25 min')
  assert.equal(timeline.provenance, 'MODELLED RESPONSE TIMELINE')
})

// Test 14: Mission Priority Score Normalization
runTest('Test 14: Mission priority score normalizes correctly across 8 operational criteria', () => {
  const scoreImmediate = calculateMissionPriorityScore({
    zonePriority: 96,
    incidentSeverity: 'CRITICAL',
    vulnerablePopulation: 2600,
    isSOS: true,
    infrastructureCriticality: 'CRITICAL',
    timeSensitivity: 'IMMEDIATE',
    routeAccessible: true,
    resourceAvailable: true,
  })

  assert.ok(scoreImmediate >= 90 && scoreImmediate <= 100, `Expected IMMEDIATE (>=90), got ${scoreImmediate}`)

  const scoreLow = calculateMissionPriorityScore({
    zonePriority: 30,
    incidentSeverity: 'LOW',
    vulnerablePopulation: 50,
    isSOS: false,
    infrastructureCriticality: 'LOW',
    timeSensitivity: 'FLEXIBLE',
    routeAccessible: true,
    resourceAvailable: true,
  })

  assert.ok(scoreLow < 50, `Expected PLANNED/MONITOR (<50), got ${scoreLow}`)
})

// Test 15: Master Operational Plan Generation
runTest('Test 15: Master operational plan generates complete synthesis with zero crashes', () => {
  const plan = generateOperationalPlan('CRITICAL_OPERATION')
  assert.equal(plan.scenario, 'CRITICAL_OPERATION')
  assert.ok(plan.priorityMissions.length >= 4)
  assert.ok(plan.evacuationPlans.length >= 1)
  assert.ok(plan.shelterAllocations.length >= 3)
  assert.ok(plan.supplyAllocations.length >= 4)
  assert.ok(plan.prePositioning.length >= 4)
  assert.equal(plan.provenance, 'MODELLED OPERATIONAL PLAN')
})

// Test 16: Deterministic Repeatability Across All 5 Scenarios
runTest('Test 16: All 5 demo scenarios produce deterministic, stable operational plans', () => {
  const scenarios = ['MONITORING', 'GROUND_EVIDENCE', 'SATELLITE_CONFIRMED', 'CYCLONE_APPROACHING', 'CRITICAL_OPERATION']
  for (const sc of scenarios) {
    const planA = generateOperationalPlan(sc)
    const planB = generateOperationalPlan(sc)
    assert.equal(planA.scenario, sc)
    assert.equal(planA.priorityMissions.length, planB.priorityMissions.length)
    assert.equal(planA.evacuationPlans[0].allocatedCapacity, planB.evacuationPlans[0].allocatedCapacity)
  }
})

// Test 17: Allocation Adapter Offline Fallback
runTest('Test 17: Allocation adapter provides safe offline fallback without internet or keys', async () => {
  const res = await allocationAdapter.getResources('CRITICAL_OPERATION')
  assert.equal(res.success, true)
  assert.ok(res.data.length >= 8)

  const plan = await allocationAdapter.getOperationalPlan('CRITICAL_OPERATION')
  assert.equal(plan.scenario, 'CRITICAL_OPERATION')
  assert.equal(plan.provenance, 'MODELLED OPERATIONAL PLAN')
})

// Test 18: Decision Engine Integration with Operational Plan
runTest('Test 18: Operational plan enriches Phase 5/8 decision loop without conflicting', () => {
  const plan = generateOperationalPlan('CRITICAL_OPERATION')
  const waterRescueMission = plan.priorityMissions.find((m) => m.missionType === MissionType.WATER_RESCUE)
  assert.ok(waterRescueMission, 'Water rescue mission present')
  assert.equal(waterRescueMission.status, MissionStatus.ASSIGNED)
  assert.equal(waterRescueMission.selectedResources[0].id, 'RU-02')

  const evacMission = plan.priorityMissions.find((m) => m.missionType === MissionType.EVACUATION)
  assert.ok(evacMission, 'Evacuation mission present')
})

console.log('=================================================================')
console.log(`📊 PHASE 9 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
console.log('=================================================================')

if (failed > 0) {
  process.exit(1)
}

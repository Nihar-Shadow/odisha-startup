/**
 * Phase 10 Comprehensive Verification Suite: Final Command Center & Demo Hardening
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 */

import assert from 'assert'
import {
  CanonicalScenario,
  CANONICAL_SCENARIO_DEFINITIONS,
  getSynchronizedScenarios,
  DEMO_STAGES,
} from '../domain/canonicalState.js'


import {
  getModelledResourceAssets,
  calculateMissionPriorityScore,
  optimizeResourceAllocation,
  optimizeMultiShelterAllocation,
  generateEvacuationBatches,
  calculateSupplyRequirements,
  generateOperationalPlan,
  getOperationalTimeline,
} from '../services/intelligence/allocation/resourceAllocationEngine.js'

import {
  ResourceAssetType,
  ResourceAssetStatus,
  createResourceAsset,
  MissionType,
  MissionStatus,
  createMission,
} from '../domain/contracts.js'

let totalPassed = 0
let totalFailed = 0

function runTest(name, fn) {
  try {
    fn()
    console.log(`✅ PASS: ${name}`)
    totalPassed++
  } catch (err) {
    console.error(`❌ FAIL: ${name}`)
    console.error(`   Error: ${err.message}`)
    totalFailed++
  }
}

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 10 TEST SUITE: COMMAND CENTER & DEMO HARDENING')
console.log('=================================================================')

// Test 1: Scenario Synchronization
runTest('Test 1: Canonical scenarios definitions contain all 5 required operational phases', () => {
  const keys = Object.keys(CanonicalScenario)
  assert.equal(keys.length, 5)
  assert.ok(keys.includes('MONITORING'))
  assert.ok(keys.includes('GROUND_EVIDENCE'))
  assert.ok(keys.includes('SATELLITE_CONFIRMED'))
  assert.ok(keys.includes('CYCLONE_APPROACHING'))
  assert.ok(keys.includes('CRITICAL_OPERATION'))
})

// Test 2: Master Scenario Lockstep Mapping
runTest('Test 2: getSynchronizedScenarios maps all sub-engines in lockstep without drift', () => {
  const mon = getSynchronizedScenarios('MONITORING')
  assert.equal(mon.weather, 'BASELINE')
  assert.equal(mon.evidence, 'BASELINE')
  assert.equal(mon.satellite, 'NO_SATELLITE')
  assert.equal(mon.cyclone, 'NO_CYCLONE')
  assert.equal(mon.meta.canonicalRiskScore, 60)
  assert.equal(mon.meta.responsePriority, 45)

  const sat = getSynchronizedScenarios('SATELLITE_CONFIRMED')
  assert.equal(sat.satellite, 'SATELLITE_CONFIRMS')
  assert.equal(sat.meta.canonicalRiskScore, 81)
  assert.equal(sat.meta.responsePriority, 94)

  const cyc = getSynchronizedScenarios('CYCLONE_APPROACHING')
  assert.equal(cyc.cyclone, 'APPROACHING')
  assert.equal(cyc.meta.canonicalRiskScore, 89)
  assert.equal(cyc.meta.responsePriority, 98)

  const crit = getSynchronizedScenarios('CRITICAL_OPERATION')
  assert.equal(crit.operational, 'CRITICAL_OPERATION')
  assert.equal(crit.meta.responsePriority, 96)
})

// Test 3: 3-Minute Demo Sequence Progression
runTest('Test 3: 3-Minute Judge Demo stages contain 10 sequential milestones from T+00 to T+180', () => {
  assert.equal(DEMO_STAGES.length, 10)
  assert.equal(DEMO_STAGES[0].time, 'T+00')
  assert.equal(DEMO_STAGES[0].risk, 60)
  assert.equal(DEMO_STAGES[0].priority, 45)

  assert.equal(DEMO_STAGES[1].time, 'T+20')
  assert.equal(DEMO_STAGES[1].risk, 74)

  assert.equal(DEMO_STAGES[2].time, 'T+40')
  assert.equal(DEMO_STAGES[2].risk, 81)

  assert.equal(DEMO_STAGES[3].time, 'T+60')
  assert.equal(DEMO_STAGES[3].risk, 89)

  assert.equal(DEMO_STAGES[DEMO_STAGES.length - 1].time, 'T+180')
  assert.equal(DEMO_STAGES[DEMO_STAGES.length - 1].priority, 96)
})

// Test 4: Canonical Multi-Hazard Risk Monotonic Bounding
runTest('Test 4: Multi-hazard fusion score strictly bounded and never exceeds 100', () => {
  for (const stg of DEMO_STAGES) {
    assert.ok(stg.risk >= 0 && stg.risk <= 100, `Risk ${stg.risk} must be bounded [0, 100]`)
    assert.ok(stg.priority >= 0 && stg.priority <= 100, `Priority ${stg.priority} must be bounded [0, 100]`)
  }
})

// Test 5: Vulnerable Population vs General Exposure Distinction
runTest('Test 5: Explicit demographic distinction: 2,600 Vulnerable vs 4,600 General Exposure', () => {
  const batches = generateEvacuationBatches({
    vulnerablePopulation: 2600,
    mobilityLimitedPopulation: 530,
    elderlyPopulation: 1150,
    childrenPopulation: 920,
    highRiskPopulation: 1500,
    totalExposed: 7200,
  })

  assert.equal(batches.length, 4)
  assert.equal(batches[0].count, 530, 'Batch 1 mobility-limited: 530')
  assert.equal(batches[0].category, 'VULNERABLE_PRIORITY')

  assert.equal(batches[1].count, 2070, 'Batch 2 elderly/children: 2,070')
  assert.equal(batches[1].category, 'VULNERABLE_PRIORITY')

  const totalVulnerable = batches[0].count + batches[1].count
  assert.equal(totalVulnerable, 2600, 'Sum of Vulnerable Priority Batches is exactly 2,600')

  assert.equal(batches[2].count, 1500, 'Batch 3 inundated low-lying: 1,500')
  assert.equal(batches[2].category, 'GENERAL_EXPOSURE')

  assert.equal(batches[3].count, 3100, 'Batch 4 buffer zone: 3,100')
  assert.equal(batches[3].category, 'GENERAL_EXPOSURE')

  const totalGeneral = batches[2].count + batches[3].count
  assert.equal(totalGeneral, 4600, 'Sum of General Exposure Batches is exactly 4,600')
  assert.equal(totalVulnerable + totalGeneral, 7200, 'Total exposed population sums to 7,200')
})

// Test 6: Capability-Constrained Allocation (Critical Test A)
runTest('Test 6: Capability matching strictly routes water rescue to boat-capable unit', () => {
  const units = [
    createResourceAsset({ id: 'RU-01', capabilities: ['ROAD_CLEARANCE', 'FIRST_AID'], status: 'AVAILABLE', capacity: 16 }),
    createResourceAsset({ id: 'RU-02', capabilities: ['WATER_RESCUE', 'EVACUATION'], status: 'AVAILABLE', capacity: 16, type: ResourceAssetType.BOAT }),
  ]
  const mission = createMission({
    id: 'MIS-WATER-01',
    missionType: MissionType.WATER_RESCUE,
    priority: 98,
    requiredCapacity: 10,
  })

  const allocResult = optimizeResourceAllocation({
    missions: [mission],
    resources: units,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  assert.equal(allocResult.allocations[0].selectedResources[0].id, 'RU-02')
})

// Test 7: Capacity Constraint & Multi-Trip Flag (Critical Test B)
runTest('Test 7: Required capacity (18) exceeding unit capacity (16) flags multi-trip', () => {
  const units = [
    createResourceAsset({ id: 'RU-02', capabilities: ['WATER_RESCUE', 'EVACUATION'], status: 'AVAILABLE', capacity: 16, type: ResourceAssetType.BOAT }),
  ]
  const mission = createMission({
    id: 'MIS-CAP-01',
    missionType: MissionType.WATER_RESCUE,
    priority: 95,
    requiredCapacity: 18,
  })

  const allocResult = optimizeResourceAllocation({
    missions: [mission],
    resources: units,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  assert.ok(allocResult.allocations[0].multiTripNeeded, 'Must flag multiTripNeeded when demand > capacity')
})

// Test 8: Preemption & Reallocation (Critical Test C)
runTest('Test 8: High priority SOS (P-98) preempts unit from low priority supply mission (P-62)', () => {
  const units = [
    createResourceAsset({
      id: 'RU-02',
      capabilities: ['WATER_RESCUE', 'EVACUATION', 'SUPPLIES'],
      status: ResourceAssetStatus.ASSIGNED,
      currentAssignment: 'MIS-LOW-01',
      capacity: 16,
      type: ResourceAssetType.BOAT,
    }),
  ]

  const misLow = createMission({ id: 'MIS-LOW-01', priority: 62, missionType: MissionType.SUPPLY_DELIVERY })
  const misHigh = createMission({ id: 'MIS-HIGH-01', priority: 98, missionType: MissionType.WATER_RESCUE })

  const allocResult = optimizeResourceAllocation({
    missions: [misLow, misHigh],
    resources: units,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const highAlloc = allocResult.allocations.find((a) => a.missionId === 'MIS-HIGH-01')
  const lowAlloc = allocResult.allocations.find((a) => a.missionId === 'MIS-LOW-01')

  assert.equal(highAlloc.selectedResources[0].id, 'RU-02', 'High priority SOS gets RU-02')
  assert.equal(lowAlloc.status, MissionStatus.DELAYED, 'Low priority mission is DELAYED')
  assert.ok(allocResult.reassignmentLogs.length > 0, 'Reassignment is explicitly logged')
})

// Test 9: Shelter Safety Discrimination & Capacity Balancing (Critical Test D)
runTest('Test 9: Distributes 2,600 vulnerable evacuees across safe elevated shelters; rejects coastal surge shelter SH-04', () => {
  const result = optimizeMultiShelterAllocation({
    zoneId: 'ZONE-GANJAM-02',
    targetPopulation: 2600,
  })

  assert.equal(result.totalAllocated, 2600)
  assert.equal(result.unallocatedPopulation, 0)

  // Rejection check
  const sh04Allocated = result.allocations.some((a) => a.shelterId === 'SH-04')
  assert.equal(sh04Allocated, false, 'Surge shelter SH-04 must NOT be allocated')
  assert.ok(result.rejectedShelters.some((r) => r.shelterId === 'SH-04'))

  // Multi-shelter balancing
  const sh02 = result.allocations.find((a) => a.shelterId === 'SH-02')
  const sh03 = result.allocations.find((a) => a.shelterId === 'SH-03')
  const sh05 = result.allocations.find((a) => a.shelterId === 'SH-05')

  assert.equal(sh02.allocatedCount, 1060)
  assert.equal(sh03.allocatedCount, 900)
  assert.equal(sh05.allocatedCount, 640)
})

// Test 10: Blocked Route Handling (Critical Test E)
runTest('Test 10: Emits EVACUATION_ROUTE_UNAVAILABLE when no route exists; does not fabricate imaginary road', () => {
  const mission = createMission({
    id: 'MIS-TEST-BLOCKED',
    missionType: MissionType.EVACUATION,
    priority: 85,
  })

  const allocResult = optimizeResourceAllocation({
    missions: [mission],
    resources: getModelledResourceAssets(),
    routes: { primaryBlocked: true, detourAvailable: false },
  })

  assert.equal(allocResult.allocations[0].status, MissionStatus.BLOCKED)
  assert.ok(allocResult.allocations[0].constraints[0].includes('EVACUATION_ROUTE_UNAVAILABLE'))
})

// Test 11: Realism Under Scarcity (Critical Test F)
runTest('Test 11: 3 critical missions with only 2 rescue units marks surplus as RESOURCE_CONSTRAINED; does not fabricate phantom units', () => {
  const units = [
    createResourceAsset({ id: 'RU-A', type: ResourceAssetType.RESCUE_UNIT, status: 'AVAILABLE', capacity: 10 }),
    createResourceAsset({ id: 'RU-B', type: ResourceAssetType.RESCUE_UNIT, status: 'AVAILABLE', capacity: 10 }),
  ]

  const missions = [
    createMission({ id: 'M-1', priority: 98, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
    createMission({ id: 'M-2', priority: 94, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
    createMission({ id: 'M-3', priority: 88, missionType: MissionType.EVACUATION, requiredCapacity: 8 }),
  ]

  const allocResult = optimizeResourceAllocation({
    missions,
    resources: units,
    routes: { primaryBlocked: false, detourAvailable: true },
  })

  const m3Alloc = allocResult.allocations.find((a) => a.missionId === 'M-3')
  assert.equal(m3Alloc.status, MissionStatus.RESOURCE_CONSTRAINED)
  assert.equal(m3Alloc.selectedResources.length, 0)
  assert.ok(allocResult.constrainedMissions.some((m) => m.id === 'M-3'))
})

// Test 12: Deterministic Master Operational Plan
runTest('Test 12: Full operational plan generates completely across all 5 demo scenarios', () => {
  const scenarios = ['MONITORING', 'GROUND_EVIDENCE', 'SATELLITE_CONFIRMED', 'CYCLONE_APPROACHING', 'CRITICAL_OPERATION']
  for (const scn of scenarios) {
    const plan = generateOperationalPlan(scn)
    assert.ok(plan, `Plan generated for ${scn}`)
    assert.ok(plan.provenance.includes('MODELLED OPERATIONAL PLAN'))
    assert.ok(plan.assumptions.length > 0)
    assert.ok(plan.priorityMissions.length > 0)
  }
})

// Test 13: Operational Timeline Milestones
runTest('Test 13: Operational timeline contains 7 sequential milestones with explicit provenance', () => {
  const timeline = getOperationalTimeline('CRITICAL_OPERATION')
  assert.equal(timeline.stages.length, 7)
  assert.equal(timeline.stages[0].timeOffset, 'T+00 min')
  assert.equal(timeline.stages[6].timeOffset, 'T+25 min')
  assert.equal(timeline.provenance, 'MODELLED RESPONSE TIMELINE')
})

// Test 14: Non-Official Disclaimer & Provenance Integrity
runTest('Test 14: Provenance labels never claim official government authority or certified dispatch', () => {
  const plan = generateOperationalPlan('CRITICAL_OPERATION')
  assert.ok(!plan.provenance.toLowerCase().includes('official government'))
  assert.ok(!plan.provenance.toLowerCase().includes('certified dispatch'))
  assert.ok(plan.provenance.includes('MODELLED') || plan.provenance.includes('DECISION-SUPPORT'))
})

console.log('=================================================================')
console.log(`📊 PHASE 10 TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`)
console.log('=================================================================')

if (totalFailed > 0) {
  process.exit(1)
}

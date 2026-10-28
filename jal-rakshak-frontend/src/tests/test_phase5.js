/**
 * Automated Test Suite — Phase 5 Rescue Orchestration & Dispatch Intelligence
 * PS-074 Ganjam Disaster Intelligence System
 */

import assert from 'node:assert/strict'
import {
  calculateIncidentPriorityScore,
  evaluateRouteSafety,
  recommendShelter,
  determineResourcePriorities,
  matchBestResponseUnit,
  evaluateDispatchDecisions,
  GANJAM_DEMO_RESPONSE_UNITS,
} from '../services/intelligence/dispatch/dispatchEngine.js'

import {
  IncidentType,
  ResponseUnitStatus,
  CapabilityType,
  PriorityClass,
  SeverityLevel,
} from '../domain/contracts.js'

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 5 TEST SUITE: RESCUE ORCHESTRATION & DISPATCH')
console.log('=================================================================\n')

let passedTests = 0
let failedTests = 0

function runTest(testName, fn) {
  try {
    fn()
    console.log(`✅ PASS: ${testName}`)
    passedTests++
  } catch (err) {
    console.error(`❌ FAIL: ${testName}`)
    console.error(`   Error: ${err.message}`)
    failedTests++
  }
}

// 1. PRIORITY ENGINE TESTS
runTest('Priority: Critical SOS produces higher priority than high flood report', () => {
  const sosIncident = {
    type: IncidentType.SOS,
    severity: SeverityLevel.CRITICAL,
    confidence: 0.97,
    affectedPopulation: 1400,
    roadStatus: 'BLOCKED',
  }
  const floodIncident = {
    type: IncidentType.FLOOD,
    severity: SeverityLevel.HIGH,
    confidence: 0.92,
    affectedPopulation: 500,
    roadStatus: 'OPEN',
  }
  const mediumReport = {
    type: IncidentType.ROAD_BLOCKAGE,
    severity: SeverityLevel.MODERATE,
    confidence: 0.85,
    affectedPopulation: 0,
    roadStatus: 'OPEN',
  }

  const sosScore = calculateIncidentPriorityScore(sosIncident, { zoneRisk: 'CRITICAL' })
  const floodScore = calculateIncidentPriorityScore(floodIncident, { zoneRisk: 'HIGH' })
  const medScore = calculateIncidentPriorityScore(mediumReport, { zoneRisk: 'MODERATE' })

  assert.ok(sosScore.score > floodScore.score, `SOS score (${sosScore.score}) should exceed Flood (${floodScore.score})`)
  assert.ok(floodScore.score > medScore.score, `Flood score (${floodScore.score}) should exceed Medium (${medScore.score})`)
  assert.equal(sosScore.priorityClass, PriorityClass.CRITICAL)
  assert.ok(sosScore.score >= 80, 'Critical SOS priority score must be >= 80')
})

// 2. CAPABILITY MATCHING TESTS
runTest('Capability: Water rescue incident assigns water-rescue capable unit', () => {
  const waterIncident = {
    type: IncidentType.SOS,
    needsBoat: true,
    location: { lat: 19.264, lng: 84.905 },
  }
  const match = matchBestResponseUnit({
    incident: waterIncident,
    responseUnits: GanjamUnitsWithAvailability(),
  })
  assert.ok(match.primaryUnit, 'Must assign a response unit')
  assert.ok(
    match.primaryUnit.capabilities.includes(CapabilityType.WATER_RESCUE),
    `Assigned unit ${match.primaryUnit.id} must possess WATER_RESCUE capability`
  )
})

runTest('Capability: Medical incident assigns medical-capable unit', () => {
  const medIncident = {
    type: IncidentType.MEDICAL,
    needsBoat: false,
    location: { lat: 19.31, lng: 84.79 },
  }
  const match = matchBestResponseUnit({
    incident: medIncident,
    responseUnits: GanjamUnitsWithAvailability(),
  })
  assert.ok(match.primaryUnit, 'Must assign a response unit')
  assert.ok(
    match.primaryUnit.capabilities.includes(CapabilityType.MEDICAL),
    `Assigned unit ${match.primaryUnit.id} must possess MEDICAL capability`
  )
})

// 3. AVAILABILITY TESTS
runTest('Availability: Unavailable unit cannot be selected', () => {
  const unavailableUnits = GanjamUnitsWithAvailability().map((u) => {
    if (u.id === 'RU-02') {
      return { ...u, status: ResponseUnitStatus.UNAVAILABLE, availability: false }
    }
    return u
  })
  const incident = {
    type: IncidentType.SOS,
    needsBoat: true,
    location: { lat: 19.61, lng: 84.665 }, // closest to RU-02
  }
  const match = matchBestResponseUnit({
    incident,
    responseUnits: unavailableUnits,
  })
  assert.notEqual(match.primaryUnit.id, 'RU-02', 'RU-02 is unavailable and must not be selected')
  assert.equal(match.primaryUnit.id, 'RU-01', 'Next available WATER_RESCUE unit (RU-01) must be selected')
})

// 4. ROUTE SAFETY TESTS
runTest('Route Safety: Blocked route (SH-36) is rejected and safe alternative is selected', () => {
  const origin = { lat: 19.610, lng: 84.665 }
  const dest = { lat: 19.264, lng: 84.905 }
  const routeEval = evaluateRouteSafety({
    origin,
    destination: dest,
    blockedRoadName: 'SH-36',
    evidenceConfidence: 0.94,
  })

  assert.equal(routeEval.rejectedRoute.status, 'BLOCKED')
  assert.equal(routeEval.rejectedRoute.blockedSegment, 'SH-36')
  assert.ok(routeEval.rejectedRoute.rejectionReason.includes('SH-36 reported blocked'))

  assert.equal(routeEval.recommendedRoute.status, 'OPEN')
  assert.equal(routeEval.recommendedRoute.avoidedSegment, 'SH-36')
  assert.ok(routeEval.recommendedRoute.distanceKm > routeEval.rejectedRoute.distanceKm, 'Detour distance must be longer than direct')
  assert.equal(routeEval.recommendedRoute.estimatedTravelTimeMin, 14)
})

// 5. SHELTER SELECTION TESTS
runTest('Shelter: AT_RISK shelter (SH-04) rejected; safe shelter (SH-02) selected', () => {
  const mockShelters = [
    {
      id: 'SH-04',
      name: 'Aska Flood Relief Camp',
      lat: 19.612,
      lng: 84.664,
      capacity: 1500,
      currentOccupancy: 1100,
      availableSlots: 400,
      occupancyPct: 73,
      status: 'AT_RISK',
      riskLevel: 'HIGH',
      elevationMeters: 18,
      roadCondition: 'Approach road waterlogged',
    },
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
  ]

  const shelterEval = recommendShelter({
    shelters: mockShelters,
    incidentLocation: { lat: 19.264, lng: 84.905 },
    rejectedShelterId: 'SH-04',
  })

  assert.equal(shelterEval.recommendedShelter.id, 'SH-02', 'Recommended shelter must be SH-02')
  assert.equal(shelterEval.rejectedShelter.id, 'SH-04', 'Rejected shelter must be SH-04')
  assert.ok(shelterEval.rationale[0].includes('Safe status'), 'Rationale must cite safe status')
  assert.ok(shelterEval.rationale[1].includes('AT_RISK'), 'Rejection rationale must cite AT_RISK')
})

// 6. DEDUPLICATION TESTS
runTest('Deduplication: Same unit cannot be assigned to multiple critical incidents simultaneously', () => {
  const assignedSet = new Set(['RU-02'])
  const incident2 = {
    id: 'SOS-004',
    type: IncidentType.SOS,
    needsBoat: true,
    location: { lat: 19.61, lng: 84.665 },
  }
  const match = matchBestResponseUnit({
    incident: incident2,
    responseUnits: GanjamUnitsWithAvailability(),
    assignedUnitIds: assignedSet,
  })
  assert.notEqual(match.primaryUnit.id, 'RU-02', 'RU-02 is already assigned and must be excluded')
  assert.equal(match.primaryUnit.id, 'RU-01', 'RU-01 should be selected for the second critical incident')
})

// 7. DETERMINISM TESTS
runTest('Determinism: Identical inputs produce identical decisions', () => {
  const result1 = evaluateDispatchDecisions({ scenario: 'CRITICAL_INCIDENT' })
  const result2 = evaluateDispatchDecisions({ scenario: 'CRITICAL_INCIDENT' })

  assert.equal(result1.selectedUnit.id, result2.selectedUnit.id)
  assert.equal(result1.canonicalIncident.priorityScore, result2.canonicalIncident.priorityScore)
  assert.equal(result1.routeEvaluation.distanceKm, result2.routeEvaluation.distanceKm)
  assert.equal(result1.shelterEvaluation.recommendedShelter.id, result2.shelterEvaluation.recommendedShelter.id)
  assert.deepEqual(result1.resourcePriorities, result2.resourcePriorities)
  assert.equal(result1.actionQueue.length, result2.actionQueue.length)
})

// 8. END-TO-END INTEGRATION TEST (Section 23 Demo Scenario)
runTest('Integration: Phase 4 Critical Incident produces end-to-end Phase 5 decision pipeline', () => {
  const output = evaluateDispatchDecisions({
    scenario: 'CRITICAL_INCIDENT',
    riskState: { score: 82, severity: SeverityLevel.CRITICAL },
    groundEvidence: {
      items: [{ id: 'E-01', type: 'IMAGE', confidence: 0.97 }],
      blockedRoads: ['SH-36'],
      impactedShelters: ['SH-04'],
    },
  })

  // 1. Incident Priority is CRITICAL
  assert.equal(output.canonicalIncident.priority, PriorityClass.CRITICAL)
  assert.ok(output.canonicalIncident.priorityScore >= 80)

  // 2. Unit Selection is RU-02 (Aska Boat Unit)
  assert.equal(output.selectedUnit.id, 'RU-02')
  assert.ok(output.selectedUnit.capabilities.includes(CapabilityType.WATER_RESCUE))

  // 3. Blocked road avoided & alternative route selected
  assert.equal(output.routeEvaluation.avoidedSegment, 'SH-36')
  assert.equal(output.routeEvaluation.recommendedRoute.status, 'OPEN')
  assert.equal(output.routeEvaluation.recommendedRoute.estimatedTravelTimeMin, 14)

  // 4. Shelter selected & AT_RISK rejected
  assert.equal(output.shelterEvaluation.recommendedShelter.id, 'SH-02')
  assert.equal(output.shelterEvaluation.rejectedShelter.id, 'SH-04')

  // 5. Resources recommended
  assert.ok(output.resourcePriorities.includes('LIFE_JACKETS'))
  assert.ok(output.resourcePriorities.includes('MEDICAL_KITS'))
  assert.ok(output.resourcePriorities.includes('DRINKING_WATER'))

  // 6. Action queue structured correctly
  assert.equal(output.actionQueue[0].priority, PriorityClass.CRITICAL)
  assert.equal(output.actionQueue[0].action, 'RESCUE')
  assert.ok(output.actionQueue[0].decision.rationale.length >= 4)
})

// Helper
function GanjamUnitsWithAvailability() {
  return GANJAM_DEMO_RESPONSE_UNITS.map((u) => ({ ...u, status: ResponseUnitStatus.AVAILABLE, availability: true }))
}

console.log('\n-----------------------------------------------------------------')
console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed`)
console.log('-----------------------------------------------------------------')

if (failedTests > 0) {
  process.exit(1)
} else {
  console.log('🎉 ALL PHASE 5 UNIT & INTEGRATION TESTS PASSED!')
}

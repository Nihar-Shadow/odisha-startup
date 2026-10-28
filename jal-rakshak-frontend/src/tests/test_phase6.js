/**
 * Automated Test Suite — Phase 6 Earth Observation + Satellite Verification
 * PS-074 Ganjam Disaster Intelligence System
 */

import assert from 'node:assert/strict'
import {
  SatelliteSource,
  SatelliteType,
  SensorType,
  ObservationType,
  DataStatus,
  SeverityLevel,
  createSatelliteObservation,
  createEvidenceConflict,
} from '../domain/contracts.js'

import {
  satelliteAdapter,
  DEMO_SATELLITE_OBSERVATIONS,
  GANJAM_SAR_FLOOD_POLYGON,
} from '../services/adapters/satelliteAdapter.js'

import {
  isPointInPolygon,
  calculateDistanceKm,
  calculateBoundingBox,
  calculateBoundingBoxOverlapRatio,
  calculatePolygonOverlapRatio,
  evaluateSpatialEvidenceOverlap,
} from '../utils/geoEvidence.js'

import {
  evaluateSatelliteFusion,
  buildEvidenceTimeline,
  SATELLITE_CONFIG,
} from '../services/intelligence/satellite/satelliteFusionEngine.js'

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 6 TEST SUITE: SATELLITE EO & EVIDENCE FUSION')
console.log('=================================================================\n')

let passedTests = 0
let failedTests = 0

async function runTest(testName, fn) {
  try {
    await fn()
    console.log(`✅ PASS: ${testName}`)
    passedTests++
  } catch (err) {
    console.error(`❌ FAIL: ${testName}`)
    console.error(`   Error: ${err.message}`)
    failedTests++
  }
}

async function runAllTests() {
  // 1. SATELLITE ADAPTER TESTS
  await runTest('Adapter: Returns deterministic demo SAR observation on fallback', async () => {
    const sar = await satelliteAdapter.getSARFloodExtent('SATELLITE_CONFIRMS')
    assert.ok(sar, 'SAR observation must exist')
    assert.equal(sar.satellite, SatelliteType.SENTINEL_1)
    assert.equal(sar.sensor, SensorType.SAR)
    assert.equal(sar.dataStatus, DataStatus.DEMO)
    assert.equal(sar.floodDetected, true)
    assert.ok(sar.confidence >= 0.75 && sar.confidence <= 1.0)
    assert.ok(sar.affectedAreaKm2 > 0)
  })

  await runTest('Adapter: Handles unavailable satellite state gracefully', async () => {
    const unavail = await satelliteAdapter.getSARFloodExtent('NO_SATELLITE')
    assert.equal(unavail.dataStatus, DataStatus.UNAVAILABLE)
    assert.equal(unavail.floodDetected, false)
    assert.equal(unavail.confidence, 0)
  })

  await runTest('Adapter: Returns cached or catalog observations by ID', async () => {
    const obs = await satelliteAdapter.getObservationById('SAT-S1-GANJAM-001')
    assert.ok(obs)
    assert.equal(obs.id, 'SAT-S1-GANJAM-001')
    assert.equal(obs.sensor, SensorType.SAR)

    const missing = await satelliteAdapter.getObservationById('NON_EXISTENT_ID')
    assert.equal(missing, null)
  })

  // 2. SAR RADAR PROCESSING TESTS
  await runTest('SAR: Correctly detects flood extent and bounds confidence', () => {
    const obs = DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY
    assert.equal(obs.floodDetected, true)
    assert.ok(obs.confidence >= 0 && obs.confidence <= 1.0)
    assert.ok(obs.metadata.polarization.includes('VV+VH'))
    assert.ok(obs.affectedAreaKm2 >= 50.0)
  })

  await runTest('SAR: Negative backscatter drop represents standing water', () => {
    const obs = DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY
    assert.ok(obs.metadata.backscatterDecibelDrop < -3.0, 'Standing water must cause significant radar drop')
  })

  await runTest('SAR: Dry terrain shows no flood detection in conflict scenario', () => {
    const conflictObs = DEMO_SATELLITE_OBSERVATIONS.SAR_CONFLICT
    assert.equal(conflictObs.floodDetected, false)
    assert.ok(conflictObs.floodProbability < 0.3)
  })

  // 3. NDWI OPTICAL PROCESSING TESTS
  await runTest('NDWI: Valid water change detection has positive percent and threshold', async () => {
    const ndwi = await satelliteAdapter.getNDWIWaterChange('SATELLITE_CONFIRMS')
    assert.equal(ndwi.sensor, SensorType.NDWI)
    assert.ok(ndwi.changePercent > 0)
    assert.ok(ndwi.confidence >= 0 && ndwi.confidence <= 1.0)
    assert.ok(ndwi.metadata.waterThreshold.includes('> 0.3'))
  })

  await runTest('NDWI: Unavailable state returns valid structure with zero metrics', async () => {
    const ndwi = await satelliteAdapter.getNDWIWaterChange('NO_SATELLITE')
    assert.equal(ndwi.dataStatus, DataStatus.UNAVAILABLE)
    assert.equal(ndwi.confidence, 0)
  })

  // 4. SPATIAL GEOMETRY & OVERLAP TESTS
  await runTest('Spatial: Point inside Ganjam flood polygon returns true', () => {
    // Inside Gopalpur lowland polygon (around 19.28 N, 84.85 E)
    const insidePoint = { lat: 19.28, lng: 84.85 }
    assert.equal(isPointInPolygon(insidePoint, GANJAM_SAR_FLOOD_POLYGON), true)
  })

  await runTest('Spatial: Point outside flood polygon returns false', () => {
    // Far outside (e.g. Bhubaneswar 20.29 N, 85.82 E)
    const outsidePoint = { lat: 20.29, lng: 85.82 }
    assert.equal(isPointInPolygon(outsidePoint, GANJAM_SAR_FLOOD_POLYGON), false)
  })

  await runTest('Spatial: Bounding box overlap ratio is bounded between 0 and 1', () => {
    const bboxA = [84.68, 19.22, 84.98, 19.35]
    const bboxB = [84.75, 19.24, 85.05, 19.38]
    const ratio = calculateBoundingBoxOverlapRatio(bboxA, bboxB)
    assert.ok(ratio > 0 && ratio <= 1.0)

    const disjunctBbox = [86.0, 21.0, 86.5, 21.5]
    assert.equal(calculateBoundingBoxOverlapRatio(bboxA, disjunctBbox), 0)
  })

  await runTest('Spatial: Evaluates overlap ratio and threshold for citizen report', () => {
    const groundItem = { lat: 19.264, lng: 84.905 } // Gopalpur coastal lowland
    const result = evaluateSpatialEvidenceOverlap(groundItem, DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY)
    assert.ok(result.overlapRatio >= SATELLITE_CONFIG.CONFIRMATION_MIN_OVERLAP)
    assert.equal(result.isConfirmed, true)
    assert.equal(result.isConflict, false)
  })

  // 5. EVIDENCE FUSION ENGINE TESTS
  await runTest('Fusion: Citizen + Satellite Agreement increases confidence and bounds risk', () => {
    const fusion = evaluateSatelliteFusion({ scenario: 'SATELLITE_CONFIRMS' })
    assert.equal(fusion.scenario, 'SATELLITE_CONFIRMS')
    assert.equal(fusion.spatialAgreement.status, 'CONFIRMED')
    assert.ok(fusion.spatialAgreement.overlapRatio >= 0.75)

    // Baseline risk: 74 (60 base + 14 ground), satellite corroboration: +7 -> 81
    assert.equal(fusion.canonicalRiskScore, 81)
    assert.equal(fusion.severity, SeverityLevel.CRITICAL)
    assert.equal(fusion.riskAdjustment, 7)

    // Fusion confidence boost: citizen 91% -> 94%
    assert.equal(fusion.fusionConfidence, 0.94)

    // Footprint update
    assert.equal(fusion.affectedAreaKm2, 57.0)
    assert.equal(fusion.affectedPopulation, 8900)
  })

  await runTest('Fusion: Prevents double counting (satellite contribution strictly bounded)', () => {
    const fusion = evaluateSatelliteFusion({ scenario: 'SATELLITE_CONFIRMS' })
    // Ensure satellite does NOT blindly add another 15 or push arbitrarily to 100
    assert.ok(fusion.riskAdjustment <= SATELLITE_CONFIG.MAX_SATELLITE_CORROBORATION_BOOST)
    assert.ok(fusion.canonicalRiskScore <= 100)
    assert.ok(fusion.canonicalRiskScore >= 0)
  })

  await runTest('Fusion: Detects evidence conflict without deleting citizen report', () => {
    const fusion = evaluateSatelliteFusion({ scenario: 'EVIDENCE_CONFLICT' })
    assert.equal(fusion.scenario, 'EVIDENCE_CONFLICT')
    assert.ok(fusion.evidenceConflict, 'EvidenceConflict object must be generated')
    assert.equal(fusion.evidenceConflict.type, 'EVIDENCE_CONFLICT')
    assert.equal(fusion.evidenceConflict.recommendedAction, 'MANUAL_REVIEW')

    // Risk escalation is capped/withheld
    assert.equal(fusion.riskAdjustment, 0)
    assert.equal(fusion.canonicalRiskScore, 74)
  })

  await runTest('Fusion: No satellite scenario preserves baseline ground risk', () => {
    const fusion = evaluateSatelliteFusion({ scenario: 'NO_SATELLITE' })
    assert.equal(fusion.canonicalRiskScore, 74)
    assert.equal(fusion.riskAdjustment, 0)
    assert.equal(fusion.affectedAreaKm2, 54.0)
    assert.equal(fusion.affectedPopulation, 8400)
  })

  // 6. DECISION ENGINE INTEGRATION TESTS
  await runTest('Integration: Recalculates SOS priority and updates dispatch recommendations', () => {
    const fusion = evaluateSatelliteFusion({ scenario: 'SATELLITE_CONFIRMS' })
    const dispatch = fusion.dispatchResult
    assert.ok(dispatch, 'Dispatch result must be generated')
    assert.ok(dispatch.actionQueue.length > 0)

    // Canonical SOS incident priority score updated from 88 to 94
    assert.equal(dispatch.canonicalIncident.priorityScore, 94)

    // Best response unit matched with water rescue capability (RU-02 Aska Boat Unit)
    assert.equal(dispatch.selectedUnit.id, 'RU-02')

    // Blocked road SH-36 avoided via safe route
    assert.equal(dispatch.routeEvaluation.avoidedSegment, 'SH-36')
    assert.ok(dispatch.routeEvaluation.recommendedRoute)
    assert.ok(dispatch.routeEvaluation.rejectedRoute)

    // At-risk shelter SH-04 rejected in favor of safe shelter SH-02
    assert.equal(dispatch.shelterEvaluation.recommendedShelter.id, 'SH-02')
    assert.equal(dispatch.shelterEvaluation.rejectedShelter.id, 'SH-04')
  })

  await runTest('Timeline: Sequential evidence timeline generated deterministically', () => {
    const timeline = buildEvidenceTimeline('SATELLITE_CONFIRMS')
    assert.ok(Array.isArray(timeline))
    assert.equal(timeline.length, 7)
    assert.equal(timeline[0].stage, 'WEATHER')
    assert.equal(timeline[1].stage, 'FLOOD_MODEL')
    assert.equal(timeline[2].stage, 'GROUND_EVIDENCE')
    assert.equal(timeline[3].stage, 'SATELLITE_EO')
    assert.equal(timeline[4].stage, 'SPATIAL_ANALYSIS')
    assert.equal(timeline[5].stage, 'CANONICAL_RISK')
    assert.equal(timeline[6].stage, 'DECISION_ENGINE')
  })

  console.log('\n=================================================================')
  console.log(`📊 PHASE 6 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log('=================================================================')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runAllTests()

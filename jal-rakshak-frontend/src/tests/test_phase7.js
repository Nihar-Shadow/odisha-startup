/**
 * Automated Test Suite — Phase 7 Cyclone Intelligence + Bay of Bengal Track Integration
 * PS-074 Ganjam Disaster Intelligence System
 */

import assert from 'node:assert/strict'
import {
  CycloneStatus,
  CycloneCategory,
  CycloneProximityBand,
  CycloneSource,
  createCycloneObservation,
} from '../domain/contracts.js'

import {
  cycloneAdapter,
  GANJAM_REFERENCE_POINT,
} from '../services/adapters/cycloneAdapter.js'

import {
  calculateHaversineDistanceKm,
  classifyCycloneProximity,
  evaluateCycloneRisk,
  fuseMultiHazardRisk,
  recalculateOperationalDecisions,
  evaluateCycloneIntelligence,
  CYCLONE_WEIGHTS,
} from '../services/intelligence/cyclone/cycloneRiskEngine.js'

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 7 TEST SUITE: CYCLONE INTELLIGENCE & TRACK FUSION')
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
  // 1. ADAPTER TESTS
  await runTest('Adapter: Returns deterministic demo cyclone on fallback (Approaching scenario)', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    assert.ok(obs, 'Observation must exist')
    assert.equal(obs.status, CycloneStatus.SEVERE_CYCLONIC_STORM)
    assert.ok(obs.basin.includes('Bay of Bengal') || obs.basin.includes('BAY_OF_BENGAL') || obs.basin.includes('Coastal'))
    assert.equal(obs.dataStatus, CycloneSource.DEMO)
    assert.equal(obs.maxWindKph, 120)
    assert.equal(obs.centralPressureHpa, 972)
    assert.ok(obs.distanceToGanjamKm > 150 && obs.distanceToGanjamKm < 210)
    assert.equal(obs.proximityBand, CycloneProximityBand.WARNING)
  })

  await runTest('Adapter: Cache fallback serves stored observation', async () => {
    cycloneAdapter.clearCache()
    // First call caches the observation
    const first = await cycloneAdapter.fetchCycloneObservation({ scenario: 'DISTANT' })
    assert.ok(first)
    // Second call retrieves from cache
    const cached = cycloneAdapter.getCachedObservation('DISTANT')
    assert.ok(cached, 'Cached observation should exist')
    assert.equal(cached.id, first.id)
    assert.equal(cached.status, CycloneStatus.MONITORING)
  })

  await runTest('Adapter: Unavailable state handles missing/null inputs safely without throwing', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'UNAVAILABLE' })
    assert.ok(obs, 'Should return unavailable observation structure')
    assert.ok(obs.dataStatus === CycloneSource.UNAVAILABLE || obs.dataStatus === 'UNAVAILABLE')
    assert.equal(obs.status, CycloneStatus.NO_CYCLONE)
  })

  await runTest('Adapter: Live fallback cleanly defaults to demonstration scenario without crashing', async () => {
    const obs = await cycloneAdapter.fetchLiveGDACSCyclone()
    assert.ok(obs, 'Should return fallback demo scenario without throwing')
    assert.ok(['DEMO', 'LIVE'].includes(obs.dataStatus))
  })

  // 2. TRACK TESTS
  await runTest('Track: Valid track points and forecast separation', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    assert.ok(Array.isArray(obs.historicalTrack), 'historicalTrack must be an array')
    assert.ok(Array.isArray(obs.forecastTrack), 'forecastTrack must be an array')
    assert.ok(obs.historicalTrack.length >= 3, 'Must have at least 3 historical points')
    assert.ok(obs.forecastTrack.length >= 3, 'Must have at least 3 forecast points')

    // Chronological order verification
    for (let i = 1; i < obs.historicalTrack.length; i++) {
      const prevTime = new Date(obs.historicalTrack[i - 1].timestamp).getTime()
      const currTime = new Date(obs.historicalTrack[i].timestamp).getTime()
      assert.ok(currTime > prevTime, 'Historical track points must be sorted chronologically')
    }
  })

  await runTest('Track: Geographic coordinate validity (Bay of Bengal bounds)', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    const allPoints = [...obs.historicalTrack, obs.position, ...obs.forecastTrack]
    allPoints.forEach((pt, idx) => {
      const lat = pt.lat !== undefined ? pt.lat : pt.latitude
      const lng = pt.lng !== undefined ? pt.lng : pt.longitude
      assert.ok(lat >= 5 && lat <= 25, `Lat out of range at pt ${idx}: ${lat}`)
      assert.ok(lng >= 80 && lng <= 95, `Lng out of range at pt ${idx}: ${lng}`)
    })
  })

  await runTest('Track: Uncertainty cone is valid GeoJSON Polygon with coordinates', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    assert.ok(obs.uncertaintyCone, 'Uncertainty cone must exist')
    assert.equal(obs.uncertaintyCone.type, 'Feature')
    assert.equal(obs.uncertaintyCone.geometry.type, 'Polygon')
    assert.ok(Array.isArray(obs.uncertaintyCone.geometry.coordinates[0]))
    assert.ok(obs.uncertaintyCone.geometry.coordinates[0].length >= 4, 'Polygon must have at least 4 vertices')
  })

  // 3. PROXIMITY TESTS (Ganjam: 19.31°N, 84.79°E)
  await runTest('Proximity: >500 km classifies as LOW band', async () => {
    const dist = 580
    const band = classifyCycloneProximity(dist)
    assert.equal(band, CycloneProximityBand.LOW)
  })

  await runTest('Proximity: 300–500 km classifies as WATCH band', async () => {
    const dist = 420
    const band = classifyCycloneProximity(dist)
    assert.equal(band, CycloneProximityBand.WATCH)
  })

  await runTest('Proximity: 150–300 km classifies as WARNING band', async () => {
    const dist = 182
    const band = classifyCycloneProximity(dist)
    assert.equal(band, CycloneProximityBand.WARNING)
  })

  await runTest('Proximity: <150 km classifies as SEVERE band', async () => {
    const dist = 95
    const band = classifyCycloneProximity(dist)
    assert.equal(band, CycloneProximityBand.SEVERE)
  })

  await runTest('Proximity: Haversine distance accuracy relative to Ganjam (19.31°N, 84.79°E)', async () => {
    // Current cyclone position: 18.1°N, 86.2°E
    const dist = calculateHaversineDistanceKm(18.1, 86.2, GANJAM_REFERENCE_POINT.lat, GANJAM_REFERENCE_POINT.lng)
    assert.ok(dist >= 170 && dist <= 210, `Expected ~182-200 km, got ${dist}`)
  })

  // 4. RISK ENGINE TESTS
  await runTest('Risk: Clamped strictly between 0 and 100', async () => {
    const extremeObservation = createCycloneObservation({
      id: 'EXTREME',
      status: CycloneStatus.SUPER_CYCLONIC_STORM,
      maxWindKph: 300,
      distanceToGanjamKm: 20,
      approachTimeHours: 1.0,
      confidence: 1.0,
      stormSurgeRisk: 100,
      coastalRisk: 'HIGH',
    })
    const risk = evaluateCycloneRisk(extremeObservation)
    assert.ok(risk.cycloneRiskScore >= 0 && risk.cycloneRiskScore <= 100)
    assert.equal(risk.cycloneRiskScore, 100, 'Extreme category must clamp at 100')
  })

  await runTest('Risk: Factors decomposition (Intensity, Proximity, Approach, Confidence, Coastal)', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    const risk = evaluateCycloneRisk(obs)
    assert.ok(risk.intensityScore > 0 && risk.intensityScore <= CYCLONE_WEIGHTS.INTENSITY_MAX)
    assert.ok(risk.proximityScore > 0 && risk.proximityScore <= CYCLONE_WEIGHTS.PROXIMITY_MAX)
    assert.ok(risk.approachScore > 0 && risk.approachScore <= CYCLONE_WEIGHTS.APPROACH_MAX)
    assert.ok(risk.confidenceScore > 0 && risk.confidenceScore <= CYCLONE_WEIGHTS.CONFIDENCE_MAX)
    assert.ok(risk.coastalScore > 0 && risk.coastalScore <= CYCLONE_WEIGHTS.COASTAL_MAX)
    assert.equal(risk.cycloneRiskScore, 68)
  })

  // 5. FUSION TESTS (Multi-Hazard & Anti-Double-Counting)
  await runTest('Fusion: Scenario A (NO_CYCLONE) produces 0 cyclone contribution', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'NO_CYCLONE' })
    const risk = evaluateCycloneRisk(obs)
    const fusion = fuseMultiHazardRisk({
      baseHazardScore: 74,
      cycloneRiskScore: risk.cycloneRiskScore,
      cycloneObservation: obs,
      weatherSeverity: 'WARNING',
    })
    assert.equal(fusion.cycloneContribution, 0)
    assert.equal(fusion.combinedRiskScore, 74)
  })

  await runTest('Fusion: Scenario B (DISTANT_CYCLONE) produces small bounded contribution (+2)', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'DISTANT' })
    const risk = evaluateCycloneRisk(obs)
    const fusion = fuseMultiHazardRisk({
      baseHazardScore: 74,
      cycloneRiskScore: risk.cycloneRiskScore,
      cycloneObservation: obs,
      weatherSeverity: 'MODERATE',
    })
    assert.equal(fusion.cycloneContribution, 2)
    assert.equal(fusion.combinedRiskScore, 76)
  })

  await runTest('Fusion: Scenario C (APPROACHING_CYCLONE) fuses 81 -> 89 with bounded weather amplification', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'APPROACHING' })
    const risk = evaluateCycloneRisk(obs)
    const fusion = fuseMultiHazardRisk({
      baseHazardScore: 81,
      cycloneRiskScore: risk.cycloneRiskScore,
      cycloneObservation: obs,
      weatherSeverity: 'WARNING',
    })
    assert.equal(fusion.cycloneContribution, 8)
    assert.equal(fusion.combinedRiskScore, 89)
    assert.equal(fusion.combinedSeverity, 'CRITICAL')
  })

  await runTest('Fusion: Anti-double-counting ensures contribution never exceeds bounded cap (+10)', async () => {
    const obs = createCycloneObservation({
      id: 'TEST-OVERKILL',
      status: CycloneStatus.SUPER_CYCLONIC_STORM,
      distanceToGanjamKm: 30,
      confidence: 1.0,
      cycloneRiskScore: 95,
      proximityBand: CycloneProximityBand.SEVERE,
    })
    const fusion = fuseMultiHazardRisk({
      baseHazardScore: 90,
      cycloneRiskScore: 95,
      cycloneObservation: obs,
      weatherSeverity: 'CRITICAL',
    })
    assert.ok(fusion.cycloneContribution <= CYCLONE_WEIGHTS.MAX_CYCLONE_CONTRIBUTION, 'Contribution must not exceed cap (+10)')
    assert.ok(fusion.combinedRiskScore <= 100, 'Combined score must never exceed 100')
  })

  await runTest('Fusion: Scenario D (UNCERTAIN) discounts contribution due to low forecast confidence', async () => {
    const obs = await cycloneAdapter.fetchCycloneObservation({ scenario: 'UNCERTAIN' })
    const risk = evaluateCycloneRisk(obs)
    const fusion = fuseMultiHazardRisk({
      baseHazardScore: 81,
      cycloneRiskScore: risk.cycloneRiskScore,
      cycloneObservation: obs,
      weatherSeverity: 'WARNING',
    })
    assert.ok(fusion.cycloneContribution <= 3, 'Uncertain track must have discounted contribution')
    assert.equal(fusion.combinedRiskScore, 83)
    assert.ok(fusion.reason.includes('uncertainty'), 'Reason must document track uncertainty')
  })

  // 6. OPERATIONAL DECISION RECALCULATION TESTS
  await runTest('Decision: Recalculates dispatch priority (94 -> 98) in Approaching Cyclone scenario', async () => {
    const intel = evaluateCycloneIntelligence({
      scenario: 'APPROACHING',
      baseRiskScore: 81,
      weatherSeverity: 'WARNING',
    })
    assert.ok(intel.dispatchResult, 'Dispatch result must exist')
    assert.equal(intel.dispatchResult.canonicalIncident?.priorityScore, 98)
  })

  await runTest('Decision: Pre-positions boat units and prioritizes coastal resources', async () => {
    const intel = evaluateCycloneIntelligence({
      scenario: 'APPROACHING',
      baseRiskScore: 81,
      weatherSeverity: 'WARNING',
    })
    assert.ok(intel.priorityResources.includes('RESCUE_BOATS'))
    assert.ok(intel.priorityResources.includes('MEDICAL_KITS'))
    assert.ok(intel.summary.includes('182 km'))
  })

  await runTest('Decision: Re-evaluates coastal route and preserves safe detour', async () => {
    const intel = evaluateCycloneIntelligence({
      scenario: 'APPROACHING',
      baseRiskScore: 81,
      weatherSeverity: 'WARNING',
    })
    const route = intel.dispatchResult.routeEvaluation
    assert.ok(route, 'Route evaluation must exist')
    assert.ok(route.avoidRoads?.includes('SH-36') || route.status === 'DETOUR_REQUIRED' || route.recommendedRoute)
  })

  // 7. MULTIMODAL TIMELINE TESTS
  await runTest('Timeline: Generates explainable 10-step multimodal evidence timeline', async () => {
    const intel = evaluateCycloneIntelligence({
      scenario: 'APPROACHING',
      baseRiskScore: 81,
      weatherSeverity: 'WARNING',
    })
    assert.ok(Array.isArray(intel.timeline))
    assert.equal(intel.timeline.length, 10)
    assert.ok(intel.timeline.some(t => (t.description || '').includes('Cyclone track') || (t.description || '').includes('GDACS')))
    assert.ok(intel.timeline.some(t => (t.description || '').includes('81 → 89')))
    assert.ok(intel.timeline.some(t => (t.description || '').includes('Dispatch priority') || (t.description || '').includes('94 → 98')))
  })

  console.log('\n=================================================================')
  console.log(`📊 PHASE 7 UNIT TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log('=================================================================\n')

  if (failedTests > 0) {
    process.exit(1)
  }
}

runAllTests()

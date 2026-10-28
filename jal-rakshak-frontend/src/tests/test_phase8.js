/**
 * Phase 8 Automated Test Suite:
 * Vulnerability, Population Exposure & Critical Infrastructure Intelligence
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 */

import assert from 'node:assert/strict'
import {
  InfrastructureType,
  InfrastructureStatus,
  ImpactLevel,
  VulnerabilityLevel,
  PriorityClass,
  createPopulationExposure,
  createCriticalInfrastructure,
  createInfrastructureImpact,
  createVulnerabilityProfile,
  createZonePriority,
} from '../domain/contracts.js'
import {
  GANJAM_MODELLED_INFRASTRUCTURE,
  evaluateInfrastructureImpact,
} from '../services/intelligence/vulnerability/infrastructureImpactEngine.js'
import {
  GANJAM_MODELLED_POPULATION_EXPOSURE,
  calculateVulnerabilityProfile,
  calculateZonePriority,
  evaluateVulnerabilityIntelligence,
} from '../services/intelligence/vulnerability/vulnerabilityPriorityEngine.js'
import { vulnerabilityAdapter } from '../services/adapters/vulnerabilityAdapter.js'

console.log('=================================================================')
console.log('🧪 PS-074 PHASE 8 TEST SUITE: VULNERABILITY & INFRASTRUCTURE INTELLIGENCE')
console.log('=================================================================\n')

let passed = 0

// TEST 1: Population Exposure Calculation
{
  const exp = createPopulationExposure({
    id: 'EXP-TEST-01',
    zoneId: 'ZONE-GANJAM-02',
    population: 18000,
    exposedPopulation: 7200,
    vulnerablePopulation: 2600,
    highRiskPopulation: 4100,
  })
  assert.equal(exp.population, 18000)
  assert.equal(exp.exposedPopulation, 7200)
  assert.equal(exp.vulnerablePopulation, 2600)
  assert.equal(exp.exposurePercentage, 40)
  assert.equal(exp.provenance, 'MODELLED EXPOSURE')
  console.log('✅ PASS: Test 1: Population exposure calculation and provenance validation')
  passed++
}

// TEST 2: Vulnerable Population Breakdown
{
  const exp = createPopulationExposure({
    elderlyPopulation: 1100,
    childrenPopulation: 900,
    mobilityLimitedPopulation: 600,
    vulnerablePopulation: 2600,
  })
  assert.equal(exp.elderlyPopulation + exp.childrenPopulation + exp.mobilityLimitedPopulation, 2600)
  console.log('✅ PASS: Test 2: Vulnerable population demographic composition holds')
  passed++
}

// TEST 3: Deterministic Vulnerability Score Calculation
{
  const vuln = calculateVulnerabilityProfile({
    zoneId: 'ZONE-GANJAM-02',
    riskState: { score: 81 },
    blockedRoads: ['SH-36'],
  })
  assert.ok(vuln.vulnerabilityScore >= 0 && vuln.vulnerabilityScore <= 100)
  assert.ok(vuln.contributingFactors.length === 8)
  assert.equal(vuln.provenance, 'MODELLED VULNERABILITY SCORE')
  console.log('✅ PASS: Test 3: Vulnerability score calculated with 8 contributing factors')
  passed++
}

// TEST 4: Vulnerability Classification Thresholds
{
  const pLow = createVulnerabilityProfile({ vulnerabilityScore: 20 })
  assert.equal(pLow.vulnerabilityLevel, VulnerabilityLevel.LOW)

  const pMod = createVulnerabilityProfile({ vulnerabilityScore: 35 })
  assert.equal(pMod.vulnerabilityLevel, VulnerabilityLevel.MODERATE)

  const pHigh = createVulnerabilityProfile({ vulnerabilityScore: 65 })
  assert.equal(pHigh.vulnerabilityLevel, VulnerabilityLevel.HIGH)

  const pCrit = createVulnerabilityProfile({ vulnerabilityScore: 85 })
  assert.equal(pCrit.vulnerabilityLevel, VulnerabilityLevel.CRITICAL)

  console.log('✅ PASS: Test 4: Vulnerability classification thresholds (LOW, MODERATE, HIGH, CRITICAL)')
  passed++
}

// TEST 5: Critical Infrastructure Impact Score
{
  const res = evaluateInfrastructureImpact({
    infrastructure: GANJAM_MODELLED_INFRASTRUCTURE,
    riskState: { score: 81 },
    blockedRoads: ['SH-36'],
  })
  assert.ok(Array.isArray(res.impacts))
  assert.equal(res.impacts.length, GANJAM_MODELLED_INFRASTRUCTURE.length)
  assert.ok(res.atRiskCount >= 3)
  console.log('✅ PASS: Test 5: Infrastructure impact evaluation scores all catalog facilities')
  passed++
}

// TEST 6: Blocked Road Impact on Aska Hospital (INFRA-HOSP-01)
{
  const res = evaluateInfrastructureImpact({
    infrastructure: GANJAM_MODELLED_INFRASTRUCTURE,
    riskState: { score: 81 },
    blockedRoads: ['SH-36'],
  })
  const hospImpact = res.impacts.find((i) => i.infrastructureId === 'INFRA-HOSP-01')
  assert.ok(hospImpact)
  assert.equal(hospImpact.accessRisk, 'CRITICAL')
  assert.equal(hospImpact.serviceRisk, 'HIGH')
  assert.ok(hospImpact.recommendedAction.includes('alternate medical access corridor'))
  console.log('✅ PASS: Test 6: Blocked road SH-36 triggers CRITICAL access risk on Aska Hospital')
  passed++
}

// TEST 7: Shelter Safety & Redirection (SH-04 vs SH-02)
{
  const res = evaluateInfrastructureImpact({
    infrastructure: GANJAM_MODELLED_INFRASTRUCTURE,
    riskState: { score: 89 },
    cycloneRisk: { stormSurgeRisk: 78 },
  })
  const sh04Impact = res.impacts.find((i) => i.infrastructureId === 'INFRA-SHELTER-04')
  assert.ok(sh04Impact)
  assert.equal(sh04Impact.impactLevel, ImpactLevel.CRITICAL)
  assert.ok(sh04Impact.recommendedAction.includes('DO NOT ROUTE EVACUEES'))
  assert.ok(sh04Impact.recommendedAction.includes('SH-02'))

  const sh02Impact = res.impacts.find((i) => i.infrastructureId === 'INFRA-SHELTER-02')
  assert.ok(sh02Impact.impactScore < 45)
  assert.ok(sh02Impact.impactLevel === ImpactLevel.LOW || sh02Impact.impactLevel === ImpactLevel.MODERATE)
  assert.notEqual(sh02Impact.impactLevel, ImpactLevel.CRITICAL)
  console.log('✅ PASS: Test 7: Shelter SH-04 marked CRITICAL (DO NOT ROUTE); SH-02 remains SAFE')
  passed++
}


// TEST 8: Bridge Caution Evaluation (INFRA-BRIDGE-02)
{
  const res = evaluateInfrastructureImpact({
    infrastructure: GANJAM_MODELLED_INFRASTRUCTURE,
    riskState: { score: 81 },
    scenario: 'CRITICAL_EXPOSURE',
  })
  const br02Impact = res.impacts.find((i) => i.infrastructureId === 'INFRA-BRIDGE-02')
  assert.ok(br02Impact)
  assert.ok(br02Impact.impactLevel === ImpactLevel.HIGH || br02Impact.impactLevel === ImpactLevel.CRITICAL)
  assert.ok(br02Impact.recommendedAction.includes('16.83m'))
  console.log('✅ PASS: Test 8: River bridge BR-02 triggers structural caution near danger mark')
  passed++
}


// TEST 9: Zone Priority Calculation & Classification
{
  const intel = evaluateVulnerabilityIntelligence({
    scenario: 'SATELLITE_CONFIRMED',
    riskState: { score: 81 },
  })
  const topZone = intel.zonePriorities[0]
  assert.ok(topZone)
  assert.ok(topZone.priorityScore >= 80)
  assert.equal(topZone.priorityClass, PriorityClass.CRITICAL)
  assert.equal(topZone.zoneId, 'ZONE-GANJAM-02')
  console.log('✅ PASS: Test 9: Zone priority score correctly classifies Aska Floodplain as CRITICAL')
  passed++
}

// TEST 10: Zone Priority Ordering (Descending Order)
{
  const intel = evaluateVulnerabilityIntelligence({
    scenario: 'CRITICAL_EXPOSURE',
    riskState: { score: 89 },
  })
  for (let i = 0; i < intel.zonePriorities.length - 1; i++) {
    assert.ok(intel.zonePriorities[i].priorityScore >= intel.zonePriorities[i + 1].priorityScore)
  }
  console.log('✅ PASS: Test 10: Zone priorities are strictly sorted in descending response urgency')
  passed++
}

// TEST 11: Anti-Double-Counting Rule
{
  const baseRisk = { score: 81, severity: 'CRITICAL' }
  const intel = evaluateVulnerabilityIntelligence({
    scenario: 'CRITICAL_EXPOSURE',
    riskState: baseRisk,
  })
  // Verifying that population exposure does NOT inflate canonical physical hazard risk
  assert.equal(baseRisk.score, 81)
  assert.equal(baseRisk.severity, 'CRITICAL')
  assert.notEqual(baseRisk.score, 96) // 96 is the Response Priority, not Hazard Risk!
  console.log('✅ PASS: Test 11: Anti-Double-Counting rule holds (hazard risk stays 81, not inflated to 96)')
  passed++
}

// TEST 12: Priority Inversion Principle (Hazard != Priority)
{
  // Zone A: Moderate Hazard (74), High Vulnerability (2,600 vuln, hospital blocked)
  const zoneA = calculateZonePriority({
    zoneId: 'ZONE-GANJAM-02',
    exposure: { exposedPopulation: 7200, vulnerablePopulation: 2600, population: 18000 },
    vulnerabilityProfile: { vulnerabilityScore: 82 },
    riskState: { score: 74 },
    infrastructureImpacts: [{ infrastructureId: 'INFRA-HOSP-01', impactScore: 85 }],
    activeIncidents: [{ type: 'SOS' }],
  })


  // Zone B: Higher Hazard (85), Low Vulnerability (900 exposed, 80 vuln, good access)
  const zoneB = calculateZonePriority({
    zoneId: 'ZONE-B-MARSH',
    exposure: { exposedPopulation: 900, vulnerablePopulation: 80 },
    vulnerabilityProfile: { vulnerabilityScore: 35 },
    riskState: { score: 85 },
    infrastructureImpacts: [],
    activeIncidents: [],
  })

  // Zone A must receive higher RESPONSE PRIORITY despite Zone B having higher physical hazard!
  assert.ok(zoneA.priorityScore > zoneB.priorityScore)
  assert.equal(zoneA.priorityClass, PriorityClass.CRITICAL)
  assert.ok(zoneB.priorityClass === PriorityClass.LOW || zoneB.priorityClass === PriorityClass.MEDIUM)
  console.log(`✅ PASS: Test 12: Priority Inversion demonstrated (Zone A Priority: ${zoneA.priorityScore} > Zone B Priority: ${zoneB.priorityScore})`)
  passed++
}

// TEST 13: Strict Data Provenance Labels
{
  const exp = createPopulationExposure()
  assert.equal(exp.provenance, 'MODELLED EXPOSURE')

  const infra = createCriticalInfrastructure()
  assert.equal(infra.provenance, 'DEMO INFRASTRUCTURE INVENTORY')

  const impact = createInfrastructureImpact()
  assert.equal(impact.provenance, 'MODELLED IMPACT')

  const vuln = createVulnerabilityProfile()
  assert.equal(vuln.provenance, 'MODELLED VULNERABILITY SCORE')

  const prio = createZonePriority()
  assert.equal(prio.provenance, 'DETERMINISTIC PRIORITY SCORE')
  console.log('✅ PASS: Test 13: All models carry explicit, verified provenance labels')
  passed++
}

// TEST 14: Demo Scenario Progression (5 Scenarios)
{
  const s1 = evaluateVulnerabilityIntelligence({ scenario: 'BASELINE', riskState: { score: 60 } })
  assert.equal(s1.summary.totalExposedPopulation, 7000)
  assert.equal(s1.summary.totalVulnerablePopulation, 1800)

  const s2 = evaluateVulnerabilityIntelligence({ scenario: 'GROUND_EVIDENCE', riskState: { score: 74 } })
  assert.equal(s2.summary.totalExposedPopulation, 8400)
  assert.equal(s2.summary.totalVulnerablePopulation, 2300)

  const s3 = evaluateVulnerabilityIntelligence({ scenario: 'SATELLITE_CONFIRMED', riskState: { score: 81 } })
  assert.equal(s3.summary.totalExposedPopulation, 8900)
  assert.equal(s3.summary.totalVulnerablePopulation, 3100)

  const s4 = evaluateVulnerabilityIntelligence({ scenario: 'CYCLONE_APPROACHING', riskState: { score: 89 } })
  assert.equal(s4.summary.totalExposedPopulation, 9800)
  assert.equal(s4.summary.totalVulnerablePopulation, 3400)

  const s5 = evaluateVulnerabilityIntelligence({ scenario: 'CRITICAL_EXPOSURE', riskState: { score: 89 } })
  assert.equal(s5.summary.totalExposedPopulation, 11200)
  assert.equal(s5.summary.totalVulnerablePopulation, 3700)
  assert.ok(s5.zonePriorities[0].priorityScore >= 95)
  console.log('✅ PASS: Test 14: 5-scenario demo progression verified deterministically')
  passed++
}

// TEST 15: Adapter Fallback Ladder
{
  vulnerabilityAdapter.clearCache()
  const res = await vulnerabilityAdapter.getVulnerability({ scenario: 'BASELINE' })
  assert.ok(res)
  assert.ok(res.exposures.length === 3)
  assert.ok(res.zonePriorities.length === 3)
  assert.ok(res.summary.totalExposedPopulation > 0)
  console.log('✅ PASS: Test 15: Vulnerability adapter provides offline demo fallback safely')
  passed++
}

// TEST 16: Decision Directives Formulation
{
  const intel = evaluateVulnerabilityIntelligence({
    scenario: 'CRITICAL_EXPOSURE',
    riskState: { score: 89 },
    blockedRoads: ['SH-36'],
  })
  assert.ok(Array.isArray(intel.decisions))
  assert.ok(intel.decisions.length >= 3)

  const hospDec = intel.decisions.find((d) => d.id === 'DEC-INFRA-HOSP')
  assert.ok(hospDec)
  assert.equal(hospDec.responseUnitId, 'RU-03')

  const shelterDec = intel.decisions.find((d) => d.id === 'DEC-SHELTER-SH04')
  assert.ok(shelterDec)
  assert.equal(shelterDec.action, 'REDIRECT')
  assert.equal(shelterDec.shelterId, 'SH-02')
  console.log('✅ PASS: Test 16: Formulates explainable evacuation, hospital protection & shelter redirection decisions')
  passed++
}

console.log('\n=================================================================')
console.log(`📊 PHASE 8 TEST RESULTS: ${passed} PASSED, 0 FAILED`)
console.log('=================================================================\n')

/**
 * Phase 4 Automated Test Suite — Citizen Intelligence + Ground Evidence
 * Tests evidence contract, deterministic verification, risk fusion, spatial localization,
 * deduplication, and demo scenarios.
 */

import {
  createEvidence,
  EvidenceType,
  EvidenceVerificationStatus,
  EvidenceSource,
  SeverityLevel,
} from '../domain/contracts.js'
import {
  scoreAndVerifyEvidence,
  calculateEvidenceRiskContribution,
  findNearestRiskZone,
  evaluateGroundEvidenceIntelligence,
  getEvidenceForScenario,
  DEMO_GROUND_EVIDENCE,
} from '../services/intelligence/evidence/evidenceEngine.js'

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    process.exit(1)
  }
  console.log(`✅ PASS: ${message}`)
}

console.log('====================================================')
console.log('🧪 RUNNING PHASE 4 GROUND EVIDENCE TEST SUITE')
console.log('====================================================\n')

// 1. Evidence Contract Tests
console.log('--- TEST GROUP 1: Canonical Evidence Contract ---')
const ev = createEvidence({
  id: 'TEST-001',
  type: EvidenceType.IMAGE,
  source: EvidenceSource.CITIZEN,
  location: { lat: 19.31, lng: 84.79, name: 'Brahmapur' },
  imageUrl: 'https://example.com/flood.jpg',
  description: 'Water submerged roadway completely near residential block',
  severity: SeverityLevel.HIGH,
  confidence: 0.92,
  verificationStatus: EvidenceVerificationStatus.VERIFIED,
  riskContribution: 8,
})
assert(ev.id === 'TEST-001', 'Evidence ID preserved')
assert(ev.type === 'IMAGE', 'Evidence type correct')
assert(ev.location.lat === 19.31 && ev.location.lng === 84.79, 'Location coordinates preserved')
assert(ev.metadata.locationValid === true, 'Ganjam bounding box geo-validation holds')
assert(ev.confidence >= 0 && ev.confidence <= 1, 'Confidence clamped between 0 and 1')

// 2. Verification Scoring Engine Tests
console.log('\n--- TEST GROUP 2: Deterministic Verification Scoring ---')
// Base 0.50 + geo 0.15 + img 0.10 + desc 0.10 + time 0.10 + sev 0.05 = 1.0 -> clamped to 0.99
const fullScore = scoreAndVerifyEvidence({
  lat: 19.31,
  lng: 84.79,
  imageUrl: 'test.jpg',
  description: 'Water has risen waist deep and entered local households.',
  timestamp: new Date().toISOString(),
  severity: SeverityLevel.HIGH,
})
assert(fullScore.confidence >= 0.85, 'Fully qualified report scores >= 0.85')
assert(fullScore.verificationStatus === EvidenceVerificationStatus.VERIFIED, 'Fully qualified report status is VERIFIED')

// Outside Ganjam coordinates, no image, short desc (<20 chars) -> low confidence
const poorScore = scoreAndVerifyEvidence({
  lat: 28.61, // Delhi, outside Ganjam
  lng: 77.20,
  description: 'rain',
  timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
  severity: SeverityLevel.LOW,
})
assert(poorScore.confidence < 0.60, 'Out of bounds report with minimal details scores < 0.60')
assert(poorScore.verificationStatus === EvidenceVerificationStatus.UNVERIFIED, 'Low score report status is UNVERIFIED')

// 3. Risk Contribution & Double Counting Tests
console.log('\n--- TEST GROUP 3: Risk Contribution & Deduplication ---')
const verifiedItem = createEvidence({
  id: 'E-VER-01',
  type: EvidenceType.FLOOD_REPORT,
  confidence: 0.90,
  verificationStatus: EvidenceVerificationStatus.VERIFIED,
})
const verifiedContribution = calculateEvidenceRiskContribution(verifiedItem)
assert(verifiedContribution > 0, `Verified evidence contributes positive risk (+${verifiedContribution})`)

const unverifiedItem = createEvidence({
  id: 'E-UNV-01',
  type: EvidenceType.FLOOD_REPORT,
  confidence: 0.50,
  verificationStatus: EvidenceVerificationStatus.UNVERIFIED,
})
assert(calculateEvidenceRiskContribution(unverifiedItem) === 0, 'Unverified evidence contributes zero risk')

const rejectedItem = createEvidence({
  id: 'E-REJ-01',
  type: EvidenceType.FLOOD_REPORT,
  confidence: 0.30,
  verificationStatus: EvidenceVerificationStatus.REJECTED,
})
assert(calculateEvidenceRiskContribution(rejectedItem) === 0, 'Rejected evidence contributes zero risk')

// Duplicate injection test
const dupTestList = [verifiedItem, verifiedItem, verifiedItem]
const dupResult = evaluateGroundEvidenceIntelligence({
  scenario: 'CUSTOM',
  baselineRiskScore: 60,
  customEvidenceList: dupTestList,
})
assert(dupResult.evidenceList.length === 1, 'Duplicate evidence items deduplicated by ID')
assert(dupResult.verifiedCount === 1, 'Verified count accurately reflects deduplication')

// 4. Spatial Localization Tests
console.log('\n--- TEST GROUP 4: Spatial Localization to Ganjam Zones ---')
const gopalpurZone = findNearestRiskZone(19.264, 84.908)
assert(gopalpurZone.zoneId === 'ZONE-GANJAM-01', `Gopalpur coordinates resolve to ZONE-GANJAM-01 (got ${gopalpurZone.zoneId})`)

const askaZone = findNearestRiskZone(19.612, 84.664)
assert(askaZone.zoneId === 'ZONE-GANJAM-02', `Aska coordinates resolve to ZONE-GANJAM-02 (got ${askaZone.zoneId})`)

const purushottampurZone = findNearestRiskZone(19.510, 84.880)
assert(purushottampurZone.zoneId === 'ZONE-GANJAM-03', `Purushottampur coordinates resolve to ZONE-GANJAM-03 (got ${purushottampurZone.zoneId})`)

// 5. Demo Scenarios Tests
console.log('\n--- TEST GROUP 5: Phase 4 Demo Scenarios ---')
// SCENARIO A: BASELINE
const baselineEval = evaluateGroundEvidenceIntelligence({
  scenario: 'BASELINE',
  baselineRiskScore: 60,
  baselineAffectedArea: 48.0,
  baselinePopulation: 7000,
})
assert(baselineEval.finalRiskScore === 60, `Scenario A (BASELINE): Final Risk = 60 (got ${baselineEval.finalRiskScore})`)
assert(baselineEval.evidenceRiskContribution === 0, 'Scenario A: 0 verified ground evidence applied')
assert(baselineEval.riskState.affectedAreaKm2 === 48.0, 'Scenario A: Baseline footprint 48 km²')
assert(baselineEval.riskState.affectedPopulation === 7000, 'Scenario A: Baseline population 7,000')

// SCENARIO B: GROUND EVIDENCE
const groundEval = evaluateGroundEvidenceIntelligence({
  scenario: 'GROUND_EVIDENCE',
  baselineRiskScore: 60,
  baselineAffectedArea: 48.0,
  baselinePopulation: 7000,
})
assert(groundEval.finalRiskScore === 74, `Scenario B (GROUND_EVIDENCE): Final Risk = 74 (got ${groundEval.finalRiskScore})`)
assert(groundEval.evidenceRiskContribution === 14, `Scenario B: Evidence contribution = +14 (got +${groundEval.evidenceRiskContribution})`)
assert(groundEval.riskState.affectedAreaKm2 === 54.0, `Scenario B: Footprint expands to 54 km² (got ${groundEval.riskState.affectedAreaKm2})`)
assert(groundEval.riskState.affectedPopulation === 8400, `Scenario B: Population at risk escalates to 8,400 (got ${groundEval.riskState.affectedPopulation})`)
assert(groundEval.riskState.reasons[0].includes('Verified ground evidence detected'), 'Scenario B: Risk reason contains verified ground trigger')

// SCENARIO C: CRITICAL INCIDENT
const criticalEval = evaluateGroundEvidenceIntelligence({
  scenario: 'CRITICAL_INCIDENT',
  baselineRiskScore: 60,
  baselineAffectedArea: 48.0,
  baselinePopulation: 7000,
})
assert(criticalEval.finalRiskScore === 82, `Scenario C (CRITICAL_INCIDENT): Final Risk = 82 (got ${criticalEval.finalRiskScore})`)
assert(criticalEval.evidenceRiskContribution === 22, `Scenario C: Evidence contribution = +22 (got +${criticalEval.evidenceRiskContribution})`)
assert(criticalEval.riskState.affectedAreaKm2 === 60.0, `Scenario C: Footprint expands to 60 km² (got ${criticalEval.riskState.affectedAreaKm2})`)
assert(criticalEval.riskState.affectedPopulation === 8900, `Scenario C: Population at risk escalates to 8,900 (got ${criticalEval.riskState.affectedPopulation})`)
assert(criticalEval.blockedRoads.length > 0, 'Scenario C: Road blockage detected')
assert(criticalEval.blockedRoads[0].status === 'BLOCKED', 'Scenario C: Road marked BLOCKED')
assert(criticalEval.impactedShelters.length > 0, 'Scenario C: Shelter at risk detected')
assert(criticalEval.impactedShelters[0].status === 'AT_RISK', 'Scenario C: Shelter status AT_RISK')

console.log('\n====================================================')
console.log('🎉 ALL PHASE 4 TEST SUITE ASSERTIONS PASSED!')
console.log('====================================================')

/**
 * Flood Intelligence Adapter — PS-074 Ganjam Disaster Intelligence
 * Connects dynamic weather intelligence into the adapted FLASH-FLOOD engine,
 * deriving a single canonical RiskState and synchronized risk zones.
 */

import {
  predictFlood,
  BASELINE_SCENARIO_INPUTS,
  WORSENING_SCENARIO_INPUTS,
  SEVERE_SCENARIO_INPUTS,
} from '../intelligence/flood/floodEngine'
import { getNormalizedRiskZones } from '../../data/ganjamRiskZones'
import {
  createFloodPrediction,
  createRiskState,
  SourceCategory,
} from '../../domain/contracts'
import { evaluateGroundEvidenceIntelligence } from '../intelligence/evidence/evidenceEngine'

/**
 * Evaluates flood intelligence dynamically driven by WeatherState or scenario.
 * 
 * @param {Object} options
 * @param {'BASELINE' | 'WORSENING' | 'SEVERE' | 'ESCALATED' | 'GROUND_EVIDENCE' | 'CRITICAL_INCIDENT' | 'LIVE'} options.scenario - Evaluation mode
 * @param {Object} options.weatherState - Normalized WeatherState input
 * @param {string} [options.evidenceScenario] - Ground evidence scenario ('BASELINE' | 'GROUND_EVIDENCE' | 'CRITICAL_INCIDENT')
 * @param {Array} [options.customEvidenceList] - Optional custom evidence list
 * @returns {{ floodPrediction: Object, riskState: Object, zones: Array, groundEvidence: Object }}
 */
export function evaluateFloodIntelligence({
  scenario = 'BASELINE',
  weatherState = null,
  evidenceScenario = null,
  customEvidenceList = null,
} = {}) {
  const normScenario = (scenario || 'BASELINE').toUpperCase()
  let inputs = { ...BASELINE_SCENARIO_INPUTS }
  let source = SourceCategory.MODEL

  // Determine baseline inputs from scenario
  if (normScenario === 'SEVERE') {
    inputs = { ...SEVERE_SCENARIO_INPUTS }
  } else if (normScenario === 'WORSENING' || normScenario === 'ESCALATED') {
    inputs = { ...WORSENING_SCENARIO_INPUTS }
  }

  // Dynamic Weather Override: If live/cached weatherState is provided, inject dynamic rainfall windows
  if (weatherState) {
    if (weatherState.source === SourceCategory.LIVE) {
      source = SourceCategory.LIVE_MODEL
    } else if (weatherState.source === 'CACHED') {
      source = 'CACHED_MODEL'
    }

    const rain1h = weatherState.rainfall1h ?? weatherState.rainfallMmPerHour
    const rain3h = weatherState.rainfall3h ?? (rain1h * 1.7)
    const rain24h = weatherState.rainfall24h ?? (rain1h * 2.7)

    inputs.rainfall_1h = Number(rain1h)
    inputs.rainfall_3h = Number(rain3h)
    inputs.rainfall_24h = Number(rain24h)

    // Dynamic river response heuristic based on 24h cumulative rain
    if (inputs.rainfall_24h > 300) {
      inputs.river_level_m = Math.max(inputs.river_level_m, 5.3)
      inputs.soil_moisture = 98.0
    } else if (inputs.rainfall_24h > 220) {
      inputs.river_level_m = Math.max(inputs.river_level_m, 4.85)
      inputs.soil_moisture = 91.0
    }
  }

  // 1. Run explainable hybrid flood prediction model
  const predictionResult = predictFlood(inputs, { source })

  // 2. Format canonical FloodPrediction contract
  const floodPrediction = createFloodPrediction({
    probability: predictionResult.probability,
    score: predictionResult.score,
    severity: predictionResult.severity,
    confidence: predictionResult.confidence,
    affectedAreaKm2: predictionResult.affectedAreaKm2,
    affectedPopulation: predictionResult.affectedPopulation,
    estimatedArrivalHours: predictionResult.estimatedArrivalHours,
    rainfallMmPerHour: predictionResult.rainfallMmPerHour,
    rainfall1h: predictionResult.rainfall1h,
    rainfall3h: predictionResult.rainfall3h,
    rainfall24h: predictionResult.rainfall24h,
    contributingFactors: predictionResult.contributingFactors,
    recommendation: predictionResult.recommendation,
    source,
    timestamp: predictionResult.timestamp,
  })

  // 3. Derive baseline RiskState contract explaining WHY risk changed
  const triggerDesc =
    normScenario === 'SEVERE'
      ? 'Extreme precipitation & squalls over saturated catchment'
      : normScenario === 'WORSENING' || normScenario === 'ESCALATED'
      ? 'Worsening rainfall accumulation & rising river tributaries'
      : 'Monsoonal rainfall buildup & coastal drainage delay'

  const riskReasons = [
    `Primary Trigger: ${triggerDesc}`,
    `Rainfall Intensity: ${floodPrediction.rainfallMmPerHour} mm/hr (3h window: ${predictionResult.rainfall3h}mm, 24h window: ${predictionResult.rainfall24h}mm)`,
    `River Catchment: Level at ${inputs.river_level_m}m vs ${inputs.danger_level_m}m danger threshold (${predictionResult.contributingFactors.river}% model weight)`,
    `Soil Moisture: Catchment saturation at ${inputs.soil_moisture}% (${predictionResult.contributingFactors.soil}% weight)`,
    `Coastal Lowlands: Drainage impedance across ${floodPrediction.affectedAreaKm2} km² floodplain`,
  ]

  let riskState = createRiskState({
    score: floodPrediction.score,
    severity: floodPrediction.severity,
    confidence: floodPrediction.confidence,
    affectedAreaKm2: floodPrediction.affectedAreaKm2,
    affectedPopulation: floodPrediction.affectedPopulation,
    source,
    timestamp: floodPrediction.timestamp,
    reasons: riskReasons,
  })

  // 4. Retrieve synchronized GeoJSON risk zones corresponding to active severity
  const zoneScenario = normScenario === 'SEVERE' ? 'SEVERE' : (normScenario === 'WORSENING' || normScenario === 'ESCALATED') ? 'WORSENING' : 'BASELINE'
  let zones = getNormalizedRiskZones(zoneScenario)

  // 5. Phase 4: Ground Evidence Layer Integration
  // Weather -> Flood Engine -> Baseline Risk -> Ground Evidence -> Evidence Verification -> Risk Contribution -> Canonical RiskState
  const effectiveEvidenceScenario = evidenceScenario || (normScenario === 'GROUND_EVIDENCE' || normScenario === 'CRITICAL_INCIDENT' ? normScenario : 'BASELINE')
  
  const evidenceResult = evaluateGroundEvidenceIntelligence({
    scenario: effectiveEvidenceScenario,
    baselineRiskScore: floodPrediction.score,
    baselineAffectedArea: floodPrediction.affectedAreaKm2,
    baselinePopulation: floodPrediction.affectedPopulation,
    customEvidenceList,
  })

  // If ground evidence contributes risk, update canonical RiskState and spatial zones
  if (evidenceResult.evidenceRiskContribution > 0 || effectiveEvidenceScenario !== 'BASELINE') {
    riskState = evidenceResult.riskState
    zones = evidenceResult.zones
  }

  return {
    floodPrediction,
    riskState,
    zones,
    groundEvidence: evidenceResult,
  }
}


/**
 * Risk Engine Adapter — PS-074 Ganjam Disaster Intelligence
 * Provides the baseline risk state and deterministic metrics for Ganjam District.
 */

import { createRiskState, SourceCategory, SeverityLevel } from '../../domain/contracts'

export function getBaselineRiskState(source = SourceCategory.DEMO) {
  return createRiskState({
    score: 48,
    severity: SeverityLevel.MODERATE,
    confidence: 0.88,
    affectedAreaKm2: 34.2,
    affectedPopulation: 4850,
    source,
    timestamp: new Date().toISOString(),
    reasons: [
      'Deep depression active over West-Central coastal waters',
      'Rushikulya and Bahuda basin catchment saturation at 74%',
      'Coastal storm surge advisory for Gopalpur-Chhatrapur stretch',
      'Drainage impediment along NH-16 urban low-lying pockets',
    ],
  })
}

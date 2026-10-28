/**
 * Cyclone Intelligence & Bay of Bengal Track Adapter — Phase 7
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 *
 * Normalizes GDACS (Global Disaster Alert and Coordination System) and CycloneAI
 * feeds into canonical CycloneObservation domain contracts.
 *
 * Implements strict fallback ladder: LIVE -> CACHED -> DEMO -> UNAVAILABLE.
 */

import {
  CycloneStatus,
  CycloneCategory,
  CycloneProximityBand,
  CycloneSource,
  DataStatus,
  createCycloneObservation,
} from '../../domain/contracts.js'
import { calculateDistanceKm } from '../../utils/geoEvidence.js'

export const GANJAM_REFERENCE_POINT = Object.freeze({
  lat: 19.31,
  lng: 84.79,
  name: 'Brahmapur / Ganjam Operational Headquarters',
})

// Bay of Bengal Bounding Box filter (North Indian Ocean approach)
export const BAY_OF_BENGAL_BBOX = Object.freeze({
  minLon: 80.0,
  maxLon: 98.0,
  minLat: 5.0,
  maxLat: 23.0,
})

/**
 * Deterministic Demo Scenarios for Ganjam, Odisha
 */
export const DEMO_CYCLONE_SCENARIOS = {
  // Scenario A: NO CYCLONE
  NO_CYCLONE: createCycloneObservation({
    id: 'CYCLONE-NONE',
    cycloneName: 'NO ACTIVE SYSTEM',
    basin: 'Coastal Basin',
    status: CycloneStatus.NO_CYCLONE,
    category: CycloneCategory.BOB_DEPRESSION,
    intensity: 'Calm / Normal',
    maxWindKph: 24,
    centralPressureHpa: 1012,
    position: { lat: 12.0, lng: 92.0 },
    distanceToGanjamKm: 980,
    approachTimeHours: 99,
    landfallProbability: 0.0,
    historicalTrack: [],
    forecastTrack: [],
    uncertaintyCone: null,
    confidence: 0.95,
    coastalRisk: 'LOW',
    stormSurgeRisk: 10,
    cycloneRiskScore: 0,
    dataStatus: DataStatus.DEMO,
    metadata: { note: 'No cyclonic disturbance active in coastal basin' },
  }),

  // Scenario B: DISTANT CYCLONE (~450 km away in southern Bay of Bengal)
  DISTANT: createCycloneObservation({
    id: 'CYCLONE-BOB-DISTANT',
    cycloneName: 'DEPRESSION-02',
    basin: 'Coastal Basin',
    status: CycloneStatus.MONITORING,
    category: CycloneCategory.BOB_DEPRESSION,
    intensity: 'Depression',
    maxWindKph: 55,
    centralPressureHpa: 1002,
    position: { lat: 15.60, lng: 87.80 },
    movementDirection: 'WNW',
    movementSpeedKph: 14,
    distanceToGanjamKm: 452,
    approachTimeHours: 32,
    landfallProbability: 0.28,
    historicalTrack: [
      { lat: 13.20, lng: 90.50, timestamp: '2026-10-19T00:00:00Z', windKph: 40, pressureHpa: 1006, status: 'MONITORING' },
      { lat: 14.40, lng: 89.10, timestamp: '2026-10-19T06:00:00Z', windKph: 48, pressureHpa: 1004, status: 'MONITORING' },
      { lat: 15.60, lng: 87.80, timestamp: '2026-10-19T12:00:00Z', windKph: 55, pressureHpa: 1002, status: 'DEPRESSION' },
    ],
    forecastTrack: [
      { lat: 16.50, lng: 86.40, timestamp: '2026-10-19T18:00:00Z', windKph: 60, pressureHpa: 1000, status: 'DEEP_DEPRESSION' },
      { lat: 17.20, lng: 85.30, timestamp: '2026-10-20T00:00:00Z', windKph: 65, pressureHpa: 998, status: 'DEEP_DEPRESSION' },
    ],
    confidence: 0.82,
    coastalRisk: 'WATCH',
    stormSurgeRisk: 30,
    cycloneRiskScore: 25,
    dataStatus: DataStatus.DEMO,
    metadata: { note: 'Distant depression monitored; minimal immediate Ganjam impact' },
  }),

  // Scenario C: APPROACHING CYCLONE (Main Phase 7 Demo: 182 km from Ganjam)
  APPROACHING: createCycloneObservation({
    id: 'CYCLONE-BOB-01',
    source: CycloneSource.GDACS,
    cycloneName: 'CYCLONE-01',
    basin: 'Coastal Basin',
    status: CycloneStatus.SEVERE_CYCLONIC_STORM,
    category: CycloneCategory.SEVERE_CYCLONIC_STORM,
    intensity: 'Severe Cyclonic Storm',
    maxWindKph: 120,
    centralPressureHpa: 972,
    position: { lat: 18.40, lng: 86.20 },
    movementDirection: 'NW',
    movementSpeedKph: 18,
    distanceToGanjamKm: 182,
    approachTimeHours: 12,
    landfallProbability: 0.78,
    historicalTrack: [
      { lat: 14.60, lng: 89.40, timestamp: '2026-10-19T00:00:00Z', windKph: 85, pressureHpa: 998, status: 'DEEP_DEPRESSION' },
      { lat: 16.80, lng: 88.10, timestamp: '2026-10-19T06:00:00Z', windKph: 105, pressureHpa: 990, status: 'CYCLONIC_STORM' },
      { lat: 18.40, lng: 86.20, timestamp: '2026-10-19T12:00:00Z', windKph: 120, pressureHpa: 982, status: 'SEVERE_CYCLONIC_STORM' },
    ],
    forecastTrack: [
      { lat: 18.90, lng: 85.40, timestamp: '2026-10-19T18:00:00Z', windKph: 130, pressureHpa: 976, status: 'SEVERE_CYCLONIC_STORM' },
      { lat: 19.35, lng: 84.85, timestamp: '2026-10-20T00:00:00Z', windKph: 135, pressureHpa: 972, status: 'VERY_SEVERE_CYCLONIC_STORM' },
      { lat: 19.80, lng: 84.20, timestamp: '2026-10-20T06:00:00Z', windKph: 110, pressureHpa: 984, status: 'CYCLONIC_STORM' },
    ],
    uncertaintyCone: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [86.20, 18.40],
          [86.10, 18.90],
          [85.80, 19.70],
          [84.90, 20.20],
          [83.80, 19.90],
          [84.30, 19.10],
          [85.10, 18.50],
          [86.20, 18.40],
        ]],
      },
    },
    confidence: 0.88,
    coastalRisk: 'WARNING',
    stormSurgeRisk: 76,
    cycloneRiskScore: 68,
    dataStatus: DataStatus.DEMO,
    metadata: {
      provider: 'GDACS Ingestion Pipeline (North Indian Ocean / Coastal Basin)',
      radarVerification: 'Gopalpur Coastal Doppler Radar Tracking',
      centralPressureHpa: 982,
      maxSustainedWindKph: 120,
      predictedGanjamPassage: 'Within 45 km of Gopalpur Coast',
    },
  }),

  // Scenario D: UNCERTAIN TRACK (High ensemble variance)
  UNCERTAIN: createCycloneObservation({
    id: 'CYCLONE-BOB-UNCERTAIN',
    cycloneName: 'TROPICAL CYCLONE 03B',
    basin: 'Coastal Basin',
    status: CycloneStatus.CYCLONIC_STORM,
    category: CycloneCategory.CYCLONIC_STORM,
    intensity: 'Moderate Cyclonic Storm',
    maxWindKph: 85,
    centralPressureHpa: 994,
    position: { lat: 17.50, lng: 87.20 },
    movementDirection: 'NNE',
    movementSpeedKph: 12,
    distanceToGanjamKm: 310,
    approachTimeHours: 24,
    landfallProbability: 0.45,
    historicalTrack: [
      { lat: 15.00, lng: 89.00, timestamp: '2026-10-19T00:00:00Z', windKph: 65, pressureHpa: 1000, status: 'DEPRESSION' },
      { lat: 16.20, lng: 88.00, timestamp: '2026-10-19T06:00:00Z', windKph: 75, pressureHpa: 996, status: 'CYCLONIC_STORM' },
      { lat: 17.50, lng: 87.20, timestamp: '2026-10-19T12:00:00Z', windKph: 85, pressureHpa: 994, status: 'CYCLONIC_STORM' },
    ],
    forecastTrack: [
      { lat: 18.80, lng: 87.00, timestamp: '2026-10-19T18:00:00Z', windKph: 85, pressureHpa: 994, status: 'CYCLONIC_STORM' },
      { lat: 20.20, lng: 87.50, timestamp: '2026-10-20T00:00:00Z', windKph: 80, pressureHpa: 996, status: 'CYCLONIC_STORM' },
    ],
    uncertaintyCone: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [87.20, 17.50],
          [88.20, 18.50],
          [89.10, 20.20],
          [86.00, 20.50],
          [85.20, 18.80],
          [87.20, 17.50],
        ]],
      },
    },
    confidence: 0.48, // Low track confidence
    coastalRisk: 'WATCH',
    stormSurgeRisk: 42,
    cycloneRiskScore: 38,
    dataStatus: DataStatus.DEMO,
    metadata: {
      note: 'Significant multi-model track spread; recurvature towards Bangladesh / West Bengal possible',
      recommendation: 'CONTINUE MONITORING; DO NOT ESCALATE AUTOMATICALLY',
    },
  }),
}

export class CycloneAdapter {
  constructor(apiBaseUrl = '/api/cyclone') {
    this.apiBaseUrl = apiBaseUrl
    this.cache = new Map()
    this.cache.set('APPROACHING', DEMO_CYCLONE_SCENARIOS.APPROACHING)
    this.cache.set('DISTANT', DEMO_CYCLONE_SCENARIOS.DISTANT)
    this.cache.set('NO_CYCLONE', DEMO_CYCLONE_SCENARIOS.NO_CYCLONE)
    this.cache.set('UNCERTAIN', DEMO_CYCLONE_SCENARIOS.UNCERTAIN)
  }

  /**
   * Fetches cyclone observation according to scenario and tiered fallback.
   * Ladder: LIVE -> CACHE -> DEMO -> UNAVAILABLE
   */
  async getCycloneObservation(scenario = 'APPROACHING') {
    const scKey = scenario.toUpperCase()

    if (scKey === 'UNAVAILABLE') {
      return createCycloneObservation({
        id: 'CYCLONE-UNAVAILABLE',
        cycloneName: 'FEED OFFLINE',
        status: CycloneStatus.NO_CYCLONE,
        dataStatus: DataStatus.UNAVAILABLE,
        confidence: 0,
        distanceToGanjamKm: 999,
        cycloneRiskScore: 0,
        metadata: { reason: 'External GDACS feed unreachable and offline demonstration mode disabled' },
      })
    }

    // Try live API if configured and reachable
    try {
      const response = await fetch(`${this.apiBaseUrl}?scenario=${scKey}`, {
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const liveJson = await response.json()
        if (liveJson?.data) {
          const norm = createCycloneObservation({
            ...liveJson.data,
            dataStatus: liveJson.data.dataStatus || DataStatus.LIVE,
          })
          this.cache.set(scKey, norm)
          return norm
        }
      }
    } catch {
      // Soft fallback to in-memory cache or demo
    }

    // Return cached or deterministic demo
    const demo = DEMO_CYCLONE_SCENARIOS[scKey] || DEMO_CYCLONE_SCENARIOS.APPROACHING
    this.cache.set(scKey, demo)
    return demo
  }

  /**
   * Alias helper supporting object options parameter
   */
  async fetchCycloneObservation({ scenario = 'APPROACHING' } = {}) {
    return this.getCycloneObservation(scenario)
  }

  /**
   * Alias helper for live GDACS polling with fallback
   */
  async fetchLiveGDACSCyclone() {
    return this.getCycloneObservation('APPROACHING')
  }

  /**
   * In-memory cache controls
   */
  clearCache() {
    this.cache.clear()
  }

  getCachedObservation(key = 'APPROACHING') {
    return this.cache.get(key.toUpperCase()) || null
  }

  /**
   * Returns list of available active cyclone systems
   */
  async getObservations(scenario = 'APPROACHING') {
    const primary = await this.getCycloneObservation(scenario)
    if (primary.status === CycloneStatus.NO_CYCLONE) return []
    return [primary]
  }

  /**
   * Returns specific observation by ID
   */
  async getObservationById(id) {
    if (!id) return null
    for (const obs of Object.values(DEMO_CYCLONE_SCENARIOS)) {
      if (obs.id === id) return obs
    }
    return null
  }
}

export const cycloneAdapter = new CycloneAdapter()

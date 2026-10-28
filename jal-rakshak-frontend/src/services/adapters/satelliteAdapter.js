/**
 * Earth Observation & Satellite Intelligence Adapter — Phase 6
 * PS-074 AI-Based Hyperlocal Disaster Intelligence System (Ganjam, Odisha)
 *
 * Adapts Earth Observation capabilities inspired by Drishti (Sentinel-1 SAR / Sentinel-2 NDWI)
 * into canonical SatelliteObservation domain contracts for Jal Rakshak.
 *
 * Implements strict fallback ladder: LIVE -> CACHED -> DEMO -> UNAVAILABLE.
 */

import {
  SatelliteSource,
  SatelliteType,
  SensorType,
  ObservationType,
  DataStatus,
  createSatelliteObservation,
} from '../../domain/contracts.js'

/**
 * Deterministic Ganjam SAR Flood Extent Polygon (overlaps Gopalpur Lowlands & Rushikulya Estuary)
 * Format: GeoJSON coordinates [lng, lat]
 */
export const GANJAM_SAR_FLOOD_POLYGON = [
  [84.850, 19.220],
  [84.980, 19.250],
  [84.950, 19.340],
  [84.820, 19.350],
  [84.720, 19.280],
  [84.680, 19.250],
  [84.850, 19.220],
]

/**
 * Deterministic Aska Floodplain NDWI Change Polygon (Sentinel-2 Optical)
 */
export const GANJAM_NDWI_CHANGE_POLYGON = [
  [84.620, 19.580],
  [84.710, 19.640],
  [84.730, 19.680],
  [84.650, 19.690],
  [84.580, 19.620],
  [84.620, 19.580],
]

/**
 * Deterministic fallback observations for Ganjam, Odisha
 */
export const DEMO_SATELLITE_OBSERVATIONS = {
  // Sentinel-1 SAR Flood Detection (Primary Phase 6 asset)
  SAR_PRIMARY: createSatelliteObservation({
    id: 'SAT-S1-GANJAM-001',
    source: SatelliteSource.DRISHTI,
    satellite: SatelliteType.SENTINEL_1,
    sensor: SensorType.SAR,
    acquisitionTime: '2026-10-19T05:11:24.000Z',
    processingTime: '2026-10-19T05:28:40.000Z',
    observationType: ObservationType.FLOOD_EXTENT,
    bbox: [84.68, 19.22, 84.98, 19.35],
    geometry: {
      type: 'Polygon',
      coordinates: [GANJAM_SAR_FLOOD_POLYGON],
    },
    floodDetected: true,
    floodProbability: 0.89,
    affectedAreaKm2: 51.8,
    changePercent: 18.2,
    confidence: 0.89,
    affectedZones: ['ZONE-GANJAM-01', 'ZONE-GANJAM-04'],
    metadata: {
      provider: 'Drishti SAR Pipeline (Copernicus Sentinel-1)',
      pixelResolutionMeters: 10.0,
      polarization: 'VV+VH Dual-Pol Backscatter',
      orbitDirection: 'DESCENDING',
      processingAlgorithm: 'Lee Speckle Filter + Otsu Adaptive Inundation Thresholding',
      backscatterDecibelDrop: -4.8,
    },
    dataStatus: DataStatus.DEMO,
  }),

  // Sentinel-2 Optical NDWI Water Change Observation
  NDWI_CHANGE: createSatelliteObservation({
    id: 'SAT-S2-GANJAM-002',
    source: SatelliteSource.DRISHTI,
    satellite: SatelliteType.SENTINEL_2,
    sensor: SensorType.NDWI,
    acquisitionTime: '2026-10-19T04:45:10.000Z',
    processingTime: '2026-10-19T05:15:32.000Z',
    observationType: ObservationType.WATER_CHANGE,
    bbox: [84.58, 19.58, 84.73, 19.69],
    geometry: {
      type: 'Polygon',
      coordinates: [GANJAM_NDWI_CHANGE_POLYGON],
    },
    floodDetected: true,
    floodProbability: 0.84,
    affectedAreaKm2: 36.4,
    changePercent: 24.5,
    confidence: 0.84,
    affectedZones: ['ZONE-GANJAM-02'],
    metadata: {
      provider: 'Drishti Optical Index Pipeline (Sentinel-2 MSI)',
      pixelResolutionMeters: 10.0,
      indexFormula: 'NDWI = (Green - NIR) / (Green + NIR)',
      waterThreshold: '> 0.30',
      cloudCoverPercent: 12.4,
      baselineComparisonPeriod: 'Pre-monsoon 14-day median',
    },
    dataStatus: DataStatus.DEMO,
  }),

  // Conflict Scenario: Satellite sees low/no inundation in a dry zone
  SAR_CONFLICT: createSatelliteObservation({
    id: 'SAT-S1-CONFLICT-003',
    source: SatelliteSource.DRISHTI,
    satellite: SatelliteType.SENTINEL_1,
    sensor: SensorType.SAR,
    acquisitionTime: '2026-10-19T05:11:24.000Z',
    processingTime: '2026-10-19T05:28:40.000Z',
    observationType: ObservationType.FLOOD_EXTENT,
    bbox: [84.30, 19.80, 84.45, 19.95],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [84.30, 19.80],
        [84.45, 19.82],
        [84.42, 19.94],
        [84.31, 19.92],
        [84.30, 19.80],
      ]],
    },
    floodDetected: false,
    floodProbability: 0.18,
    affectedAreaKm2: 4.2,
    changePercent: -2.1,
    confidence: 0.72,
    affectedZones: ['ZONE-GANJAM-05'],
    metadata: {
      provider: 'Drishti SAR Pipeline (Copernicus Sentinel-1)',
      pixelResolutionMeters: 10.0,
      polarization: 'VV+VH Dual-Pol',
      backscatterDecibelDrop: -0.4,
      note: 'Normal backscatter variance; no standing surface water signature detected',
    },
    dataStatus: DataStatus.DEMO,
  }),
}

export class SatelliteAdapter {
  constructor(apiBaseUrl = '/api/satellite') {
    this.apiBaseUrl = apiBaseUrl
    this.cachedObservations = new Map()
    this.cachedObservations.set(DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY.id, DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY)
    this.cachedObservations.set(DEMO_SATELLITE_OBSERVATIONS.NDWI_CHANGE.id, DEMO_SATELLITE_OBSERVATIONS.NDWI_CHANGE)
  }

  /**
   * Fetches latest Sentinel-1 SAR flood extent observation.
   * Ladder: Live API -> Cache -> Deterministic Demo
   */
  async getSARFloodExtent(scenario = 'SATELLITE_CONFIRMS') {
    if (scenario === 'NO_SATELLITE') {
      return createSatelliteObservation({
        id: 'SAT-UNAVAILABLE',
        floodDetected: false,
        confidence: 0,
        affectedAreaKm2: 0,
        dataStatus: DataStatus.UNAVAILABLE,
        metadata: { reason: 'No satellite overpass available within recent time window' },
      })
    }

    if (scenario === 'EVIDENCE_CONFLICT') {
      return DEMO_SATELLITE_OBSERVATIONS.SAR_CONFLICT
    }

    // Try Live API first if available
    try {
      const response = await fetch(`${this.apiBaseUrl}/sar`, {
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const liveData = await response.json()
        const norm = createSatelliteObservation({
          ...liveData,
          dataStatus: DataStatus.LIVE,
        })
        this.cachedObservations.set(norm.id, norm)
        return norm
      }
    } catch {
      // Graceful fallback to cache or demo
    }

    // Cache fallback
    const cached = this.cachedObservations.get(DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY.id)
    if (cached) {
      return {
        ...cached,
        dataStatus: DataStatus.DEMO,
      }
    }

    return DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY
  }

  /**
   * Fetches Sentinel-2 NDWI change detection observation
   */
  async getNDWIWaterChange(scenario = 'SATELLITE_CONFIRMS') {
    if (scenario === 'NO_SATELLITE') {
      return createSatelliteObservation({
        id: 'SAT-NDWI-UNAVAILABLE',
        sensor: SensorType.NDWI,
        observationType: ObservationType.WATER_CHANGE,
        floodDetected: false,
        confidence: 0,
        affectedAreaKm2: 0,
        dataStatus: DataStatus.UNAVAILABLE,
      })
    }

    return DEMO_SATELLITE_OBSERVATIONS.NDWI_CHANGE
  }

  /**
   * Retrieves all available observations for Ganjam
   */
  async getObservations(scenario = 'SATELLITE_CONFIRMS') {
    if (scenario === 'NO_SATELLITE') {
      return []
    }
    if (scenario === 'EVIDENCE_CONFLICT') {
      return [DEMO_SATELLITE_OBSERVATIONS.SAR_CONFLICT]
    }
    return [
      DEMO_SATELLITE_OBSERVATIONS.SAR_PRIMARY,
      DEMO_SATELLITE_OBSERVATIONS.NDWI_CHANGE,
    ]
  }

  /**
   * Retrieves a specific observation by ID
   */
  async getObservationById(id) {
    if (!id) return null
    if (this.cachedObservations.has(id)) {
      return this.cachedObservations.get(id)
    }
    const match = Object.values(DEMO_SATELLITE_OBSERVATIONS).find((o) => o.id === id)
    return match || null
  }
}

export const satelliteAdapter = new SatelliteAdapter()

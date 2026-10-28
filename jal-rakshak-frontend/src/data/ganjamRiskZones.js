/**
 * Ganjam Hyperlocal Risk Zones — GeoJSON Specification
 * PS-074 Ganjam Disaster Intelligence
 * 
 * Geographic Standard:
 * - GeoJSON geometry coordinates: [longitude, latitude]
 * - Leaflet coordinates: [latitude, longitude] (via toLeafletPolygon)
 * 
 * Source Labeling: Clearly marked as MODELLED DEMO ZONE per agent guidelines.
 */

import { toLeafletPolygon } from '../utils/geoUtils.js'
import { SeverityLevel } from '../domain/contracts.js'

export const GANJAM_RISK_ZONES_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'ZONE-GANJAM-01',
      properties: {
        id: 'ZONE-GANJAM-01',
        name: 'Rushikulya Estuary & Gopalpur Lowlands',
        riskScore: 82,
        baselineScore: 50,
        severity: SeverityLevel.HIGH,
        baselineSeverity: SeverityLevel.MODERATE,
        confidence: 0.91,
        waterDepth: '1.2m - 1.8m',
        affectedPopulation: 2850,
        baselinePopulation: 1950,
        affectedAreaKm2: 18.4,
        baselineAreaKm2: 13.2,
        primaryReason: 'Tidal surge backwater & river channel bottleneck',
        status: 'HIGH_ALERT_PREPAREDNESS',
        source: 'MODELLED DEMO ZONE',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.880, 19.245],
            [84.905, 19.290],
            [84.950, 19.285],
            [84.935, 19.240],
            [84.895, 19.230],
            [84.880, 19.245],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ZONE-GANJAM-02',
      properties: {
        id: 'ZONE-GANJAM-02',
        name: 'Aska River Confluence & Floodplain Basin',
        riskScore: 74,
        baselineScore: 48,
        severity: SeverityLevel.HIGH,
        baselineSeverity: SeverityLevel.MODERATE,
        confidence: 0.88,
        waterDepth: '0.8m - 1.4m',
        affectedPopulation: 2350,
        baselinePopulation: 1600,
        affectedAreaKm2: 15.6,
        baselineAreaKm2: 11.4,
        primaryReason: 'Confluence of Rushikulya & Badanadi tributaries',
        status: 'WATCH_AND_PREPARE',
        source: 'MODELLED DEMO ZONE',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.630, 19.585],
            [84.650, 19.630],
            [84.695, 19.635],
            [84.685, 19.595],
            [84.645, 19.575],
            [84.630, 19.585],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ZONE-GANJAM-03',
      properties: {
        id: 'ZONE-GANJAM-03',
        name: 'Purushottampur Low-lying River Basin',
        riskScore: 66,
        baselineScore: 46,
        severity: SeverityLevel.HIGH,
        baselineSeverity: SeverityLevel.MODERATE,
        confidence: 0.87,
        waterDepth: '0.6m - 1.1m',
        affectedPopulation: 1100,
        baselinePopulation: 800,
        affectedAreaKm2: 8.8,
        baselineAreaKm2: 5.6,
        primaryReason: 'Gauge level 16.40m approaching 16.83m danger threshold',
        status: 'MONITORING_INTENSIFIED',
        source: 'MODELLED DEMO ZONE',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.840, 19.500],
            [84.870, 19.535],
            [84.910, 19.525],
            [84.890, 19.490],
            [84.850, 19.485],
            [84.840, 19.500],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ZONE-GANJAM-04',
      properties: {
        id: 'ZONE-GANJAM-04',
        name: 'Brahmapur Urban Drainage Catchment',
        riskScore: 54,
        baselineScore: 42,
        severity: SeverityLevel.MODERATE,
        baselineSeverity: SeverityLevel.MODERATE,
        confidence: 0.85,
        waterDepth: '0.3m - 0.6m',
        affectedPopulation: 700,
        baselinePopulation: 500,
        affectedAreaKm2: 5.2,
        baselineAreaKm2: 4.0,
        primaryReason: 'Municipal stormwater outfall obstruction along NH-16',
        status: 'DEWATERING_ACTIVE',
        source: 'MODELLED DEMO ZONE',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.770, 19.295],
            [84.785, 19.330],
            [84.825, 19.335],
            [84.820, 19.300],
            [84.770, 19.295],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      id: 'ZONE-GANJAM-05',
      properties: {
        id: 'ZONE-GANJAM-05',
        name: 'Hinjilicut High-Ground Safe Zone',
        riskScore: 12,
        baselineScore: 12,
        severity: SeverityLevel.LOW,
        baselineSeverity: SeverityLevel.LOW,
        confidence: 0.95,
        waterDepth: '0.0m (High Elevation)',
        affectedPopulation: 0,
        baselinePopulation: 0,
        affectedAreaKm2: 0,
        baselineAreaKm2: 0,
        primaryReason: 'Natural ridge elevation +32m above flood datum',
        status: 'SAFE_EVACUATION_DESTINATION',
        source: 'MODELLED DEMO ZONE',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.720, 19.460],
            [84.735, 19.505],
            [84.775, 19.500],
            [84.760, 19.455],
            [84.720, 19.460],
          ],
        ],
      },
    },
  ],
}

/**
 * Returns normalized RiskZone list formatted for React-Leaflet and dashboard consumption.
 * @param {'BASELINE' | 'WORSENING' | 'SEVERE' | 'ESCALATED'} scenario 
 */
export function getNormalizedRiskZones(scenario = 'BASELINE') {
  const normScenario = (scenario || 'BASELINE').toUpperCase()
  const isSevere = normScenario === 'SEVERE'
  const isWorsening = normScenario === 'WORSENING' || normScenario === 'ESCALATED'

  return GANJAM_RISK_ZONES_GEOJSON.features.map((feature) => {
    const props = feature.properties
    let score = props.baselineScore
    let severity = props.baselineSeverity
    let pop = props.baselinePopulation
    let area = props.baselineAreaKm2
    let depth = props.waterDepth
    let status = props.status

    if (isSevere) {
      if (props.id === 'ZONE-GANJAM-01') {
        score = 92
        severity = SeverityLevel.CRITICAL
        pop = 4200
        area = 24.5
        depth = '2.0m - 2.8m (Critical Surge)'
        status = 'EVACUATION_MANDATORY'
      } else if (props.id === 'ZONE-GANJAM-02') {
        score = 84
        severity = SeverityLevel.CRITICAL
        pop = 3400
        area = 18.2
        depth = '1.5m - 2.2m (Confluence Overflow)'
        status = 'EVACUATION_URGENT'
      } else if (props.id === 'ZONE-GANJAM-03') {
        score = 78
        severity = SeverityLevel.CRITICAL
        pop = 1800
        area = 12.4
        depth = '1.2m - 1.8m (Gauge Breached)'
        status = 'HIGH_ALERT_EVACUATION'
      } else if (props.id === 'ZONE-GANJAM-04') {
        score = 68
        severity = SeverityLevel.HIGH
        pop = 1400
        area = 7.2
        depth = '0.8m - 1.2m (Urban Flash Inundation)'
        status = 'DEWATERING_EMERGENCY'
      } else {
        score = 16
        severity = SeverityLevel.LOW
        pop = 0
        area = 0
        depth = '0.0m (High Ridge Safe)'
        status = 'SAFE_EVACUATION_DESTINATION'
      }
    } else if (isWorsening) {
      score = props.riskScore
      severity = props.severity
      pop = props.affectedPopulation
      area = props.affectedAreaKm2
      depth = props.waterDepth
      status = props.status
    }

    // Leaflet coordinates converted from GeoJSON [lng, lat] to [lat, lng]
    const leafletCoords = toLeafletPolygon(feature.geometry.coordinates[0])
    const color = getSeverityColor(severity)

    return {
      id: props.id,
      name: props.name,
      riskScore: score,
      severity,
      confidence: isSevere ? 0.95 : props.confidence,
      affectedPopulation: pop,
      affectedAreaKm2: area,
      waterDepth: depth,
      primaryReason: props.primaryReason,
      status,
      source: props.source,
      geometry: feature.geometry,
      coordinates: leafletCoords,
      color,
      fillOpacity: severity === SeverityLevel.CRITICAL ? 0.48 : severity === SeverityLevel.HIGH ? 0.38 : 0.28,
    }
  })
}

export function getSeverityColor(severity) {
  switch (severity) {
    case SeverityLevel.CRITICAL:
      return '#DC2626' // Red 600
    case SeverityLevel.HIGH:
      return '#EA580C' // Orange 600
    case SeverityLevel.MODERATE:
    case SeverityLevel.MEDIUM:
      return '#CA8A04' // Yellow 600
    case SeverityLevel.LOW:
    default:
      return '#16A34A' // Green 600
  }
}

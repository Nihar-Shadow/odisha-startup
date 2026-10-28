/**
 * Ganjam Disaster Intelligence Controller — PS-074
 * Exposes canonical API contracts for Ganjam District with deterministic fallbacks.
 */

const { Shelter, CitizenReport, EmergencyRequest, Alert, RescueTeam } = require('../models');

// Baseline deterministic data for Ganjam District
const GANJAM_BASELINE_RISK = {
  score: 48,
  severity: 'MODERATE',
  confidence: 0.88,
  affectedAreaKm2: 34.2,
  affectedPopulation: 4850,
  source: 'FLOOD_MODEL',
  timestamp: new Date().toISOString(),
  reasons: [
    'Deep depression active over West-Central coastal waters',
    'Rushikulya and Bahuda basin catchment saturation at 74%',
    'Coastal storm surge advisory for Gopalpur-Chhatrapur stretch',
    'Drainage impediment along NH-16 urban low-lying pockets',
  ],
};

const GANJAM_WORSENING_RISK = {
  score: 60,
  severity: 'HIGH',
  confidence: 0.92,
  affectedAreaKm2: 48.0,
  affectedPopulation: 7000,
  source: 'FLOOD_MODEL',
  timestamp: new Date().toISOString(),
  reasons: [
    'Primary Trigger: Worsening rainfall accumulation (90 mm/hr, 3h window: 160mm)',
    'Purushottampur gauge level 16.65m approaching 16.83m danger threshold',
    'Catchment soil moisture at 91% preventing surface water percolation',
    'Choked stormwater outfalls between Gopalpur and Chhatrapur lowlands',
  ],
};

const GANJAM_SEVERE_RISK = {
  score: 76,
  severity: 'CRITICAL',
  confidence: 0.95,
  affectedAreaKm2: 62.0,
  affectedPopulation: 11500,
  source: 'FLOOD_MODEL',
  timestamp: new Date().toISOString(),
  reasons: [
    'Primary Trigger: Severe precipitation exceeding 115 mm/hr and 68 km/h gale squalls',
    'Rushikulya river overtopping banks with 5.4m surge (+1.4m above danger mark)',
    'Catchment saturation at 98% generating instantaneous overland sheet-flow',
    'Widespread low-lying residential inundation across 62 km² coastal plain',
  ],
};

const GANJAM_GROUND_EVIDENCE_RISK = {
  score: 74,
  severity: 'HIGH',
  confidence: 0.92,
  affectedAreaKm2: 54.0,
  affectedPopulation: 8400,
  source: 'GROUND_EVIDENCE_FUSION',
  timestamp: new Date().toISOString(),
  reasons: [
    'Primary Trigger: Verified ground evidence detected (+14% risk contribution)',
    'Supporting factors: 2 verified flood reports • 1 flood image • Worsening rainfall accumulation',
    'Ground Decision-Support Confidence: 92%',
    'Estimated Affected Footprint Expansion: 48.0 → 54.0 km²',
    'Estimated Population at Risk: 7,000 → 8,400',
  ],
};

const GANJAM_CRITICAL_INCIDENT_RISK = {
  score: 82,
  severity: 'CRITICAL',
  confidence: 0.95,
  affectedAreaKm2: 60.0,
  affectedPopulation: 8900,
  source: 'GROUND_EVIDENCE_FUSION',
  timestamp: new Date().toISOString(),
  reasons: [
    'Primary Trigger: Critical ground event detected: SOS evacuation & road blockage (+22% risk contribution)',
    'Supporting factors: 1 critical SOS beacon • 1 reported road blockage • 1 verified flood image • 1 shelter at-risk report',
    'Ground Decision-Support Confidence: 95%',
    'Estimated Affected Footprint Expansion: 48.0 → 60.0 km²',
    'Estimated Population at Risk: 7,000 → 8,900',
    'Operational Status: Aska → Purushottampur SH-36 reported blocked • Aska Shelter SH-04 at risk',
  ],
};

const GANJAM_DEMO_EVIDENCE = [
  {
    id: 'E-001',
    type: 'FLOOD_REPORT',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.264,
      lng: 84.908,
      name: 'Gopalpur Lowlands, Ganjam',
    },
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    description: 'Water level has reached road surface near the low-lying residential area.',
    severity: 'HIGH',
    confidence: 0.91,
    verificationStatus: 'VERIFIED',
    floodIndicators: { detected: true, waterDepthEst: '0.8m - 1.1m', confidence: 0.91 },
    riskContribution: 6,
    appliedToRisk: true,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-01' },
  },
  {
    id: 'E-002',
    type: 'IMAGE',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.612,
      lng: 84.664,
      name: 'Aska Floodplain Basin, Ganjam',
    },
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    description: 'Road partially submerged; vehicles unable to pass.',
    severity: 'HIGH',
    confidence: 0.94,
    verificationStatus: 'VERIFIED',
    floodIndicators: { detected: true, waterDepthEst: '1.0m - 1.4m', confidence: 0.94 },
    riskContribution: 8,
    appliedToRisk: true,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-02' },
  },
  {
    id: 'E-003',
    type: 'SOS',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.314,
      lng: 84.795,
      name: 'Brahmapur Urban Drainage Zone, Ganjam',
    },
    description: 'Family requesting evacuation assistance. Water entering ground floor residential rooms.',
    severity: 'CRITICAL',
    confidence: 0.97,
    verificationStatus: 'VERIFIED',
    floodIndicators: { detected: true, waterDepthEst: '1.2m', confidence: 0.97 },
    riskContribution: 12,
    appliedToRisk: true,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-04', trappedCount: 4, dispatchPriority: 'IMMEDIATE' },
  },
  {
    id: 'E-004',
    type: 'ROAD_BLOCKAGE',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.555,
      lng: 84.775,
      name: 'Aska → Purushottampur Corridor (SH-36)',
    },
    description: 'Culvert overflowing by 1.2m. State highway impassable for all standard traffic.',
    severity: 'HIGH',
    confidence: 0.94,
    verificationStatus: 'VERIFIED',
    affectedRoad: {
      roadName: 'Aska → Purushottampur SH-36',
      status: 'BLOCKED',
      confidence: 0.94,
    },
    riskContribution: 7,
    appliedToRisk: true,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-03' },
  },
  {
    id: 'E-005',
    type: 'SHELTER_REPORT',
    source: 'FIELD_TEAM',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.610,
      lng: 84.661,
      name: 'Aska Flood Relief Camp Perimeter',
    },
    description: 'Ground level approach to Aska Shelter flooded. Water entering outer courtyard.',
    severity: 'MODERATE',
    confidence: 0.89,
    verificationStatus: 'VERIFIED',
    affectedShelter: {
      shelterId: 'SH-04',
      shelterName: 'Aska Flood & Cyclone Relief Camp',
      status: 'AT_RISK',
      confidence: 0.89,
    },
    riskContribution: 5,
    appliedToRisk: true,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-02' },
  },
  {
    id: 'E-006',
    type: 'TEXT',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.355,
      lng: 84.990,
      name: 'Chhatrapur Coastal Outskirts',
    },
    description: 'Water receding slowly, drains still working.',
    severity: 'LOW',
    confidence: 0.55,
    verificationStatus: 'UNVERIFIED',
    riskContribution: 0,
    appliedToRisk: false,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-01' },
  },
  {
    id: 'E-007',
    type: 'FLOOD_REPORT',
    source: 'CITIZEN',
    timestamp: new Date().toISOString(),
    location: {
      lat: 19.480,
      lng: 84.745,
      name: 'Hinjilicut High Ridge Zone',
    },
    description: 'Reported flash flood on natural ridge crest.',
    severity: 'LOW',
    confidence: 0.30,
    verificationStatus: 'REJECTED',
    riskContribution: 0,
    appliedToRisk: false,
    processedAt: new Date().toISOString(),
    metadata: { nearestZoneId: 'ZONE-GANJAM-05', rejectionReason: 'Contradicts Digital Elevation Model (+32m ridge)' },
  },
];


const GANJAM_WEATHER_SCENARIOS = {
  BASELINE: {
    location: { lat: 19.31, lng: 84.79, name: 'Gopalpur / Brahmapur, Ganjam District' },
    rainfallMmPerHour: 68.0,
    rainfall1h: 68.0,
    rainfall3h: 115.0,
    rainfall24h: 185.0,
    windSpeedKmh: 42.0,
    windDirection: 'ENE (Coastal Squall)',
    windGustKmh: 58.0,
    temperatureC: 27.5,
    apparentTemperatureC: 31.0,
    humidity: 88,
    pressure: 996,
    precipitationProbability: 85,
    condition: 'Heavy Rain & Coastal Squall',
    trend: 'STABLE',
    severity: 'WATCH',
    stationName: 'Ganjam EOC Station (Gopalpur / Brahmapur)',
    source: 'DEMO',
    freshness: 'Modelled Scenario (Baseline)',
    forecast: [
      { time: '+1h', rainfallMm: 68, precipitationProbability: 85, windSpeedKmh: 42, condition: 'Heavy Rain' },
      { time: '+2h', rainfallMm: 70, precipitationProbability: 85, windSpeedKmh: 44, condition: 'Heavy Rain' },
      { time: '+3h', rainfallMm: 65, precipitationProbability: 80, windSpeedKmh: 40, condition: 'Moderate Rain' },
      { time: '+4h', rainfallMm: 58, precipitationProbability: 75, windSpeedKmh: 38, condition: 'Rain Showers' },
      { time: '+6h', rainfallMm: 52, precipitationProbability: 70, windSpeedKmh: 35, condition: 'Showers' },
      { time: '+8h', rainfallMm: 45, precipitationProbability: 65, windSpeedKmh: 32, condition: 'Light Rain' },
    ],
    timestamp: new Date().toISOString(),
  },
  WORSENING: {
    location: { lat: 19.31, lng: 84.79, name: 'Gopalpur / Brahmapur, Ganjam District' },
    rainfallMmPerHour: 90.0,
    rainfall1h: 90.0,
    rainfall3h: 160.0,
    rainfall24h: 250.0,
    windSpeedKmh: 55.0,
    windDirection: 'ENE (Coastal Squall)',
    windGustKmh: 72.0,
    temperatureC: 26.5,
    apparentTemperatureC: 30.0,
    humidity: 93,
    pressure: 991,
    precipitationProbability: 90,
    condition: 'Continuous Heavy Rain & Squall',
    trend: 'WORSENING',
    severity: 'WARNING',
    stationName: 'Ganjam EOC Station (Worsening Scenario)',
    source: 'DEMO',
    freshness: 'Modelled Scenario (Worsening)',
    forecast: [
      { time: '+1h', rainfallMm: 92, precipitationProbability: 90, windSpeedKmh: 56, condition: 'Heavy Rain' },
      { time: '+2h', rainfallMm: 94, precipitationProbability: 90, windSpeedKmh: 58, condition: 'Heavy Downpour' },
      { time: '+3h', rainfallMm: 88, precipitationProbability: 85, windSpeedKmh: 54, condition: 'Continuous Rain' },
      { time: '+4h', rainfallMm: 82, precipitationProbability: 85, windSpeedKmh: 50, condition: 'Heavy Rain' },
      { time: '+6h', rainfallMm: 72, precipitationProbability: 80, windSpeedKmh: 46, condition: 'Squall' },
      { time: '+8h', rainfallMm: 60, precipitationProbability: 75, windSpeedKmh: 42, condition: 'Showers' },
    ],
    timestamp: new Date().toISOString(),
  },
  SEVERE: {
    location: { lat: 19.31, lng: 84.79, name: 'Gopalpur / Brahmapur, Ganjam District' },
    rainfallMmPerHour: 115.0,
    rainfall1h: 115.0,
    rainfall3h: 215.0,
    rainfall24h: 340.0,
    windSpeedKmh: 68.0,
    windDirection: 'NE (Violent Gale)',
    windGustKmh: 88.0,
    temperatureC: 25.5,
    apparentTemperatureC: 29.0,
    humidity: 98,
    pressure: 984,
    precipitationProbability: 95,
    condition: 'Extreme Downpour & High Squall',
    trend: 'SEVERE',
    severity: 'SEVERE',
    stationName: 'Ganjam EOC Station (Severe Scenario)',
    source: 'DEMO',
    freshness: 'Modelled Scenario (Severe)',
    forecast: [
      { time: '+1h', rainfallMm: 118, precipitationProbability: 95, windSpeedKmh: 70, condition: 'Extreme Downpour' },
      { time: '+2h', rainfallMm: 112, precipitationProbability: 95, windSpeedKmh: 68, condition: 'Heavy Cloudburst' },
      { time: '+3h', rainfallMm: 105, precipitationProbability: 90, windSpeedKmh: 65, condition: 'Intense Storm' },
      { time: '+4h', rainfallMm: 95, precipitationProbability: 90, windSpeedKmh: 60, condition: 'Heavy Rain' },
      { time: '+6h', rainfallMm: 80, precipitationProbability: 85, windSpeedKmh: 55, condition: 'Squally Showers' },
      { time: '+8h', rainfallMm: 65, precipitationProbability: 80, windSpeedKmh: 48, condition: 'Continuous Rain' },
    ],
    timestamp: new Date().toISOString(),
  },
};

const GANJAM_RISK_ZONES_GEOJSON = {
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
        severity: 'HIGH',
        confidence: 0.91,
        waterDepth: '1.2m - 1.8m',
        affectedPopulation: 2850,
        affectedAreaKm2: 18.4,
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
        severity: 'HIGH',
        confidence: 0.88,
        waterDepth: '0.8m - 1.4m',
        affectedPopulation: 2350,
        affectedAreaKm2: 15.6,
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
        severity: 'HIGH',
        confidence: 0.87,
        waterDepth: '0.6m - 1.1m',
        affectedPopulation: 1100,
        affectedAreaKm2: 8.8,
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
        severity: 'MODERATE',
        confidence: 0.85,
        waterDepth: '0.3m - 0.6m',
        affectedPopulation: 700,
        affectedAreaKm2: 5.2,
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
        severity: 'LOW',
        confidence: 0.95,
        waterDepth: '0.0m (High Elevation)',
        affectedPopulation: 0,
        affectedAreaKm2: 0,
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
};

/**
 * GET /api/dashboard
 */
exports.getUnifiedDashboard = async (req, res) => {
  try {
    const [shelterCount, reportCount, emergencyCount, teamCount, alertCount] = await Promise.allSettled([
      Shelter.countDocuments({ isActive: { $ne: false } }),
      CitizenReport.countDocuments(),
      EmergencyRequest.countDocuments({ status: { $ne: 'RESOLVED' } }),
      RescueTeam.countDocuments(),
      Alert.countDocuments({ isActive: { $ne: false } }),
    ]);

    const shelters = shelterCount.status === 'fulfilled' ? shelterCount.value : 6;
    const incidents = reportCount.status === 'fulfilled' ? reportCount.value : 8;
    const emergencies = emergencyCount.status === 'fulfilled' ? emergencyCount.value : 3;
    const teams = teamCount.status === 'fulfilled' ? teamCount.value : 4;
    const alerts = alertCount.status === 'fulfilled' ? alertCount.value : 2;

    res.status(200).json({
      success: true,
      data: {
        district: 'Ganjam',
        center: [19.31, 84.79],
        risk: GANJAM_BASELINE_RISK,
        weather: GANJAM_WEATHER_SCENARIOS.BASELINE,
        kpis: {
          overallRisk: 48,
          activeIncidents: incidents,
          pendingSos: emergencies,
          affectedAreaKm2: 34.2,
          affectedPopulation: 4850,
          sheltersCount: shelters,
          responseUnitsCount: teams,
          activeAlerts: alerts,
        },
        mode: process.env.APP_MODE || 'DEMO_SIMULATION',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(200).json({
      success: true,
      data: {
        district: 'Ganjam',
        center: [19.31, 84.79],
        risk: GANJAM_BASELINE_RISK,
        weather: GANJAM_WEATHER_SCENARIOS.BASELINE,
        kpis: {
          overallRisk: 48,
          activeIncidents: 8,
          pendingSos: 3,
          affectedAreaKm2: 34.2,
          affectedPopulation: 4850,
          sheltersCount: 6,
          responseUnitsCount: 4,
          activeAlerts: 2,
        },
        mode: 'DEMO_SIMULATION_FALLBACK',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * GET /api/weather
 * Supports ?scenario=BASELINE|WORSENING|SEVERE
 */
exports.getWeather = async (req, res) => {
  const scenario = (req.query.scenario || 'BASELINE').toUpperCase();
  const weather = GANJAM_WEATHER_SCENARIOS[scenario] || GANJAM_WEATHER_SCENARIOS.BASELINE;
  res.status(200).json({
    success: true,
    data: weather,
  });
};

/**
 * GET /api/weather/forecast
 */
exports.getWeatherForecast = async (req, res) => {
  const scenario = (req.query.scenario || 'BASELINE').toUpperCase();
  const weather = GANJAM_WEATHER_SCENARIOS[scenario] || GANJAM_WEATHER_SCENARIOS.BASELINE;
  res.status(200).json({
    success: true,
    data: {
      location: weather.location,
      trend: weather.trend,
      severity: weather.severity,
      forecast: weather.forecast,
      timestamp: weather.timestamp,
    },
  });
};

/**
 * GET /api/risk
 * Supports ?scenario=BASELINE|WORSENING|SEVERE|ESCALATED|GROUND_EVIDENCE|CRITICAL_INCIDENT
 */
exports.getRisk = async (req, res) => {
  const scenario = (req.query.scenario || 'BASELINE').toUpperCase();
  let risk = GANJAM_BASELINE_RISK;
  if (scenario === 'CRITICAL_INCIDENT') {
    risk = GANJAM_CRITICAL_INCIDENT_RISK;
  } else if (scenario === 'GROUND_EVIDENCE') {
    risk = GANJAM_GROUND_EVIDENCE_RISK;
  } else if (scenario === 'SEVERE') {
    risk = GANJAM_SEVERE_RISK;
  } else if (scenario === 'WORSENING' || scenario === 'ESCALATED') {
    risk = GANJAM_WORSENING_RISK;
  }
  res.status(200).json({
    success: true,
    data: risk,
  });
};

/**
 * GET /api/flood
 * Returns normalized FloodPrediction contract adapted from FLASH-FLOOD
 * Supports ?scenario=BASELINE|WORSENING|SEVERE|ESCALATED
 */
exports.getFloodPrediction = async (req, res) => {
  const scenario = (req.query.scenario || 'BASELINE').toUpperCase();
  const isSevere = scenario === 'SEVERE';
  const isWorsening = scenario === 'WORSENING' || scenario === 'ESCALATED';

  let prediction;
  if (isSevere) {
    prediction = {
      probability: 0.76,
      score: 76,
      severity: 'CRITICAL',
      confidence: 0.95,
      affectedAreaKm2: 62.0,
      affectedPopulation: 11500,
      estimatedArrivalHours: 1.2,
      rainfallMmPerHour: 115.0,
      rainfall1h: 115.0,
      rainfall3h: 215.0,
      rainfall24h: 340.0,
      contributingFactors: { rainfall: 38, river: 32, soil: 16, slope: 8, proximity: 4, lightning: 2 },
      recommendation: 'Decision-Support: IMMEDIATE EVACUATION recommended for Rushikulya lower basin & Gopalpur coast. River breached danger level by 1.4m. Mobilize ODRAF/NDRF boat units immediately.',
      source: 'FLOOD_MODEL',
      timestamp: new Date().toISOString(),
    };
  } else if (isWorsening) {
    prediction = {
      probability: 0.60,
      score: 60,
      severity: 'HIGH',
      confidence: 0.92,
      affectedAreaKm2: 48.0,
      affectedPopulation: 7000,
      estimatedArrivalHours: 2.5,
      rainfallMmPerHour: 90.0,
      rainfall1h: 90.0,
      rainfall3h: 160.0,
      rainfall24h: 250.0,
      contributingFactors: { rainfall: 35, river: 30, soil: 16, slope: 10, proximity: 6, lightning: 3 },
      recommendation: 'Decision-Support: Issue Flash Flood Alert for Aska, Purushottampur & Chhatrapur lowlands. Estimated inundation onset in ~2.5 hrs. Position relief teams at designated cyclone shelters.',
      source: 'FLOOD_MODEL',
      timestamp: new Date().toISOString(),
    };
  } else {
    prediction = {
      probability: 0.48,
      score: 48,
      severity: 'MODERATE',
      confidence: 0.88,
      affectedAreaKm2: 34.2,
      affectedPopulation: 4850,
      estimatedArrivalHours: 4.5,
      rainfallMmPerHour: 68.0,
      rainfall1h: 68.0,
      rainfall3h: 115.0,
      rainfall24h: 185.0,
      contributingFactors: { rainfall: 32, river: 28, soil: 15, slope: 12, proximity: 8, lightning: 5 },
      recommendation: 'Decision-Support: Elevated flood risk across Ganjam lowlands. Monitor Rushikulya river gauges every 15 min. Alert Block Development Officers & shelter managers.',
      source: 'FLOOD_MODEL',
      timestamp: new Date().toISOString(),
    };
  }

  res.status(200).json({
    success: true,
    data: prediction,
  });
};

/**
 * GET /api/risk/grid
 * Returns normalized GeoJSON FeatureCollection of Ganjam risk zones
 */
exports.getRiskGrid = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_RISK_ZONES_GEOJSON,
  });
};

/**
 * GET /api/incidents
 */
exports.getIncidents = async (req, res) => {
  try {
    const reports = await CitizenReport.find().limit(20).lean();
    if (reports && reports.length > 0) {
      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    }
  } catch (err) {
    // Fallback
  }

  // Fallback Ganjam incidents
  res.status(200).json({
    success: true,
    count: 4,
    source: 'DEMO',
    data: [
      {
        id: 'INC-401',
        locationName: 'Gopalpur Coastal Road, Ganjam',
        category: 'Coastal Surge Inundation',
        severity: 'HIGH',
        verified: true,
        confidence: 0.96,
        source: 'CITIZEN',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'INC-402',
        locationName: 'Giri Market Lowland, Brahmapur',
        category: 'Urban Waterlogging',
        severity: 'MODERATE',
        verified: true,
        confidence: 0.91,
        source: 'CITIZEN',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'SOS-8801',
        locationName: 'Fishermen Colony, Gopalpur Coast',
        category: 'Rooftop Stranded + Infants',
        severity: 'CRITICAL',
        verified: true,
        confidence: 0.98,
        source: 'SOS',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'SOS-8802',
        locationName: 'Riverside Ward 2, Aska',
        category: 'Critical Medical Evacuation',
        severity: 'CRITICAL',
        verified: true,
        confidence: 0.99,
        source: 'SOS',
        timestamp: new Date().toISOString(),
      },
    ],
  });
};

/**
 * GET /api/citizen/reports
 */
exports.getCitizenReports = async (req, res) => {
  try {
    const reports = await CitizenReport.find().limit(50).lean();
    if (reports && reports.length > 0) {
      return res.status(200).json({
        success: true,
        count: reports.length,
        data: reports,
      });
    }
  } catch (err) {
    // Fallback to demo reports
  }

  res.status(200).json({
    success: true,
    count: GANJAM_DEMO_EVIDENCE.length,
    source: 'DEMO',
    data: GANJAM_DEMO_EVIDENCE,
  });
};

/**
 * GET /api/citizen/evidence
 * Supports ?scenario=BASELINE|GROUND_EVIDENCE|CRITICAL_INCIDENT
 */
exports.getCitizenEvidence = async (req, res) => {
  const scenario = (req.query.scenario || 'BASELINE').toUpperCase();

  let evidence = GANJAM_DEMO_EVIDENCE;
  let evidenceRiskContribution = 0;

  if (scenario === 'CRITICAL_INCIDENT') {
    evidence = [
      GANJAM_DEMO_EVIDENCE[1], // E-002: Image (Aska)
      GANJAM_DEMO_EVIDENCE[2], // E-003: Critical SOS (Brahmapur)
      GANJAM_DEMO_EVIDENCE[3], // E-004: Road Blockage (Aska-Purushottampur)
      GANJAM_DEMO_EVIDENCE[4], // E-005: Shelter issue (Aska)
      GANJAM_DEMO_EVIDENCE[5], // E-006: Unverified text
    ];
    evidenceRiskContribution = 22;
  } else if (scenario === 'GROUND_EVIDENCE') {
    evidence = [
      GANJAM_DEMO_EVIDENCE[0], // E-001: Flood report (Gopalpur)
      GANJAM_DEMO_EVIDENCE[1], // E-002: Image (Aska)
      GANJAM_DEMO_EVIDENCE[5], // E-006: Unverified text
      GANJAM_DEMO_EVIDENCE[6], // E-007: Rejected report
    ];
    evidenceRiskContribution = 14;
  } else {
    // BASELINE
    evidence = [
      GANJAM_DEMO_EVIDENCE[5], // E-006: Unverified
      GANJAM_DEMO_EVIDENCE[6], // E-007: Rejected
    ];
    evidenceRiskContribution = 0;
  }

  const verifiedItems = evidence.filter((e) => e.verificationStatus === 'VERIFIED');

  res.status(200).json({
    success: true,
    scenario,
    count: evidence.length,
    verifiedCount: verifiedItems.length,
    evidenceRiskContribution,
    data: evidence,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/citizen/evidence/:id
 */
exports.getCitizenEvidenceById = async (req, res) => {
  const id = req.params.id;
  const item = GANJAM_DEMO_EVIDENCE.find((e) => e.id.toLowerCase() === (id || '').toLowerCase());

  if (!item) {
    return res.status(404).json({
      success: false,
      error: `Evidence item ${id} not found in Ganjam intelligence layer`,
    });
  }

  res.status(200).json({
    success: true,
    data: item,
  });
};

/**
 * POST /api/risk/recompute
 * Recomputes canonical risk state based on injected scenario or custom evidence contributions
 */
exports.postRecomputeRisk = async (req, res) => {
  const scenario = (req.body?.scenario || req.query?.scenario || 'GROUND_EVIDENCE').toUpperCase();
  let baseRisk = GANJAM_WORSENING_RISK;
  let evidenceRisk = GANJAM_GROUND_EVIDENCE_RISK;

  if (scenario === 'CRITICAL_INCIDENT') {
    evidenceRisk = GANJAM_CRITICAL_INCIDENT_RISK;
  } else if (scenario === 'BASELINE') {
    evidenceRisk = baseRisk;
  }

  res.status(200).json({
    success: true,
    scenario,
    recomputedAt: new Date().toISOString(),
    baselineScore: baseRisk.score,
    finalScore: evidenceRisk.score,
    evidenceDelta: evidenceRisk.score - baseRisk.score,
    data: evidenceRisk,
  });
};

/**
 * PHASE 5 — RESCUE ORCHESTRATION + DISPATCH INTELLIGENCE API CONTRACTS
 */

const GANJAM_DEMO_RESPONSE_UNITS = [
  {
    id: 'RU-01',
    name: 'Gopalpur Water Rescue',
    commander: 'Sub-Inspector P. Mohanty',
    type: 'RESCUE_TEAM',
    status: 'AVAILABLE',
    location: { lat: 19.268, lng: 84.912, name: 'Gopalpur Coastal Base' },
    capacity: 12,
    capabilities: ['WATER_RESCUE', 'SEARCH'],
    availability: true,
    source: 'DEMO',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RU-02',
    name: 'Aska Boat Unit',
    commander: 'Officer Sangram Swain',
    type: 'BOAT',
    status: 'AVAILABLE',
    location: { lat: 19.610, lng: 84.665, name: 'Aska River Base' },
    capacity: 16,
    capabilities: ['WATER_RESCUE', 'EVACUATION'],
    availability: true,
    source: 'DEMO',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RU-03',
    name: 'Brahmapur Medical Response',
    commander: 'Dr. Arati Mishra (EMS Lead)',
    type: 'AMBULANCE',
    status: 'AVAILABLE',
    location: { lat: 19.312, lng: 84.792, name: 'MKCG Medical Base' },
    capacity: 4,
    capabilities: ['MEDICAL', 'EVACUATION'],
    availability: true,
    source: 'DEMO',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RU-04',
    name: 'District Supply Vehicle',
    commander: 'Logistics Supervisor R. Dash',
    type: 'SUPPLY_VEHICLE',
    status: 'AVAILABLE',
    location: { lat: 19.350, lng: 84.985, name: 'Chhatrapur Supply Depot' },
    capacity: 30,
    capabilities: ['SUPPLIES'],
    availability: true,
    source: 'DEMO',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RU-05',
    name: 'Fire & Rescue Team',
    commander: 'Station Officer S. K. Das',
    type: 'FIRE_RESPONSE',
    status: 'AVAILABLE',
    location: { lat: 19.320, lng: 84.805, name: 'Brahmapur Fire Station' },
    capacity: 18,
    capabilities: ['FIRE_RESPONSE', 'SEARCH'],
    availability: true,
    source: 'DEMO',
    lastUpdated: new Date().toISOString(),
  },
];

const GANJAM_CANONICAL_INCIDENTS = [
  {
    id: 'SOS-003',
    type: 'SOS',
    severity: 'CRITICAL',
    priority: 'CRITICAL',
    priorityScore: 96,
    confidence: 0.97,
    location: { lat: 19.264, lng: 84.905, name: 'Fishermen Basti, Gopalpur Coastal Lowland, Ganjam' },
    evidenceIds: ['E-01', 'E-03'],
    affectedZone: 'Gopalpur Lowlands (Sector 4)',
    affectedPopulation: 1400,
    roadStatus: 'BLOCKED',
    shelterImpact: 'SH-04 approach inundated',
    recommendedAction: 'RESCUE',
    assignedUnitId: 'RU-02',
    dispatchStatus: 'RECOMMENDED',
    eta: 14,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'FLOOD-007',
    type: 'FLOOD',
    severity: 'HIGH',
    priority: 'HIGH',
    priorityScore: 78,
    confidence: 0.94,
    location: { lat: 19.271, lng: 84.914, name: 'Gopalpur Coastal Road, Ganjam' },
    evidenceIds: ['E-01'],
    affectedZone: 'Gopalpur Lowlands (Sector 4)',
    affectedPopulation: 2400,
    roadStatus: 'CAUTION',
    shelterImpact: null,
    recommendedAction: 'EVACUATE',
    assignedUnitId: 'RU-01',
    dispatchStatus: 'RECOMMENDED',
    eta: 35,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ROAD-004',
    type: 'ROAD_BLOCKAGE',
    severity: 'HIGH',
    priority: 'HIGH',
    priorityScore: 75,
    confidence: 0.94,
    location: { lat: 19.450, lng: 84.820, name: 'State Highway 36 (Aska-Brahmapur Connector)' },
    evidenceIds: ['E-02'],
    affectedZone: 'Central Arterial Corridor',
    affectedPopulation: 0,
    roadStatus: 'BLOCKED',
    shelterImpact: null,
    recommendedAction: 'ROAD_CAUTION',
    assignedUnitId: 'RU-05',
    dispatchStatus: 'RECOMMENDED',
    eta: 10,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'SHELTER-003',
    type: 'SHELTER_RISK',
    severity: 'MODERATE',
    priority: 'MEDIUM',
    priorityScore: 54,
    confidence: 0.91,
    location: { lat: 19.612, lng: 84.664, name: 'Aska Relief Camp Approach, Rushikulya Basin' },
    evidenceIds: ['E-03'],
    affectedZone: 'Rushikulya Floodplain',
    affectedPopulation: 500,
    roadStatus: 'CAUTION',
    shelterImpact: 'SH-04 approach inundated',
    recommendedAction: 'SUPPLY',
    assignedUnitId: 'RU-04',
    dispatchStatus: 'RECOMMENDED',
    eta: 45,
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const GANJAM_EVALUATED_ROUTES = {
  recommendedRoute: {
    name: 'Alternative Coastal Connector & High-Ground Bypass',
    distanceKm: 6.4,
    estimatedTravelTimeMin: 14,
    status: 'OPEN',
    riskLevel: 'MODERATE',
    avoidedSegment: 'SH-36',
    selectionReason: 'Alternative route selected: +1.5 km detour, lower route risk, bypassing SH-36.',
    waypoints: [
      [19.61, 84.665],
      [19.52, 84.72],
      [19.43, 84.78],
      [19.34, 84.84],
      [19.264, 84.905],
    ],
  },
  rejectedRoute: {
    name: 'Direct Corridor via SH-36',
    distanceKm: 4.9,
    estimatedTravelTimeMin: 11,
    status: 'BLOCKED',
    riskLevel: 'HIGH',
    blockedSegment: 'SH-36',
    rejectionReason: 'Shortest route rejected: SH-36 reported blocked with 94% evidence confidence.',
    waypoints: [
      [19.61, 84.665],
      [19.49, 84.74],
      [19.38, 84.82],
      [19.264, 84.905],
    ],
  },
};

const GANJAM_EVALUATED_SHELTERS = [
  {
    id: 'SH-02',
    name: 'Chhatrapur Block Multipurpose Disaster Shelter',
    locationName: 'Chhatrapur EOC Zone, Ganjam',
    lat: 19.356,
    lng: 84.992,
    capacity: 2000,
    currentOccupancy: 940,
    availableSlots: 1060,
    occupancyPct: 47,
    status: 'SAFE',
    riskLevel: 'LOW',
    isRecommended: true,
    elevationMeters: 28,
    roadCondition: 'NH-16 Coastal Corridor Fully Operational',
    selectionScore: 92,
    recommendationReason: 'Safe status, 1060 available slots, accessible route, elevated ground (28m).',
  },
  {
    id: 'SH-01',
    name: 'Gopalpur Multi-Purpose Cyclone & Flood Shelter',
    locationName: 'Gopalpur-on-Sea, Ganjam',
    lat: 19.2612,
    lng: 84.9085,
    capacity: 1200,
    currentOccupancy: 620,
    availableSlots: 580,
    occupancyPct: 52,
    status: 'ACTIVE',
    riskLevel: 'LOW',
    isRecommended: true,
    elevationMeters: 22,
    roadCondition: 'Safe & Clear via NH-516A',
    selectionScore: 88,
    recommendationReason: 'Safe status, 580 available slots, elevated coastal plinth.',
  },
  {
    id: 'SH-04',
    name: 'Aska Flood & Cyclone Relief Camp',
    locationName: 'Rushikulya Basin, Aska, Ganjam',
    lat: 19.612,
    lng: 84.664,
    capacity: 1500,
    currentOccupancy: 1100,
    availableSlots: 400,
    occupancyPct: 73,
    status: 'AT_RISK',
    riskLevel: 'HIGH',
    isRecommended: false,
    elevationMeters: 18,
    roadCondition: 'Approach road partially waterlogged (Citizen verified blockage)',
    selectionScore: 24,
    rejectionReason: 'Current status is AT_RISK and approach corridor is partially submerged/blocked.',
  },
];

/**
 * GET /api/response-units
 */
exports.getResponseUnits = async (req, res) => {
  const scenario = (req.query.scenario || 'CRITICAL_INCIDENT').toUpperCase();
  let units = [...GANJAM_DEMO_RESPONSE_UNITS];

  if (scenario === 'CRITICAL_INCIDENT') {
    units = units.map((u) => {
      if (u.id === 'RU-02') {
        return { ...u, status: 'DISPATCHED', currentIncidentId: 'SOS-003', availability: false, etaMinutes: 14 };
      }
      if (u.id === 'RU-04') {
        return { ...u, status: 'EN_ROUTE', currentIncidentId: 'SHELTER-003', availability: false, etaMinutes: 45 };
      }
      return u;
    });
  }

  res.status(200).json({
    success: true,
    source: 'MODELLED_RESPONSE_CAPACITY',
    scenario,
    count: units.length,
    data: units,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/incidents
 * Supports ?scenario=MONITORING|GROUND_EVIDENCE|CRITICAL_INCIDENT
 */
exports.getCanonicalIncidents = async (req, res) => {
  const scenario = (req.query.scenario || 'CRITICAL_INCIDENT').toUpperCase();

  if (scenario === 'MONITORING') {
    return res.status(200).json({
      success: true,
      scenario,
      count: 0,
      data: [],
      message: 'Monitoring active: No critical ground incidents or active SOS reports detected.',
      timestamp: new Date().toISOString(),
    });
  }

  if (scenario === 'GROUND_EVIDENCE') {
    const subset = GANJAM_CANONICAL_INCIDENTS.filter((i) => i.id !== 'SOS-003');
    return res.status(200).json({
      success: true,
      scenario,
      count: subset.length,
      data: subset,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    success: true,
    scenario,
    count: GANJAM_CANONICAL_INCIDENTS.length,
    data: GANJAM_CANONICAL_INCIDENTS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/incidents/:id
 */
exports.getCanonicalIncidentById = async (req, res) => {
  const id = (req.params.id || '').toUpperCase();
  const incident = GANJAM_CANONICAL_INCIDENTS.find((i) => i.id.toUpperCase() === id);

  if (!incident) {
    return res.status(404).json({
      success: false,
      error: `Incident ${id} not found in Ganjam dispatch layer`,
    });
  }

  res.status(200).json({
    success: true,
    data: incident,
  });
};

/**
 * GET /api/dispatch
 * Matches Section 26 contract
 */
exports.getDispatch = async (req, res) => {
  const scenario = (req.query.scenario || 'CRITICAL_INCIDENT').toUpperCase();

  if (scenario === 'MONITORING') {
    return res.status(200).json({
      success: true,
      scenario,
      incidentId: 'INC-MON-01',
      priority: 'LOW',
      responseUnitId: null,
      action: 'MONITOR',
      routeRisk: 'LOW',
      etaMinutes: null,
      shelterId: 'SH-01',
      resources: ['DRINKING_WATER'],
      confidence: 0.95,
      rationale: [
        'Weather: WORSENING, Risk score: 60',
        'No critical incidents',
        'Action: MONITOR. No immediate dispatch required.',
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // Critical SOS default dispatch output per Section 26
  res.status(200).json({
    success: true,
    scenario,
    incidentId: 'SOS-003',
    priority: 'CRITICAL',
    responseUnitId: 'RU-02',
    action: 'RESCUE',
    routeRisk: 'MODERATE',
    etaMinutes: 14,
    shelterId: 'SH-02',
    resources: [
      'LIFE_JACKETS',
      'MEDICAL_KITS',
      'DRINKING_WATER',
    ],
    confidence: 0.91,
    rationale: [
      'Verified critical SOS',
      'High-risk zone',
      'SH-36 reported blocked',
      'SH-04 shelter at risk',
    ],
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/decisions
 */
exports.getDecisions = async (req, res) => {
  const scenario = (req.query.scenario || 'CRITICAL_INCIDENT').toUpperCase();

  const decisions = [
    {
      id: 'DEC-001-RESCUE',
      incidentId: 'SOS-003',
      priority: 'CRITICAL',
      action: 'RESCUE',
      responseUnitId: 'RU-02',
      route: GANJAM_EVALUATED_ROUTES.recommendedRoute,
      shelterId: 'SH-02',
      resources: ['LIFE_JACKETS', 'MEDICAL_KITS', 'DRINKING_WATER'],
      confidence: 0.96,
      status: 'RECOMMENDED',
      rationale: [
        'Verified critical SOS (SOS-003) with 97% confidence in critical risk zone.',
        'Estimated affected population: 1,400 in Gopalpur Lowlands.',
        'Selected unit: Aska Boat Unit (RU-02) with WATER_RESCUE capability and availability.',
        'Shortest route rejected: SH-36 reported blocked with 94% evidence confidence.',
        'Alternative safe route selected: +1.5 km detour (6.4 km, ETA 14 min) avoiding blocked corridor.',
        'Shelter SH-04 rejected (AT_RISK); Shelter SH-02 recommended (Chhatrapur Shelter).',
        'Resources prioritized: LIFE_JACKETS, MEDICAL_KITS, DRINKING_WATER.',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DEC-002-EVAC',
      incidentId: 'FLOOD-007',
      priority: 'HIGH',
      action: 'EVACUATE',
      responseUnitId: 'RU-01',
      route: null,
      shelterId: 'SH-02',
      resources: ['DRINKING_WATER', 'FOOD_PACKS'],
      confidence: 0.91,
      status: 'RECOMMENDED',
      rationale: [
        'Modelled evacuation recommendation: Gopalpur Lowlands facing tidal surge & river backwater.',
        'Target destination: SH-02 Safe Shelter (elevated plinth, available capacity).',
        'Approach road SH-36 reported blocked; evacuation convoy rerouted via coastal connector.',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DEC-003-ROAD',
      incidentId: 'ROAD-004',
      priority: 'HIGH',
      action: 'ROAD_CAUTION',
      responseUnitId: 'RU-05',
      route: null,
      shelterId: null,
      resources: ['RESCUE_EQUIPMENT'],
      confidence: 0.94,
      status: 'RECOMMENDED',
      rationale: [
        'SH-36 reported blocked (confidence 94%). Diverting general emergency traffic to NH-16 high connector.',
        'Deploying Fire & Rescue barrier team for caution cones and advisory signs.',
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DEC-004-SUPPLY',
      incidentId: 'SHELTER-003',
      priority: 'MEDIUM',
      action: 'SUPPLY',
      responseUnitId: 'RU-04',
      route: null,
      shelterId: 'SH-02',
      resources: ['MEDICAL_KITS', 'DRINKING_WATER'],
      confidence: 0.89,
      status: 'RECOMMENDED',
      rationale: [
        'Pre-positioning additional medical kits and drinking water rations at Chhatrapur Shelter SH-02.',
        'Anticipating evacuee influx from Gopalpur sector.',
      ],
      createdAt: new Date().toISOString(),
    },
  ];

  res.status(200).json({
    success: true,
    scenario,
    count: decisions.length,
    data: decisions,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/routes
 */
exports.getRoutes = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_EVALUATED_ROUTES,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/shelters
 */
exports.getEvaluatedShelters = async (req, res) => {
  res.status(200).json({
    success: true,
    count: GANJAM_EVALUATED_SHELTERS.length,
    data: GANJAM_EVALUATED_SHELTERS,
    recommendedShelterId: 'SH-02',
    rejectedShelterId: 'SH-04',
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/dispatch/recompute
 * POST /api/decisions/recompute
 */
exports.postRecomputeDispatch = async (req, res) => {
  const scenario = (req.body?.scenario || req.query?.scenario || 'CRITICAL_INCIDENT').toUpperCase();

  res.status(200).json({
    success: true,
    scenario,
    recomputedAt: new Date().toISOString(),
    incidentId: scenario === 'MONITORING' ? 'INC-MON-01' : 'SOS-003',
    priority: scenario === 'MONITORING' ? 'LOW' : 'CRITICAL',
    responseUnitId: scenario === 'MONITORING' ? null : 'RU-02',
    action: scenario === 'MONITORING' ? 'MONITOR' : 'RESCUE',
    routeRisk: scenario === 'MONITORING' ? 'LOW' : 'MODERATE',
    etaMinutes: scenario === 'MONITORING' ? null : 14,
    shelterId: scenario === 'MONITORING' ? 'SH-01' : 'SH-02',
    resources: scenario === 'MONITORING' ? ['DRINKING_WATER'] : ['LIFE_JACKETS', 'MEDICAL_KITS', 'DRINKING_WATER'],
    confidence: scenario === 'MONITORING' ? 0.95 : 0.91,
    rationale: scenario === 'MONITORING'
      ? ['Weather: WORSENING, Risk score: 60', 'No critical incidents', 'Action: MONITOR']
      : ['Verified critical SOS', 'High-risk zone', 'SH-36 reported blocked', 'SH-04 shelter at risk'],
  });
};

/**
 * =========================================================================
 * PHASE 6: EARTH OBSERVATION + SATELLITE VERIFICATION (10_API_CONTRACTS.md)
 * =========================================================================
 */

const GANJAM_SATELLITE_OBSERVATIONS = [
  {
    id: 'SAT-S1-GANJAM-001',
    source: 'DRISHTI',
    satellite: 'SENTINEL-1',
    sensor: 'SAR',
    acquisitionTime: '2026-10-19T05:11:24.000Z',
    processingTime: '2026-10-19T05:28:40.000Z',
    observationType: 'FLOOD_EXTENT',
    bbox: [84.68, 19.22, 84.98, 19.35],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [84.850, 19.220],
        [84.980, 19.250],
        [84.950, 19.340],
        [84.820, 19.350],
        [84.720, 19.280],
        [84.680, 19.250],
        [84.850, 19.220],
      ]],
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
    dataStatus: 'DEMO',
  },
  {
    id: 'SAT-S2-GANJAM-002',
    source: 'DRISHTI',
    satellite: 'SENTINEL-2',
    sensor: 'NDWI',
    acquisitionTime: '2026-10-19T04:45:10.000Z',
    processingTime: '2026-10-19T05:15:32.000Z',
    observationType: 'WATER_CHANGE',
    bbox: [84.58, 19.58, 84.73, 19.69],
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [84.620, 19.580],
        [84.710, 19.640],
        [84.730, 19.680],
        [84.650, 19.690],
        [84.580, 19.620],
        [84.620, 19.580],
      ]],
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
    dataStatus: 'DEMO',
  },
];

/**
 * GET /api/satellite
 * Current primary observation
 */
exports.getSatelliteObservation = async (req, res) => {
  const scenario = (req.query?.scenario || 'SATELLITE_CONFIRMS').toUpperCase();

  if (scenario === 'NO_SATELLITE') {
    return res.status(200).json({
      success: true,
      data: {
        id: 'SAT-UNAVAILABLE',
        floodDetected: false,
        confidence: 0,
        affectedAreaKm2: 0,
        dataStatus: 'UNAVAILABLE',
        message: 'Satellite data unavailable — using deterministic demonstration observation when requested.',
      },
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    success: true,
    data: GANJAM_SATELLITE_OBSERVATIONS[0],
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/satellite/observations
 * All available observations (SAR & Optical NDWI)
 */
exports.getSatelliteObservations = async (req, res) => {
  res.status(200).json({
    success: true,
    count: GANJAM_SATELLITE_OBSERVATIONS.length,
    data: GANJAM_SATELLITE_OBSERVATIONS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/satellite/:id
 * Detailed observation by ID
 */
exports.getSatelliteObservationById = async (req, res) => {
  const { id } = req.params;
  const match = GANJAM_SATELLITE_OBSERVATIONS.find((o) => o.id === id);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: `Satellite observation with id '${id}' not found.`,
      availableIds: GANJAM_SATELLITE_OBSERVATIONS.map((o) => o.id),
    });
  }

  res.status(200).json({
    success: true,
    data: match,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/satellite/fusion
 * Current evidence-fusion result
 */
exports.getSatelliteFusion = async (req, res) => {
  const scenario = (req.query?.scenario || 'SATELLITE_CONFIRMS').toUpperCase();

  if (scenario === 'NO_SATELLITE') {
    return res.status(200).json({
      success: true,
      scenario: 'NO_SATELLITE',
      data: {
        fusionConfidence: 0.91,
        riskAdjustment: 0,
        canonicalRiskScore: 74,
        severity: 'HIGH',
        affectedAreaKm2: 54.0,
        affectedPopulation: 8400,
        spatialAgreement: {
          overlapRatio: 0,
          status: 'UNAVAILABLE',
          explanation: 'Satellite overpass unavailable within time window',
        },
        modelAgreement: 'UNAVAILABLE',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (scenario === 'EVIDENCE_CONFLICT') {
    return res.status(200).json({
      success: true,
      scenario: 'EVIDENCE_CONFLICT',
      data: {
        fusionConfidence: 0.78,
        riskAdjustment: 0,
        canonicalRiskScore: 74,
        severity: 'HIGH',
        affectedAreaKm2: 54.0,
        affectedPopulation: 8400,
        spatialAgreement: {
          overlapRatio: 0.18,
          status: 'CONFLICT',
          explanation: 'Satellite observation does not strongly overlap reported ground location (18% < 35% threshold).',
        },
        modelAgreement: 'PARTIAL',
        evidenceConflict: {
          type: 'EVIDENCE_CONFLICT',
          sources: ['CITIZEN', 'SATELLITE'],
          severity: 'MODERATE',
          overlap: 0.18,
          explanation: 'Satellite radar backscatter shows low surface water signature. Citizen report retained for manual operator review.',
          recommendedAction: 'MANUAL_REVIEW',
        },
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Default: SATELLITE_CONFIRMS
  res.status(200).json({
    success: true,
    scenario: 'SATELLITE_CONFIRMS',
    data: {
      fusionConfidence: 0.94,
      riskAdjustment: 7, // Bounded corroboration (Base 60 + Ground 14 + Satellite 7 = 81)
      canonicalRiskScore: 81,
      severity: 'CRITICAL',
      affectedAreaKm2: 57.0,
      affectedPopulation: 8900,
      spatialAgreement: {
        overlapRatio: 0.82,
        status: 'CONFIRMED',
        explanation: 'Sentinel-1 SAR surface water detection strongly overlaps verified citizen lowlands reports (82% overlap).',
        matchingReportsCount: 3,
      },
      modelAgreement: 'HIGH',
      evidenceConflict: null,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/satellite/verify
 * Run satellite verification against current ground evidence
 */
exports.postVerifySatellite = async (req, res) => {
  const scenario = (req.body?.scenario || 'SATELLITE_CONFIRMS').toUpperCase();

  res.status(200).json({
    success: true,
    scenario,
    verifiedAt: new Date().toISOString(),
    satellite: 'SENTINEL-1',
    sensor: 'SAR',
    status: 'DEMO',
    floodDetected: scenario !== 'NO_SATELLITE' && scenario !== 'EVIDENCE_CONFLICT',
    spatialOverlap: scenario === 'EVIDENCE_CONFLICT' ? 0.18 : 0.82,
    agreement: scenario === 'EVIDENCE_CONFLICT' ? 'CONFLICT' : 'CONFIRMED',
    riskImpact: scenario === 'SATELLITE_CONFIRMS' ? '+7% Bounded Corroboration' : '+0% (Clamped)',
    canonicalRiskScore: scenario === 'SATELLITE_CONFIRMS' ? 81 : 74,
  });
};

/**
 * POST /api/satellite/recompute
 * Recompute full fusion chain
 */
exports.postRecomputeSatellite = async (req, res) => {
  const scenario = (req.body?.scenario || 'SATELLITE_CONFIRMS').toUpperCase();

  const isConfirmed = scenario === 'SATELLITE_CONFIRMS';
  const finalRisk = isConfirmed ? 81 : 74;
  const area = isConfirmed ? 57.0 : 54.0;
  const pop = isConfirmed ? 8900 : 8400;

  res.status(200).json({
    success: true,
    scenario,
    recomputedAt: new Date().toISOString(),
    pipeline: 'WEATHER -> FLOOD MODEL -> GROUND EVIDENCE -> SATELLITE EO -> FUSION -> CANONICAL RISK -> DISPATCH',
    fusionResult: {
      canonicalRiskScore: finalRisk,
      severity: isConfirmed ? 'CRITICAL' : 'HIGH',
      affectedAreaKm2: area,
      affectedPopulation: pop,
      fusionConfidence: isConfirmed ? 0.94 : (scenario === 'EVIDENCE_CONFLICT' ? 0.78 : 0.91),
      spatialAgreement: isConfirmed ? '82% CONFIRMED' : (scenario === 'EVIDENCE_CONFLICT' ? '18% CONFLICT' : 'UNAVAILABLE'),
    },
    dispatchUpdate: {
      sosIncidentId: 'SOS-003',
      priorityScore: isConfirmed ? 94 : 88,
      recommendedUnit: 'RU-02 (Aska Boat Unit)',
      safeRoute: 'SH-36 Blocked Detour (6.4 km, ETA 14m)',
      recommendedShelter: 'SH-02 (Chhatrapur Safe Shelter)',
    },
  });
};

// ==========================================
// Phase 7: Cyclone Intelligence + Bay of Bengal Track Integration
// ==========================================

const GANJAM_CYCLONE_SCENARIOS = {
  NO_CYCLONE: {
    observation: {
      id: 'CYC-NONE',
      source: 'GDACS_GLOBAL_FEED',
      sourceUrl: 'https://www.gdacs.org',
      cycloneName: 'No Active Cyclone in Coastal Sector',
      basin: 'BAY_OF_BENGAL',
      status: 'NO_CYCLONE',
      category: null,
      intensity: 'None',
      maxWindKph: null,
      centralPressureHpa: null,
      position: null,
      movementDirection: null,
      movementSpeedKph: null,
      distanceToGanjamKm: null,
      approachTimeHours: null,
      landfallProbability: 0,
      forecastTrack: [],
      historicalTrack: [],
      uncertaintyCone: null,
      confidence: 1.0,
      coastalRisk: 'LOW',
      stormSurgeRisk: 0,
      cycloneRiskScore: 0,
      proximityBand: 'LOW',
      dataStatus: 'DEMO',
      observedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        referencePoint: 'Ganjam EOC (19.31°N, 84.79°E)',
        note: 'No cyclonic system detected in coastal sector.',
      },
    },
    risk: {
      cycloneRiskScore: 0,
      proximityScore: 0,
      intensityScore: 0,
      approachScore: 0,
      confidenceScore: 0,
      coastalScore: 0,
      stormSurgeRisk: 0,
      coastalExposure: 'LOW',
      proximityBand: 'LOW',
      status: 'NO_CYCLONE',
      explanation: 'No cyclonic system detected within 1000 km of Ganjam coast.',
    },
    fusion: {
      baseHazardScore: 74,
      cycloneRiskScore: 0,
      cycloneContribution: 0,
      weatherInteractionBonus: 0,
      combinedRiskScore: 74,
      combinedSeverity: 'HIGH',
      explanation: 'No cyclone contribution. Risk driven purely by hydrological flood model.',
    },
  },

  DISTANT: {
    observation: {
      id: 'CYC-BOB-2026-DIST',
      source: 'GDACS_GLOBAL_FEED',
      sourceUrl: 'https://www.gdacs.org/report.aspx?eventtype=TC&eventid=1001200',
      cycloneName: 'CYC-MONITOR-02 (Central Coastal Track)',
      basin: 'BAY_OF_BENGAL',
      status: 'MONITORING',
      category: 'DEPRESSION',
      intensity: 'Depression',
      maxWindKph: 55,
      centralPressureHpa: 1002,
      position: { latitude: 15.8, longitude: 88.2 },
      movementDirection: 'NNW',
      movementSpeedKph: 12,
      distanceToGanjamKm: 450,
      approachTimeHours: 37.5,
      landfallProbability: 0.25,
      forecastTrack: [
        { latitude: 16.8, longitude: 87.6, timestamp: '2026-10-20T00:00:00Z', windKph: 65, pressureHpa: 998, status: 'DEEP_DEPRESSION' },
        { latitude: 17.9, longitude: 87.0, timestamp: '2026-10-20T12:00:00Z', windKph: 75, pressureHpa: 992, status: 'CYCLONIC_STORM' },
      ],
      historicalTrack: [
        { latitude: 14.5, longitude: 89.0, timestamp: '2026-10-18T12:00:00Z', windKph: 45, pressureHpa: 1006, status: 'DEPRESSION' },
      ],
      uncertaintyCone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [86.5, 18.5],
            [88.0, 18.8],
            [89.0, 17.5],
            [87.5, 16.0],
            [86.5, 18.5],
          ]],
        },
      },
      confidence: 0.72,
      coastalRisk: 'LOW',
      stormSurgeRisk: 15,
      cycloneRiskScore: 25,
      proximityBand: 'WATCH',
      dataStatus: 'DEMO',
      observedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        referencePoint: 'Ganjam EOC (19.31°N, 84.79°E)',
        note: 'Distant depression being tracked in central coastal waters.',
      },
    },
    risk: {
      cycloneRiskScore: 25,
      proximityScore: 10,
      intensityScore: 6,
      approachScore: 4,
      confidenceScore: 3,
      coastalScore: 2,
      stormSurgeRisk: 15,
      coastalExposure: 'LOW',
      proximityBand: 'WATCH',
      status: 'MONITORING',
      explanation: 'Distant depression at 450 km. Minimal current threat to Ganjam coast.',
    },
    fusion: {
      baseHazardScore: 74,
      cycloneRiskScore: 25,
      cycloneContribution: 2,
      weatherInteractionBonus: 0,
      combinedRiskScore: 76,
      combinedSeverity: 'HIGH',
      explanation: 'Distant cyclone at ~450 km provides minor bounded context (+2%).',
    },
  },

  APPROACHING: {
    observation: {
      id: 'CYC-BOB-2026-01',
      source: 'GDACS_GLOBAL_FEED',
      sourceUrl: 'https://www.gdacs.org/report.aspx?eventtype=TC&eventid=1001201',
      cycloneName: 'CYCLONE-01',
      basin: 'BAY_OF_BENGAL',
      status: 'SEVERE_CYCLONIC_STORM',
      category: 'CAT_1',
      intensity: 'Severe Cyclonic Storm',
      maxWindKph: 120,
      centralPressureHpa: 972,
      position: { latitude: 18.1, longitude: 86.2 },
      movementDirection: 'NW',
      movementSpeedKph: 18,
      distanceToGanjamKm: 182,
      approachTimeHours: 10.1,
      landfallProbability: 0.74,
      forecastTrack: [
        { latitude: 18.6, longitude: 85.6, timestamp: '2026-10-19T18:00:00Z', windKph: 125, pressureHpa: 968, status: 'SEVERE_CYCLONIC_STORM' },
        { latitude: 19.2, longitude: 85.1, timestamp: '2026-10-20T00:00:00Z', windKph: 130, pressureHpa: 964, status: 'VERY_SEVERE_CYCLONIC_STORM' },
        { latitude: 19.7, longitude: 84.7, timestamp: '2026-10-20T06:00:00Z', windKph: 110, pressureHpa: 975, status: 'SEVERE_CYCLONIC_STORM' },
        { latitude: 20.2, longitude: 84.3, timestamp: '2026-10-20T12:00:00Z', windKph: 85, pressureHpa: 988, status: 'CYCLONIC_STORM' },
      ],
      historicalTrack: [
        { latitude: 15.2, longitude: 88.5, timestamp: '2026-10-18T00:00:00Z', windKph: 85, pressureHpa: 994, status: 'CYCLONIC_STORM' },
        { latitude: 16.1, longitude: 87.8, timestamp: '2026-10-18T12:00:00Z', windKph: 100, pressureHpa: 984, status: 'SEVERE_CYCLONIC_STORM' },
        { latitude: 17.2, longitude: 87.0, timestamp: '2026-10-19T00:00:00Z', windKph: 115, pressureHpa: 976, status: 'SEVERE_CYCLONIC_STORM' },
      ],
      uncertaintyCone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [84.5, 19.5],
            [85.2, 19.8],
            [86.0, 19.3],
            [86.8, 18.7],
            [86.2, 17.8],
            [85.5, 17.5],
            [84.8, 18.2],
            [84.5, 19.5],
          ]],
        },
      },
      confidence: 0.88,
      coastalRisk: 'HIGH',
      stormSurgeRisk: 72,
      cycloneRiskScore: 68,
      proximityBand: 'WARNING',
      dataStatus: 'DEMO',
      observedAt: '2026-10-19T10:30:00Z',
      updatedAt: '2026-10-19T10:45:00Z',
      metadata: {
        referencePoint: 'Ganjam EOC (19.31°N, 84.79°E)',
        sourceAgency: 'GDACS / Modelled Coastal Track',
        note: 'Approaching Severe Cyclonic Storm toward Odisha Coast.',
      },
    },
    risk: {
      cycloneRiskScore: 68,
      proximityScore: 24,
      intensityScore: 23,
      approachScore: 12,
      confidenceScore: 5,
      coastalScore: 4,
      stormSurgeRisk: 72,
      coastalExposure: 'HIGH',
      proximityBand: 'WARNING',
      status: 'SEVERE_CYCLONIC_STORM',
      explanation: 'Cyclone track approaches within 182 km of Ganjam with 120 km/h sustained winds.',
    },
    fusion: {
      baseHazardScore: 81,
      cycloneRiskScore: 68,
      cycloneContribution: 8,
      weatherInteractionBonus: 2,
      combinedRiskScore: 89,
      combinedSeverity: 'CRITICAL',
      explanation: 'Cyclone track approaches within 182 km of Ganjam and forecast movement is toward the Odisha coast.',
    },
  },

  UNCERTAIN: {
    observation: {
      id: 'CYC-BOB-2026-UNC',
      source: 'GDACS_GLOBAL_FEED',
      sourceUrl: 'https://www.gdacs.org/report.aspx?eventtype=TC&eventid=1001202',
      cycloneName: 'BOB-ENSEMBLE-SPREAD (Dispersed Track)',
      basin: 'BAY_OF_BENGAL',
      status: 'CYCLONIC_STORM',
      category: 'DEPRESSION',
      intensity: 'Cyclonic Storm (High Dispersion)',
      maxWindKph: 85,
      centralPressureHpa: 988,
      position: { latitude: 17.5, longitude: 87.4 },
      movementDirection: 'NE_TO_NW',
      movementSpeedKph: 14,
      distanceToGanjamKm: 320,
      approachTimeHours: 22.8,
      landfallProbability: 0.38,
      forecastTrack: [
        { latitude: 18.2, longitude: 87.8, timestamp: '2026-10-20T00:00:00Z', windKph: 80, pressureHpa: 990, status: 'CYCLONIC_STORM' },
        { latitude: 19.0, longitude: 88.5, timestamp: '2026-10-20T12:00:00Z', windKph: 75, pressureHpa: 994, status: 'DEEP_DEPRESSION' },
      ],
      historicalTrack: [
        { latitude: 16.0, longitude: 88.0, timestamp: '2026-10-18T12:00:00Z', windKph: 75, pressureHpa: 994, status: 'CYCLONIC_STORM' },
      ],
      uncertaintyCone: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [84.0, 20.5],
            [89.5, 20.0],
            [89.0, 16.5],
            [85.5, 16.0],
            [84.0, 20.5],
          ]],
        },
      },
      confidence: 0.42,
      coastalRisk: 'MODERATE',
      stormSurgeRisk: 35,
      cycloneRiskScore: 35,
      proximityBand: 'WATCH',
      dataStatus: 'DEMO',
      observedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        referencePoint: 'Ganjam EOC (19.31°N, 84.79°E)',
        note: 'High track uncertainty due to atmospheric steering divergence.',
      },
    },
    risk: {
      cycloneRiskScore: 35,
      proximityScore: 14,
      intensityScore: 10,
      approachScore: 5,
      confidenceScore: 3,
      coastalScore: 3,
      stormSurgeRisk: 35,
      coastalExposure: 'MODERATE',
      proximityBand: 'WATCH',
      status: 'CYCLONIC_STORM',
      explanation: 'High ensemble track uncertainty; steering currents divergent. Confidence reduced.',
    },
    fusion: {
      baseHazardScore: 81,
      cycloneRiskScore: 35,
      cycloneContribution: 2,
      weatherInteractionBonus: 0,
      combinedRiskScore: 83,
      combinedSeverity: 'CRITICAL',
      explanation: 'Track uncertainty high (confidence 42%); cyclone contribution reduced to prevent false escalation.',
    },
  },
};

let currentCycloneScenarioKey = 'APPROACHING';

/**
 * GET /api/cyclone
 * Primary Cyclone Observation
 */
exports.getCycloneObservation = async (req, res) => {
  const scenario = (req.query?.scenario || currentCycloneScenarioKey).toUpperCase();
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario] || GANJAM_CYCLONE_SCENARIOS.APPROACHING;

  res.status(200).json({
    success: true,
    scenario,
    data: scenarioData.observation,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/cyclone/observations
 * List of Bay of Bengal cyclone observations
 */
exports.getCycloneObservations = async (req, res) => {
  const list = Object.keys(GANJAM_CYCLONE_SCENARIOS)
    .filter((k) => k !== 'NO_CYCLONE')
    .map((k) => GANJAM_CYCLONE_SCENARIOS[k].observation);

  res.status(200).json({
    success: true,
    count: list.length,
    basin: 'BAY_OF_BENGAL',
    targetCenter: '19.31°N, 84.79°E (Ganjam)',
    data: list,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/cyclone/track
 * Track points, forecast points, uncertainty cone
 */
exports.getCycloneTrack = async (req, res) => {
  const scenario = (req.query?.scenario || currentCycloneScenarioKey).toUpperCase();
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario] || GANJAM_CYCLONE_SCENARIOS.APPROACHING;
  const obs = scenarioData.observation;

  res.status(200).json({
    success: true,
    scenario,
    data: {
      cycloneId: obs.id,
      cycloneName: obs.cycloneName,
      status: obs.status,
      currentPosition: obs.position,
      historicalTrack: obs.historicalTrack || [],
      forecastTrack: obs.forecastTrack || [],
      uncertaintyCone: obs.uncertaintyCone || null,
      distanceToGanjamKm: obs.distanceToGanjamKm,
      movement: `${obs.movementDirection || 'N/A'} @ ${obs.movementSpeedKph || 0} km/h`,
      dataStatus: obs.dataStatus,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/cyclone/risk
 * Cyclone risk evaluation and factors
 */
exports.getCycloneRisk = async (req, res) => {
  const scenario = (req.query?.scenario || currentCycloneScenarioKey).toUpperCase();
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario] || GANJAM_CYCLONE_SCENARIOS.APPROACHING;

  res.status(200).json({
    success: true,
    scenario,
    data: scenarioData.risk,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/cyclone/fusion
 * Multi-hazard flood + cyclone risk fusion
 */
exports.getCycloneFusion = async (req, res) => {
  const scenario = (req.query?.scenario || currentCycloneScenarioKey).toUpperCase();
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario] || GANJAM_CYCLONE_SCENARIOS.APPROACHING;

  res.status(200).json({
    success: true,
    scenario,
    data: scenarioData.fusion,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/cyclone/:id
 * Cyclone observation by ID
 */
exports.getCycloneObservationById = async (req, res) => {
  const { id } = req.params;
  const match = Object.values(GANJAM_CYCLONE_SCENARIOS).find((s) => s.observation.id === id);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: `Cyclone observation with ID '${id}' not found.`,
      availableIds: Object.values(GANJAM_CYCLONE_SCENARIOS).map((s) => s.observation.id),
    });
  }

  res.status(200).json({
    success: true,
    data: match.observation,
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/cyclone/scenario
 * Switch active cyclone scenario
 */
exports.postCycloneScenario = async (req, res) => {
  const scenario = (req.body?.scenario || 'APPROACHING').toUpperCase();
  if (!GANJAM_CYCLONE_SCENARIOS[scenario]) {
    return res.status(400).json({
      success: false,
      message: `Invalid scenario '${scenario}'. Must be one of: ${Object.keys(GANJAM_CYCLONE_SCENARIOS).join(', ')}`,
    });
  }

  currentCycloneScenarioKey = scenario;
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario];

  res.status(200).json({
    success: true,
    scenario,
    message: `Active cyclone scenario switched to ${scenario}.`,
    data: scenarioData.observation,
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/cyclone/recompute
 * Recompute cyclone multi-hazard fusion and dispatch priority
 */
exports.postRecomputeCyclone = async (req, res) => {
  const scenario = (req.body?.scenario || currentCycloneScenarioKey).toUpperCase();
  const scenarioData = GANJAM_CYCLONE_SCENARIOS[scenario] || GANJAM_CYCLONE_SCENARIOS.APPROACHING;
  const isApproaching = scenario === 'APPROACHING';

  res.status(200).json({
    success: true,
    scenario,
    recomputedAt: new Date().toISOString(),
    pipeline: 'WEATHER -> FLOOD MODEL -> GROUND EVIDENCE -> SATELLITE EO -> CYCLONE TRACK -> MULTI-HAZARD FUSION -> DISPATCH',
    fusionResult: scenarioData.fusion,
    dispatchUpdate: {
      sosIncidentId: 'SOS-003',
      priorityScore: isApproaching ? 98 : 94,
      recommendedUnit: 'RU-02 (Aska Boat Unit)',
      safeRoute: 'SH-36 Blocked Detour (6.4 km, ETA 14m)',
      recommendedShelter: 'SH-02 (Chhatrapur Safe Shelter)',
      coastalSheltersAtRisk: isApproaching ? ['SH-04 (Gopalpur Coastal Cyclone Shelter)'] : [],
      operationalRecommendations: isApproaching
        ? [
            'PRE-STAGE BOAT UNIT RU-02 at Aska staging yard',
            'PRE-POSITION MEDICAL SUPPLIES to Chhatrapur & Brahmapur EOC',
            'CHECK COASTAL SHELTERS: Mark SH-04 Gopalpur as AT_RISK due to surge corridor',
            'MONITOR LOW-LYING ZONES: Rushikulya basin & Gopalpur coastal plain',
            'PREPARE INLAND EVACUATION ROUTE: Divert traffic away from coastal SH-36',
          ]
        : ['CONTINUE ROUTINE MONITORING: Cyclone distance exceeds 300 km.'],
    },
  });
};

/**
 * ============================================================================
 * PHASE 8 — VULNERABILITY + POPULATION EXPOSURE + CRITICAL INFRASTRUCTURE
 * PS-074 Ganjam District, Odisha
 * ============================================================================
 */

const GANJAM_P8_INFRASTRUCTURE = [
  {
    id: 'INFRA-HOSP-01',
    name: 'Aska Sub-Divisional Hospital',
    type: 'HOSPITAL',
    location: { lat: 19.615, lng: 84.662, name: 'Aska Town Hospital Road' },
    zoneId: 'ZONE-GANJAM-02',
    capacity: 150,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'HIGH',
    accessibility: 'PARTIALLY_ACCESSIBLE',
    floodExposure: 65,
    cycloneExposure: 30,
    serviceDependency: {
      roadAccess: 'BLOCKED',
      powerGrid: 'AT_RISK',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'AT_RISK',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.92,
  },
  {
    id: 'INFRA-HC-02',
    name: 'Gopalpur Primary Health Center',
    type: 'HEALTH_CENTER',
    location: { lat: 19.263, lng: 84.910, name: 'Gopalpur Coastal Road' },
    zoneId: 'ZONE-GANJAM-01',
    capacity: 40,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'MODERATE',
    accessibility: 'OPEN',
    floodExposure: 45,
    cycloneExposure: 70,
    serviceDependency: {
      roadAccess: 'OPEN',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'OPEN',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.88,
  },
  {
    id: 'INFRA-SHELTER-02',
    name: 'Chhatrapur Multipurpose Disaster Shelter (SH-02)',
    type: 'SHELTER',
    location: { lat: 19.356, lng: 84.992, name: 'Chhatrapur High Ground' },
    zoneId: 'ZONE-GANJAM-01',
    capacity: 2000,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'LOW',
    accessibility: 'OPEN',
    floodExposure: 15,
    cycloneExposure: 40,
    serviceDependency: {
      roadAccess: 'OPEN',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'OPEN',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.95,
  },
  {
    id: 'INFRA-SHELTER-04',
    name: 'Gopalpur Lowland Cyclone Shelter (SH-04)',
    type: 'SHELTER',
    location: { lat: 19.261, lng: 84.908, name: 'Gopalpur Estuary Front' },
    zoneId: 'ZONE-GANJAM-01',
    capacity: 1500,
    currentStatus: 'AT_RISK',
    riskLevel: 'CRITICAL',
    accessibility: 'BLOCKED',
    floodExposure: 78,
    cycloneExposure: 88,
    serviceDependency: {
      roadAccess: 'BLOCKED',
      powerGrid: 'OFFLINE',
      waterSupply: 'AT_RISK',
      supplyCorridor: 'BLOCKED',
      backupGenerator: false,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.93,
  },
  {
    id: 'INFRA-BRIDGE-02',
    name: 'Rushikulya River Bridge (BR-02)',
    type: 'BRIDGE',
    location: { lat: 19.522, lng: 84.885, name: 'Purushottampur-Aska Highway' },
    zoneId: 'ZONE-GANJAM-03',
    capacity: 2500,
    currentStatus: 'PARTIALLY_ACCESSIBLE',
    riskLevel: 'HIGH',
    accessibility: 'PARTIALLY_ACCESSIBLE',
    floodExposure: 82,
    cycloneExposure: 35,
    serviceDependency: {
      roadAccess: 'PARTIALLY_ACCESSIBLE',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'PARTIALLY_ACCESSIBLE',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.91,
  },
  {
    id: 'INFRA-POWER-01',
    name: 'Aska 132/33kV Power Substation (PS-01)',
    type: 'POWER_SUBSTATION',
    location: { lat: 19.608, lng: 84.670, name: 'Aska Industrial Bypass' },
    zoneId: 'ZONE-GANJAM-02',
    capacity: 120,
    currentStatus: 'AT_RISK',
    riskLevel: 'MODERATE',
    accessibility: 'PARTIALLY_ACCESSIBLE',
    floodExposure: 58,
    cycloneExposure: 40,
    serviceDependency: {
      roadAccess: 'PARTIALLY_ACCESSIBLE',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'OPEN',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.89,
  },
  {
    id: 'INFRA-WATER-01',
    name: 'Rushikulya Intake Water Supply Plant (WP-01)',
    type: 'WATER_SUPPLY',
    location: { lat: 19.518, lng: 84.880, name: 'Purushottampur River Intake' },
    zoneId: 'ZONE-GANJAM-03',
    capacity: 50,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'MODERATE',
    accessibility: 'OPEN',
    floodExposure: 50,
    cycloneExposure: 25,
    serviceDependency: {
      roadAccess: 'OPEN',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'OPEN',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.87,
  },
  {
    id: 'INFRA-FIRE-01',
    name: 'Brahmapur Central Fire & Disaster Staging Station',
    type: 'FIRE_STATION',
    location: { lat: 19.320, lng: 84.805, name: 'Courtpeta, Brahmapur' },
    zoneId: 'ZONE-GANJAM-01',
    capacity: 80,
    currentStatus: 'OPERATIONAL',
    riskLevel: 'LOW',
    accessibility: 'OPEN',
    floodExposure: 20,
    cycloneExposure: 35,
    serviceDependency: {
      roadAccess: 'OPEN',
      powerGrid: 'OPERATIONAL',
      waterSupply: 'OPERATIONAL',
      supplyCorridor: 'OPEN',
      backupGenerator: true,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    confidence: 0.94,
  },
];

const GANJAM_P8_EXPOSURES = [
  {
    id: 'EXP-AS-01',
    zoneId: 'ZONE-GANJAM-02',
    name: 'Aska Rushikulya Floodplain',
    population: 18000,
    exposedPopulation: 7200,
    highRiskPopulation: 4100,
    vulnerablePopulation: 2600,
    elderlyPopulation: 1100,
    childrenPopulation: 900,
    mobilityLimitedPopulation: 600,
    households: 3800,
    exposurePercentage: 40.0,
    confidence: 0.92,
    source: 'MODELLED_DEMO',
    provenance: 'MODELLED EXPOSURE',
  },
  {
    id: 'EXP-GP-01',
    zoneId: 'ZONE-GANJAM-01',
    name: 'Gopalpur Coastal Lowlands',
    population: 24000,
    exposedPopulation: 1100,
    highRiskPopulation: 480,
    vulnerablePopulation: 320,
    elderlyPopulation: 140,
    childrenPopulation: 120,
    mobilityLimitedPopulation: 60,
    households: 3900,
    exposurePercentage: 4.6,
    confidence: 0.89,
    source: 'MODELLED_DEMO',
    provenance: 'MODELLED EXPOSURE',
  },
  {
    id: 'EXP-PR-01',
    zoneId: 'ZONE-GANJAM-03',
    name: 'Purushottampur Gauge Lowlands',
    population: 14000,
    exposedPopulation: 600,
    highRiskPopulation: 220,
    vulnerablePopulation: 180,
    elderlyPopulation: 80,
    childrenPopulation: 60,
    mobilityLimitedPopulation: 40,
    households: 2200,
    exposurePercentage: 4.3,
    confidence: 0.87,
    source: 'MODELLED_DEMO',
    provenance: 'MODELLED EXPOSURE',
  },
];

const GANJAM_P8_IMPACTS = [
  {
    infrastructureId: 'INFRA-HOSP-01',
    impactScore: 84,
    impactLevel: 'CRITICAL',
    accessRisk: 'CRITICAL',
    serviceRisk: 'HIGH',
    recommendedAction: 'SH-36 access blocked: Protect alternate medical access corridor; pre-stage boat rescue RU-02; switch hospital to backup generator.',
    contributingFactors: {
      hazardBase: 28,
      floodModifier: 25,
      cycloneModifier: 6,
      roadBlockageModifier: 25,
      citizenEvidenceModifier: 8,
      satelliteConfirmationModifier: 7,
    },
    confidence: 0.94,
    provenance: 'MODELLED IMPACT',
  },
  {
    infrastructureId: 'INFRA-SHELTER-04',
    impactScore: 92,
    impactLevel: 'CRITICAL',
    accessRisk: 'CRITICAL',
    serviceRisk: 'CRITICAL',
    recommendedAction: 'Coastal surge and road inundation: DO NOT ROUTE EVACUEES; redirect to elevated Chhatrapur Shelter SH-02.',
    contributingFactors: {
      hazardBase: 28,
      floodModifier: 25,
      cycloneModifier: 18,
      roadBlockageModifier: 22,
      citizenEvidenceModifier: 8,
      satelliteConfirmationModifier: 7,
    },
    confidence: 0.95,
    provenance: 'MODELLED IMPACT',
  },
  {
    infrastructureId: 'INFRA-BRIDGE-02',
    impactScore: 72,
    impactLevel: 'HIGH',
    accessRisk: 'HIGH',
    serviceRisk: 'HIGH',
    recommendedAction: 'River level near 16.83m danger threshold: Restrict heavy convoy transit; divert to bypass.',
    contributingFactors: {
      hazardBase: 28,
      floodModifier: 25,
      cycloneModifier: 7,
      roadBlockageModifier: 14,
      citizenEvidenceModifier: 0,
      satelliteConfirmationModifier: 0,
    },
    confidence: 0.91,
    provenance: 'MODELLED IMPACT',
  },
  {
    infrastructureId: 'INFRA-POWER-01',
    impactScore: 62,
    impactLevel: 'HIGH',
    accessRisk: 'PARTIALLY_ACCESSIBLE',
    serviceRisk: 'MODERATE',
    recommendedAction: 'Elevate perimeter flood barriers; stage portable de-watering pumps.',
    contributingFactors: {
      hazardBase: 28,
      floodModifier: 18,
      cycloneModifier: 8,
      roadBlockageModifier: 8,
      citizenEvidenceModifier: 0,
      satelliteConfirmationModifier: 0,
    },
    confidence: 0.89,
    provenance: 'MODELLED IMPACT',
  },
  {
    infrastructureId: 'INFRA-SHELTER-02',
    impactScore: 22,
    impactLevel: 'LOW',
    accessRisk: 'OPEN',
    serviceRisk: 'LOW',
    recommendedAction: 'Elevated ground safe: Reserve primary evacuation intake for Aska & Gopalpur vulnerable households.',
    contributingFactors: {
      hazardBase: 28,
      floodModifier: 4,
      cycloneModifier: 8,
      roadBlockageModifier: 0,
      citizenEvidenceModifier: 0,
      satelliteConfirmationModifier: 0,
    },
    confidence: 0.95,
    provenance: 'MODELLED IMPACT',
  },
];

const GANJAM_P8_ZONE_PRIORITIES = [
  {
    zoneId: 'ZONE-GANJAM-02',
    name: 'Aska Rushikulya Floodplain',
    priorityScore: 96,
    priorityClass: 'CRITICAL',
    exposedPopulation: 7200,
    vulnerablePopulation: 2600,
    infrastructureAtRisk: 3,
    primaryThreat: 'Riverine flood inundation cutting off Aska Sub-Divisional Hospital & 2,600 vulnerable residents',
    recommendedAction: 'Evacuate vulnerable households; protect hospital access corridor; pre-stage boat rescue RU-02.',
    rationale: [
      'Priority Score: 96 (CRITICAL)',
      '2,600 vulnerable residents (1,100 elderly, 900 children, 600 mobility-limited)',
      'Aska Sub-Divisional Hospital access via SH-36 BLOCKED',
      'Aska 132/33kV Substation PS-01 threatened',
    ],
    contributingFactors: {
      vulnerabilityPoints: 42,
      hazardPoints: 17,
      vulnerablePopulationPoints: 20,
      infrastructurePoints: 10,
      incidentUrgencyPoints: 7,
    },
    provenance: 'DETERMINISTIC PRIORITY SCORE',
  },
  {
    zoneId: 'ZONE-GANJAM-01',
    name: 'Gopalpur Coastal Lowlands',
    priorityScore: 84,
    priorityClass: 'HIGH',
    exposedPopulation: 1100,
    vulnerablePopulation: 320,
    infrastructureAtRisk: 1,
    primaryThreat: 'Coastal storm surge & lowlands drainage congestion threatening coastal settlements',
    recommendedAction: 'Coastal evacuation preparation; enforce redirection from surge shelter SH-04 to safe shelter SH-02.',
    rationale: [
      'Priority Score: 84 (HIGH)',
      'Shelter SH-04 compromised by coastal surge (DO NOT ROUTE)',
      'Safe detour via elevated coastal corridor open',
    ],
    contributingFactors: {
      vulnerabilityPoints: 34,
      hazardPoints: 18,
      vulnerablePopulationPoints: 14,
      infrastructurePoints: 10,
      incidentUrgencyPoints: 8,
    },
    provenance: 'DETERMINISTIC PRIORITY SCORE',
  },
  {
    zoneId: 'ZONE-GANJAM-03',
    name: 'Purushottampur Gauge Lowlands',
    priorityScore: 68,
    priorityClass: 'HIGH',
    exposedPopulation: 600,
    vulnerablePopulation: 180,
    infrastructureAtRisk: 1,
    primaryThreat: 'Rushikulya river discharge nearing danger mark (16.83m) at Purushottampur',
    recommendedAction: 'Monitor intake water pumping station WP-01; restrict heavy vehicular transit on Bridge BR-02.',
    rationale: [
      'Priority Score: 68 (HIGH)',
      'Bridge BR-02 water level at 16.40m',
      'Water pumping plant WP-01 operational',
    ],
    contributingFactors: {
      vulnerabilityPoints: 28,
      hazardPoints: 16,
      vulnerablePopulationPoints: 12,
      infrastructurePoints: 6,
      incidentUrgencyPoints: 6,
    },
    provenance: 'DETERMINISTIC PRIORITY SCORE',
  },
];

/**
 * GET /api/exposure
 * Master exposure overview
 */
exports.getExposure = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalExposedPopulation: 8900,
        totalVulnerablePopulation: 3100,
        totalHighRiskPopulation: 4800,
        criticalPriorityZonesCount: 1,
        highPriorityZonesCount: 2,
        infrastructureAtRiskCount: 4,
        criticalAccessBlockedCount: 2,
      },
      exposures: GANJAM_P8_EXPOSURES,
      zonePriorities: GANJAM_P8_ZONE_PRIORITIES,
      infrastructureImpacts: GANJAM_P8_IMPACTS,
      criticalInfrastructure: GANJAM_P8_INFRASTRUCTURE,
      provenance: 'MODELLED EXPOSURE',
      disclaimer: 'MODELLED DEMO DATA: Not an official Census of India enumeration.',
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/exposure/population
 */
exports.getExposurePopulation = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_EXPOSURES,
    provenance: 'MODELLED EXPOSURE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/exposure/vulnerability
 */
exports.getExposureVulnerability = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_ZONE_PRIORITIES.map((p) => ({
      zoneId: p.zoneId,
      name: p.name,
      priorityScore: p.priorityScore,
      priorityClass: p.priorityClass,
      vulnerablePopulation: p.vulnerablePopulation,
      factors: p.contributingFactors,
    })),
    provenance: 'MODELLED VULNERABILITY SCORE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/exposure/zones
 */
exports.getExposureZones = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_ZONE_PRIORITIES,
    provenance: 'DETERMINISTIC PRIORITY SCORE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/infrastructure
 */
exports.getInfrastructure = async (req, res) => {
  const { type, status } = req.query;
  let items = GANJAM_P8_INFRASTRUCTURE;

  if (type) {
    items = items.filter((i) => i.type.toUpperCase() === type.toUpperCase());
  }
  if (status) {
    items = items.filter((i) => i.currentStatus.toUpperCase() === status.toUpperCase());
  }

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/infrastructure/:id
 */
exports.getInfrastructureById = async (req, res) => {
  const id = (req.params.id || '').toUpperCase();
  const match = GANJAM_P8_INFRASTRUCTURE.find((i) => i.id.toUpperCase() === id);

  if (!match) {
    return res.status(404).json({
      success: false,
      message: `Critical infrastructure with ID '${id}' not found.`,
      availableIds: GANJAM_P8_INFRASTRUCTURE.map((i) => i.id),
    });
  }

  const impact = GANJAM_P8_IMPACTS.find((imp) => imp.infrastructureId === match.id) || null;

  res.status(200).json({
    success: true,
    data: {
      ...match,
      impact,
    },
    provenance: 'DEMO INFRASTRUCTURE INVENTORY',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/infrastructure/impacts
 */
exports.getInfrastructureImpacts = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_IMPACTS,
    atRiskCount: GANJAM_P8_IMPACTS.filter((i) => i.impactScore >= 50).length,
    criticalAccessBlockedCount: GANJAM_P8_IMPACTS.filter((i) => i.accessRisk === 'CRITICAL').length,
    provenance: 'MODELLED INFRASTRUCTURE IMPACT',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/vulnerability
 */
exports.getVulnerability = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      zones: GANJAM_P8_ZONE_PRIORITIES,
      infrastructure: GANJAM_P8_IMPACTS,
      provenance: 'MODELLED VULNERABILITY SCORE',
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/vulnerability/zones
 */
exports.getVulnerabilityZones = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_ZONE_PRIORITIES,
    provenance: 'MODELLED VULNERABILITY SCORE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/vulnerability/priority
 */
exports.getVulnerabilityPriority = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P8_ZONE_PRIORITIES,
    provenance: 'DETERMINISTIC PRIORITY SCORE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/exposure/recompute
 */
exports.postRecomputeExposure = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Population exposure recomputed successfully.',
    recomputedAt: new Date().toISOString(),
    totalExposedPopulation: 8900,
    totalVulnerablePopulation: 3100,
    provenance: 'MODELLED EXPOSURE',
  });
};

/**
 * POST /api/vulnerability/recompute
 */
exports.postRecomputeVulnerability = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vulnerability and zone priority recomputed successfully.',
    recomputedAt: new Date().toISOString(),
    topPriorityZone: GANJAM_P8_ZONE_PRIORITIES[0],
    provenance: 'DETERMINISTIC PRIORITY SCORE',
  });
};

/**
 * =========================================================================
 * PHASE 9 — RESOURCE ALLOCATION, EVACUATION OPTIMIZATION & OPERATIONAL PLAN
 * =========================================================================
 */

const GANJAM_P9_RESOURCES = [
  {
    id: 'RU-01',
    name: 'Gopalpur Water Rescue',
    type: 'BOAT',
    location: { lat: 19.268, lng: 84.912, name: 'Gopalpur Coastal Base' },
    capacity: 12,
    availableCapacity: 12,
    capabilities: ['WATER_RESCUE', 'SEARCH'],
    status: 'AVAILABLE',
    operatingRange: 30,
    responseTime: 18,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RU-02',
    name: 'Aska Boat Unit',
    type: 'BOAT',
    location: { lat: 19.610, lng: 84.665, name: 'Aska River Base' },
    capacity: 16,
    availableCapacity: 16,
    capabilities: ['WATER_RESCUE', 'EVACUATION'],
    status: 'AVAILABLE',
    operatingRange: 30,
    responseTime: 14,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RU-03',
    name: 'Brahmapur Medical Response (EMS)',
    type: 'AMBULANCE',
    location: { lat: 19.312, lng: 84.792, name: 'MKCG Medical Base' },
    capacity: 4,
    availableCapacity: 4,
    capabilities: ['MEDICAL', 'EVACUATION'],
    status: 'AVAILABLE',
    operatingRange: 50,
    responseTime: 15,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RU-04',
    name: 'District Supply Vehicle',
    type: 'SUPPLY_VEHICLE',
    location: { lat: 19.350, lng: 84.985, name: 'Chhatrapur Supply Depot' },
    capacity: 30,
    availableCapacity: 30,
    capabilities: ['SUPPLIES'],
    status: 'AVAILABLE',
    operatingRange: 65,
    responseTime: 20,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RU-05',
    name: 'Fire & Rescue Team',
    type: 'FIRE_TEAM',
    location: { lat: 19.320, lng: 84.805, name: 'Brahmapur Fire Station' },
    capacity: 18,
    availableCapacity: 18,
    capabilities: ['FIRE_RESPONSE', 'SEARCH', 'EVACUATION'],
    status: 'AVAILABLE',
    operatingRange: 45,
    responseTime: 16,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RES-MED-01',
    name: 'MKCG Mobile Trauma Team',
    type: 'MEDICAL_TEAM',
    location: { lat: 19.312, lng: 84.792, name: 'MKCG Medical College' },
    capacity: 8,
    availableCapacity: 8,
    capabilities: ['MEDICAL', 'TRAUMA_CARE'],
    status: 'AVAILABLE',
    operatingRange: 50,
    responseTime: 15,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RES-TANK-01',
    name: 'Chhatrapur Water Tanker 01',
    type: 'WATER_TANKER',
    location: { lat: 19.355, lng: 84.990, name: 'Chhatrapur Municipal Yard' },
    capacity: 5000,
    availableCapacity: 5000,
    capabilities: ['SUPPLIES', 'DRINKING_WATER'],
    status: 'AVAILABLE',
    operatingRange: 70,
    responseTime: 22,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RES-PUMP-01',
    name: 'Aska Dewatering High-Volume Pump',
    type: 'PUMP',
    location: { lat: 19.612, lng: 84.658, name: 'Aska Irrigation Office' },
    capacity: 2500,
    availableCapacity: 2500,
    capabilities: ['INFRASTRUCTURE_PROTECTION', 'DEWATERING'],
    status: 'AVAILABLE',
    operatingRange: 20,
    responseTime: 12,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
  {
    id: 'RES-SUP-02',
    name: 'Brahmapur Relief Cargo Truck',
    type: 'SUPPLY_VEHICLE',
    location: { lat: 19.318, lng: 84.802, name: 'Brahmapur Civil Supplies Depot' },
    capacity: 40,
    availableCapacity: 40,
    capabilities: ['SUPPLIES', 'FOOD'],
    status: 'AVAILABLE',
    operatingRange: 80,
    responseTime: 20,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  },
];

const GANJAM_P9_MISSIONS = [
  {
    id: 'MIS-CRIT-01',
    incidentId: 'SOS-003',
    zoneId: 'ZONE-GANJAM-02',
    missionType: 'WATER_RESCUE',
    priority: 98,
    priorityClass: 'IMMEDIATE',
    assignedResources: ['RU-02'],
    destination: { lat: 19.610, lng: 84.665, name: 'Aska Lowlands' },
    requiredCapacity: 16,
    completedCapacity: 16,
    status: 'ASSIGNED',
    estimatedETA: 14,
    rationale: 'Extract 16 trapped individuals in Aska flood sector. Boat unit RU-02 selected.',
    provenance: 'MODELLED OPERATIONAL PLAN',
  },
  {
    id: 'MIS-CRIT-02',
    zoneId: 'ZONE-GANJAM-02',
    missionType: 'EVACUATION',
    priority: 96,
    priorityClass: 'IMMEDIATE',
    assignedResources: ['RU-01', 'RU-05'],
    destination: { lat: 19.352, lng: 84.988, name: 'Chhatrapur Shelter SH-02' },
    requiredCapacity: 18,
    completedCapacity: 18,
    status: 'ASSIGNED',
    estimatedETA: 16,
    rationale: 'Batch 1 Evacuation: Transfer mobility-limited and elderly residents via safe detour.',
    provenance: 'MODELLED OPERATIONAL PLAN',
  },
  {
    id: 'MIS-CRIT-03',
    zoneId: 'INFRA-HOSP-01',
    missionType: 'MEDICAL_ACCESS',
    priority: 91,
    priorityClass: 'URGENT',
    assignedResources: ['RU-03', 'RES-MED-01'],
    destination: { lat: 19.610, lng: 84.654, name: 'Aska Sub-Divisional Hospital' },
    requiredCapacity: 8,
    completedCapacity: 8,
    status: 'ASSIGNED',
    estimatedETA: 15,
    rationale: 'Secure alternate medical transport corridor and deliver emergency trauma kits.',
    provenance: 'MODELLED OPERATIONAL PLAN',
  },
  {
    id: 'MIS-CRIT-04',
    zoneId: 'INFRA-SHELTER-04',
    missionType: 'SHELTER_SUPPORT',
    priority: 89,
    priorityClass: 'URGENT',
    assignedResources: ['RU-05'],
    destination: { lat: 19.260, lng: 84.910, name: 'Gopalpur Coastal Shelter' },
    requiredCapacity: 10,
    completedCapacity: 10,
    status: 'ASSIGNED',
    estimatedETA: 18,
    rationale: 'Enforce perimeter closure of surge-compromised SH-04; divert incoming buses to SH-02.',
    provenance: 'MODELLED OPERATIONAL PLAN',
  },
  {
    id: 'MIS-CRIT-05',
    zoneId: 'ZONE-GANJAM-02',
    missionType: 'SUPPLY_DELIVERY',
    priority: 78,
    priorityClass: 'HIGH',
    assignedResources: ['RU-04'],
    destination: { lat: 19.610, lng: 84.660, name: 'Aska Staging Post' },
    requiredCapacity: 25,
    completedCapacity: 25,
    status: 'ASSIGNED',
    estimatedETA: 20,
    rationale: 'Deliver drinking water and rations to Aska high-ground staging post.',
    provenance: 'MODELLED OPERATIONAL PLAN',
  },
];

const GANJAM_P9_EVACUATION = {
  id: 'EVAC-ASKA-CRITICAL',
  zoneId: 'ZONE-GANJAM-02',
  sourcePopulation: 7200,
  vulnerablePopulation: 2600,
  destinationShelter: 'SH-02',
  requiredCapacity: 2600,
  allocatedCapacity: 2600,
  remainingPopulation: 0,
  route: 'Safe Detour via SH-36 Bypass (+1.5 km, 14 min ETA)',
  priority: 96,
  status: 'IN_PROGRESS',
  shelterAllocations: [
    { shelterId: 'SH-02', name: 'Chhatrapur Multi-Purpose Shelter', allocated: 1060, elevationMeters: 28 },
    { shelterId: 'SH-03', name: 'Hinjilicut High School Shelter', allocated: 900, elevationMeters: 22 },
    { shelterId: 'SH-05', name: 'Digapahandi Community Hall', allocated: 640, elevationMeters: 35 },
  ],
  batches: [
    { batchNumber: 1, targetGroup: 'Mobility-Limited Residents', count: 530, priority: 98, status: 'IMMEDIATE' },
    { batchNumber: 2, targetGroup: 'Elderly and Children', count: 2070, priority: 94, status: 'URGENT' },
    { batchNumber: 3, targetGroup: 'Low-Lying Inundated Households', count: 1500, priority: 84, status: 'HIGH' },
    { batchNumber: 4, targetGroup: 'General Buffer Population', count: 3100, priority: 65, status: 'PLANNED' },
  ],
  provenance: 'MODELLED EVACUATION PRIORITY',
};

const GANJAM_P9_SUPPLIES = [
  { id: 'SUP-01', type: 'DRINKING_WATER', requiredQuantity: 15000, allocatedQuantity: 15000, unit: 'Liters', priority: 92, status: 'ALLOCATED' },
  { id: 'SUP-02', type: 'MEDICAL_KIT', requiredQuantity: 104, allocatedQuantity: 104, unit: 'Kits', priority: 95, status: 'ALLOCATED' },
  { id: 'SUP-03', type: 'LIFE_JACKET', requiredQuantity: 3000, allocatedQuantity: 3000, unit: 'Units', priority: 90, status: 'ALLOCATED' },
  { id: 'SUP-04', type: 'FOOD', requiredQuantity: 10000, allocatedQuantity: 10000, unit: 'Packs', priority: 80, status: 'ALLOCATED' },
  { id: 'SUP-05', type: 'EMERGENCY_POWER', requiredQuantity: 4, allocatedQuantity: 4, unit: 'Generators', priority: 88, status: 'ALLOCATED' },
];

/**
 * GET /api/resources
 */
exports.getResources = async (req, res) => {
  res.status(200).json({
    success: true,
    source: 'MODELLED_OPERATIONAL_CAPACITY',
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    count: GANJAM_P9_RESOURCES.length,
    data: GANJAM_P9_RESOURCES,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/resources/:id
 */
exports.getResourceById = async (req, res) => {
  const match = GANJAM_P9_RESOURCES.find((r) => r.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }
  res.status(200).json({
    success: true,
    data: match,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/resources/availability
 */
exports.getResourceAvailability = async (req, res) => {
  const available = GANJAM_P9_RESOURCES.filter((r) => r.status === 'AVAILABLE');
  res.status(200).json({
    success: true,
    totalCount: GANJAM_P9_RESOURCES.length,
    availableCount: available.length,
    assignedCount: GANJAM_P9_RESOURCES.length - available.length,
    resources: GANJAM_P9_RESOURCES,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/missions
 */
exports.getMissions = async (req, res) => {
  res.status(200).json({
    success: true,
    count: GANJAM_P9_MISSIONS.length,
    source: 'MODELLED_OPERATIONAL_PLAN',
    provenance: 'MODELLED OPERATIONAL PLAN',
    data: GANJAM_P9_MISSIONS,
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/missions/:id
 */
exports.getMissionById = async (req, res) => {
  const match = GANJAM_P9_MISSIONS.find((m) => m.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Mission not found' });
  }
  res.status(200).json({
    success: true,
    data: match,
    provenance: 'MODELLED OPERATIONAL PLAN',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/missions/priority
 */
exports.getMissionsPriority = async (req, res) => {
  const sorted = [...GANJAM_P9_MISSIONS].sort((a, b) => b.priority - a.priority);
  res.status(200).json({
    success: true,
    count: sorted.length,
    data: sorted,
    provenance: 'MODELLED OPERATIONAL PLAN',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/allocation
 */
exports.getAllocation = async (req, res) => {
  res.status(200).json({
    success: true,
    missions: GANJAM_P9_MISSIONS,
    resources: GANJAM_P9_RESOURCES,
    shelters: GANJAM_P9_EVACUATION.shelterAllocations,
    supplies: GANJAM_P9_SUPPLIES,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/allocation/resources
 */
exports.getAllocationResources = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P9_RESOURCES,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/allocation/shelters
 */
exports.getAllocationShelters = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P9_EVACUATION.shelterAllocations,
    totalAllocated: 2600,
    rejectedShelter: { shelterId: 'SH-04', reason: 'Surge risk 92% — DO NOT ROUTE' },
    provenance: 'MODELLED EVACUATION PRIORITY',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/allocation/supplies
 */
exports.getAllocationSupplies = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P9_SUPPLIES,
    provenance: 'MODELLED OPERATIONAL ASSUMPTION',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/evacuation
 */
exports.getEvacuation = async (req, res) => {
  res.status(200).json({
    success: true,
    data: GANJAM_P9_EVACUATION,
    provenance: 'MODELLED EVACUATION PRIORITY',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/evacuation/:zoneId
 */
exports.getEvacuationByZone = async (req, res) => {
  res.status(200).json({
    success: true,
    zoneId: req.params.zoneId || 'ZONE-GANJAM-02',
    data: GANJAM_P9_EVACUATION,
    provenance: 'MODELLED EVACUATION PRIORITY',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/operational-plan
 */
exports.getOperationalPlan = async (req, res) => {
  res.status(200).json({
    success: true,
    scenario: req.query.scenario || 'CRITICAL_OPERATION',
    data: {
      missions: GANJAM_P9_MISSIONS,
      evacuation: GANJAM_P9_EVACUATION,
      resources: GANJAM_P9_RESOURCES,
      supplies: GANJAM_P9_SUPPLIES,
      assumptions: [
        'Drinking water baseline: 2 Liters per person per day (MODELLED OPERATIONAL ASSUMPTION)',
        'Shelter reception prioritizes high-ground inland structures (SH-02, SH-03, SH-05)',
      ],
    },
    provenance: 'MODELLED OPERATIONAL PLAN',
    timestamp: new Date().toISOString(),
  });
};

/**
 * GET /api/operational-plan/timeline
 */
exports.getOperationalPlanTimeline = async (req, res) => {
  res.status(200).json({
    success: true,
    scenario: 'CRITICAL_OPERATION',
    stages: [
      { step: 1, timeOffset: 'T+00 min', event: 'Risk Escalation Detected', status: 'COMPLETED' },
      { step: 2, timeOffset: 'T+05 min', event: 'Critical Zone & Vulnerability Identified', status: 'COMPLETED' },
      { step: 3, timeOffset: 'T+08 min', event: 'RU-02 Boat Fleet Pre-Positioned', status: 'ACTIVE' },
      { step: 4, timeOffset: 'T+12 min', event: 'Evacuation Batch 1 Begins', status: 'IN_PROGRESS' },
      { step: 5, timeOffset: 'T+15 min', event: 'SH-36 Closed & Detour Activated', status: 'SCHEDULED' },
      { step: 6, timeOffset: 'T+20 min', event: 'Hospital Alternate Access Corridor Secured', status: 'SCHEDULED' },
      { step: 7, timeOffset: 'T+25 min', event: 'Chhatrapur Shelter SH-02 Receives Evacuees', status: 'SCHEDULED' },
    ],
    provenance: 'MODELLED RESPONSE TIMELINE',
    timestamp: new Date().toISOString(),
  });
};

/**
 * POST /api/allocation/recompute
 */
exports.postRecomputeAllocation = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Resource allocations recomputed successfully.',
    recomputedAt: new Date().toISOString(),
    assignedCount: GANJAM_P9_MISSIONS.length,
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
  });
};

/**
 * POST /api/evacuation/recompute
 */
exports.postRecomputeEvacuation = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Evacuation plan recomputed successfully.',
    recomputedAt: new Date().toISOString(),
    allocatedCapacity: 2600,
    provenance: 'MODELLED EVACUATION PRIORITY',
  });
};

/**
 * POST /api/operational-plan/recompute
 */
exports.postRecomputeOperationalPlan = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Operational plan recomputed successfully.',
    recomputedAt: new Date().toISOString(),
    priorityMissions: GANJAM_P9_MISSIONS,
    provenance: 'MODELLED OPERATIONAL PLAN',
  });
};

/**
 * POST /api/resources/:id/assign
 */
exports.postAssignResource = async (req, res) => {
  const match = GANJAM_P9_RESOURCES.find((r) => r.id === req.params.id);
  if (!match) {
    return res.status(404).json({ success: false, error: 'Resource not found' });
  }
  const assignment = req.body.assignment || 'MIS-CRIT-01';
  res.status(200).json({
    success: true,
    message: `Resource ${match.id} assigned to ${assignment}`,
    resource: {
      ...match,
      status: 'ASSIGNED',
      currentAssignment: assignment,
    },
    provenance: 'DETERMINISTIC RESOURCE ALLOCATION',
    timestamp: new Date().toISOString(),
  });
};





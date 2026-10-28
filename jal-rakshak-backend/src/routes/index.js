const express = require('express');
const authRoutes = require('./auth');
const floodRoutes = require('./flood');
const gisRoutes = require('./gis');
const shelterRoutes = require('./shelters');
const reportRoutes = require('./reports');
const emergencyRoutes = require('./emergency');
const rescueRoutes = require('./rescue');
const assistantRoutes = require('./assistant');
const alertRoutes = require('./alerts');
const adminRoutes = require('./admin');
const dashboardRoutes = require('./dashboard');

const { chat } = require('../controllers/assistantController');
const { analyzeImage } = require('../controllers/reportController');
const { uploadSingleImage } = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Mount standard API v1 routes
router.use('/v1/auth', authRoutes);
router.use('/v1/flood', floodRoutes);
router.use('/v1/dashboard', dashboardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/v1/gis', gisRoutes);
router.use('/v1/shelters', shelterRoutes);
router.use('/v1/reports', reportRoutes);
router.use('/v1/emergency', emergencyRoutes);
router.use('/v1/rescue', rescueRoutes);
router.use('/v1/assistant', assistantRoutes);
router.use('/v1/alerts', alertRoutes);
router.use('/v1/admin', adminRoutes);

// Ganjam Disaster Intelligence Unified Contracts (10_API_CONTRACTS.md)
const {
  getUnifiedDashboard,
  getWeather,
  getWeatherForecast,
  getRisk,
  getFloodPrediction,
  getRiskGrid,
  getIncidents,
  getCitizenReports,
  getCitizenEvidence,
  getCitizenEvidenceById,
  postRecomputeRisk,
  getResponseUnits,
  getCanonicalIncidents,
  getCanonicalIncidentById,
  getDispatch,
  getDecisions,
  getRoutes,
  getEvaluatedShelters,
  postRecomputeDispatch,
  getSatelliteObservation,
  getSatelliteObservations,
  getSatelliteObservationById,
  getSatelliteFusion,
  postVerifySatellite,
  postRecomputeSatellite,
  getCycloneObservation,
  getCycloneObservations,
  getCycloneObservationById,
  getCycloneTrack,
  getCycloneRisk,
  getCycloneFusion,
  postRecomputeCyclone,
  postCycloneScenario,
  getExposure,
  getExposurePopulation,
  getExposureVulnerability,
  getExposureZones,
  postRecomputeExposure,
  getInfrastructure,
  getInfrastructureById,
  getInfrastructureImpacts,
  getVulnerability,
  getVulnerabilityZones,
  getVulnerabilityPriority,
  postRecomputeVulnerability,
  getResources,
  getResourceById,
  getResourceAvailability,
  getMissions,
  getMissionById,
  getMissionsPriority,
  getAllocation,
  getAllocationResources,
  getAllocationShelters,
  getAllocationSupplies,
  getEvacuation,
  getEvacuationByZone,
  getOperationalPlan,
  getOperationalPlanTimeline,
  postRecomputeAllocation,
  postRecomputeEvacuation,
  postRecomputeOperationalPlan,
  postAssignResource,
} = require('../controllers/ganjamController');

router.get('/dashboard', getUnifiedDashboard);
router.get('/v1/dashboard/overview', getUnifiedDashboard);
router.get('/weather/forecast', getWeatherForecast);
router.get('/v1/weather/forecast', getWeatherForecast);
router.get('/weather', getWeather);
router.get('/v1/weather', getWeather);
router.get('/risk/grid', getRiskGrid);
router.get('/v1/risk/grid', getRiskGrid);
router.get('/risk', getRisk);
router.get('/v1/risk', getRisk);
router.get('/flood', getFloodPrediction);
router.get('/v1/flood', getFloodPrediction);
router.get('/incidents', getCanonicalIncidents);
router.get('/v1/incidents', getCanonicalIncidents);
router.get(['/incidents/:id', '/v1/incidents/:id'], getCanonicalIncidentById);

// Phase 4 Citizen Intelligence & Ground Evidence Contracts
router.get(['/citizen/reports', '/v1/citizen/reports'], getCitizenReports);
router.get(['/citizen/evidence', '/v1/citizen/evidence'], getCitizenEvidence);
router.get(['/citizen/evidence/:id', '/v1/citizen/evidence/:id'], getCitizenEvidenceById);
router.post(['/risk/recompute', '/v1/risk/recompute'], postRecomputeRisk);

// Phase 5 Rescue Orchestration & Dispatch Intelligence Contracts
router.get(['/response-units', '/v1/response-units'], getResponseUnits);
router.get(['/dispatch', '/v1/dispatch'], getDispatch);
router.post(['/dispatch/recompute', '/v1/dispatch/recompute'], postRecomputeDispatch);
router.get(['/decisions', '/v1/decisions'], getDecisions);
router.post(['/decisions/recompute', '/v1/decisions/recompute'], postRecomputeDispatch);
router.get(['/routes', '/v1/routes'], getRoutes);
router.get(['/shelters', '/v1/shelters/evaluated'], getEvaluatedShelters);

// Phase 6 Earth Observation + Satellite Verification Contracts
router.get(['/satellite', '/v1/satellite'], getSatelliteObservation);
router.get(['/satellite/observations', '/v1/satellite/observations'], getSatelliteObservations);
router.get(['/satellite/fusion', '/v1/satellite/fusion'], getSatelliteFusion);
router.get(['/satellite/:id', '/v1/satellite/:id'], getSatelliteObservationById);
router.post(['/satellite/verify', '/v1/satellite/verify'], postVerifySatellite);
router.post(['/satellite/recompute', '/v1/satellite/recompute'], postRecomputeSatellite);

// Phase 7 Cyclone Intelligence + Bay of Bengal Track Contracts
router.get(['/cyclone', '/v1/cyclone'], getCycloneObservation);
router.get(['/cyclone/observations', '/v1/cyclone/observations'], getCycloneObservations);
router.get(['/cyclone/track', '/v1/cyclone/track'], getCycloneTrack);
router.get(['/cyclone/risk', '/v1/cyclone/risk'], getCycloneRisk);
router.get(['/cyclone/fusion', '/v1/cyclone/fusion'], getCycloneFusion);
router.get(['/cyclone/:id', '/v1/cyclone/:id'], getCycloneObservationById);
router.post(['/cyclone/recompute', '/v1/cyclone/recompute'], postRecomputeCyclone);
router.post(['/cyclone/scenario', '/v1/cyclone/scenario'], postCycloneScenario);

// Phase 8 Population Exposure, Vulnerability & Critical Infrastructure Contracts
router.get(['/exposure', '/v1/exposure'], getExposure);
router.get(['/exposure/population', '/v1/exposure/population'], getExposurePopulation);
router.get(['/exposure/vulnerability', '/v1/exposure/vulnerability'], getExposureVulnerability);
router.get(['/exposure/zones', '/v1/exposure/zones'], getExposureZones);
router.post(['/exposure/recompute', '/v1/exposure/recompute'], postRecomputeExposure);

router.get(['/infrastructure', '/v1/infrastructure'], getInfrastructure);
router.get(['/infrastructure/impacts', '/v1/infrastructure/impacts'], getInfrastructureImpacts);
router.get(['/infrastructure/:id', '/v1/infrastructure/:id'], getInfrastructureById);

router.get(['/vulnerability', '/v1/vulnerability'], getVulnerability);
router.get(['/vulnerability/zones', '/v1/vulnerability/zones'], getVulnerabilityZones);
router.get(['/vulnerability/priority', '/v1/vulnerability/priority'], getVulnerabilityPriority);
router.post(['/vulnerability/recompute', '/v1/vulnerability/recompute'], postRecomputeVulnerability);

// Phase 9 Operational Planning, Resource Allocation & Evacuation Contracts
router.get(['/resources', '/v1/resources'], getResources);
router.get(['/resources/availability', '/v1/resources/availability'], getResourceAvailability);
router.get(['/resources/:id', '/v1/resources/:id'], getResourceById);
router.post(['/resources/:id/assign', '/v1/resources/:id/assign'], postAssignResource);

router.get(['/missions', '/v1/missions'], getMissions);
router.get(['/missions/priority', '/v1/missions/priority'], getMissionsPriority);
router.get(['/missions/:id', '/v1/missions/:id'], getMissionById);

router.get(['/allocation', '/v1/allocation'], getAllocation);
router.get(['/allocation/resources', '/v1/allocation/resources'], getAllocationResources);
router.get(['/allocation/shelters', '/v1/allocation/shelters'], getAllocationShelters);
router.get(['/allocation/supplies', '/v1/allocation/supplies'], getAllocationSupplies);
router.post(['/allocation/recompute', '/v1/allocation/recompute'], postRecomputeAllocation);

router.get(['/evacuation', '/v1/evacuation'], getEvacuation);
router.get(['/evacuation/:zoneId', '/v1/evacuation/:zoneId'], getEvacuationByZone);
router.post(['/evacuation/recompute', '/v1/evacuation/recompute'], postRecomputeEvacuation);

router.get(['/operational-plan', '/v1/operational-plan'], getOperationalPlan);
router.get(['/operational-plan/timeline', '/v1/operational-plan/timeline'], getOperationalPlanTimeline);
router.post(['/operational-plan/recompute', '/v1/operational-plan/recompute'], postRecomputeOperationalPlan);

// Direct aliases for seamless compatibility
router.post('/v1/images/analyze', uploadSingleImage, analyzeImage);
router.post('/chat', optionalAuth, chat);

// Health check endpoints (/api/v1/health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jal Rakshak Disaster Intelligence API is operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    version: '2.0.0',
  });
};

router.get('/v1/health', healthHandler);
router.get('/health', healthHandler);

// Unified System Health Check (/api/v1/system/health)
router.get(['/v1/system/health', '/system/health'], async (req, res) => {
  const { aiService } = require('../services');
  let aiHealth = { status: 'unavailable', service: 'jal-rakshak-ai' };
  try {
    const aiData = await aiService.health();
    aiHealth = aiData || { status: 'healthy', service: 'jal-rakshak-ai' };
  } catch (err) {
    aiHealth = { status: 'unavailable', service: 'jal-rakshak-ai', error: err.message };
  }

  res.status(200).json({
    success: true,
    data: {
      express: {
        status: 'healthy',
        service: 'jal-rakshak-express-backend',
      },
      aiService: aiHealth,
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;

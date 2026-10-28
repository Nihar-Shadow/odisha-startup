/**
 * Phase 9 Backend API Verification Script — PS-074 Ganjam Disaster Intelligence
 * Tests all Phase 9 Operational Planning, Resource Allocation & Evacuation HTTP Endpoints
 */

const http = require('http');
const express = require('express');
const routes = require('./src/routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

const server = http.createServer(app);

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const reqOptions = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log('=================================================================');
  console.log(`🧪 PS-074 PHASE 9 BACKEND API VERIFICATION (Port: ${port})`);
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failedCount++;
    }
  }

  try {
    // 1. GET /api/resources
    const resResources = await request('/api/resources');
    assert(resResources.status === 200, 'GET /api/resources returns 200 OK');
    assert(resResources.body.success === true, 'GET /api/resources body.success is true');
    assert(resResources.body.data.length >= 8, 'GET /api/resources returns all modelled fleet assets');
    assert(resResources.body.provenance === 'DETERMINISTIC RESOURCE ALLOCATION', 'Explicit provenance on /api/resources');

    // 2. GET /api/resources/availability
    const resAvail = await request('/api/resources/availability');
    assert(resAvail.status === 200, 'GET /api/resources/availability returns 200 OK');
    assert(resAvail.body.availableCount >= 5, 'GET /api/resources/availability reports available count');

    // 3. GET /api/resources/:id
    const resUnit = await request('/api/resources/RU-02');
    assert(resUnit.status === 200, 'GET /api/resources/:id returns 200 OK for RU-02');
    assert(resUnit.body.data.name === 'Aska Boat Unit', 'Returns Aska Boat Unit record');
    assert(resUnit.body.data.capacity === 16, 'RU-02 capacity is 16');

    // 4. POST /api/resources/:id/assign
    const resAssign = await request('/api/resources/RU-02/assign', {
      method: 'POST',
      body: { assignment: 'MIS-CRIT-01' },
    });
    assert(resAssign.status === 200, 'POST /api/resources/:id/assign returns 200 OK');
    assert(resAssign.body.resource.currentAssignment === 'MIS-CRIT-01', 'Assignment updated correctly');

    // 5. GET /api/missions
    const resMissions = await request('/api/missions');
    assert(resMissions.status === 200, 'GET /api/missions returns 200 OK');
    assert(resMissions.body.count >= 5, 'GET /api/missions returns all operational missions');
    assert(resMissions.body.provenance === 'MODELLED OPERATIONAL PLAN', 'Explicit provenance on /api/missions');

    // 6. GET /api/missions/priority
    const resPrio = await request('/api/missions/priority');
    assert(resPrio.status === 200, 'GET /api/missions/priority returns 200 OK');
    assert(resPrio.body.data[0].priority >= resPrio.body.data[1].priority, 'Missions sorted descending by priority');

    // 7. GET /api/missions/:id
    const resMisId = await request('/api/missions/MIS-CRIT-01');
    assert(resMisId.status === 200, 'GET /api/missions/:id returns 200 OK');
    assert(resMisId.body.data.priority === 98, 'MIS-CRIT-01 has priority 98 (IMMEDIATE)');

    // 8. GET /api/allocation
    const resAlloc = await request('/api/allocation');
    assert(resAlloc.status === 200, 'GET /api/allocation returns 200 OK');
    assert(Array.isArray(resAlloc.body.missions), 'GET /api/allocation contains missions');
    assert(Array.isArray(resAlloc.body.resources), 'GET /api/allocation contains resources');

    // 9. GET /api/allocation/resources
    const resAllocRes = await request('/api/allocation/resources');
    assert(resAllocRes.status === 200, 'GET /api/allocation/resources returns 200 OK');
    assert(resAllocRes.body.data.length >= 8, 'Returns full resource pool');

    // 10. GET /api/allocation/shelters
    const resAllocSh = await request('/api/allocation/shelters');
    assert(resAllocSh.status === 200, 'GET /api/allocation/shelters returns 200 OK');
    assert(resAllocSh.body.totalAllocated === 2600, 'Allocated 2,600 slots across safe shelters');
    assert(resAllocSh.body.rejectedShelter.shelterId === 'SH-04', 'Surge shelter SH-04 explicitly rejected');

    // 11. GET /api/allocation/supplies
    const resAllocSup = await request('/api/allocation/supplies');
    assert(resAllocSup.status === 200, 'GET /api/allocation/supplies returns 200 OK');
    assert(resAllocSup.body.provenance === 'MODELLED OPERATIONAL ASSUMPTION', 'Supplies have MODELLED OPERATIONAL ASSUMPTION provenance');

    // 12. POST /api/allocation/recompute
    const resAllocRecomp = await request('/api/allocation/recompute', { method: 'POST' });
    assert(resAllocRecomp.status === 200, 'POST /api/allocation/recompute returns 200 OK');

    // 13. GET /api/evacuation
    const resEvac = await request('/api/evacuation');
    assert(resEvac.status === 200, 'GET /api/evacuation returns 200 OK');
    assert(resEvac.body.data.vulnerablePopulation === 2600, 'Target vulnerable population 2,600');
    assert(resEvac.body.data.batches.length === 4, 'Includes 4 prioritized evacuation batches');

    // 14. GET /api/evacuation/:zoneId
    const resEvacZone = await request('/api/evacuation/ZONE-GANJAM-02');
    assert(resEvacZone.status === 200, 'GET /api/evacuation/:zoneId returns 200 OK');
    assert(resEvacZone.body.data.route.includes('Safe Detour'), 'Safe detour route assigned');

    // 15. POST /api/evacuation/recompute
    const resEvacRecomp = await request('/api/evacuation/recompute', { method: 'POST' });
    assert(resEvacRecomp.status === 200, 'POST /api/evacuation/recompute returns 200 OK');

    // 16. GET /api/operational-plan
    const resOpPlan = await request('/api/operational-plan');
    assert(resOpPlan.status === 200, 'GET /api/operational-plan returns 200 OK');
    assert(resOpPlan.body.provenance === 'MODELLED OPERATIONAL PLAN', 'Operational plan carries explicit provenance');
    assert(resOpPlan.body.data.assumptions.length >= 2, 'Operational plan includes transparent assumptions');

    // 17. GET /api/operational-plan/timeline
    const resTimeline = await request('/api/operational-plan/timeline');
    assert(resTimeline.status === 200, 'GET /api/operational-plan/timeline returns 200 OK');
    assert(resTimeline.body.stages.length === 7, 'Timeline contains 7 sequential milestones');
    assert(resTimeline.body.stages[0].timeOffset === 'T+00 min', 'Milestone starts at T+00 min');

    // 18. POST /api/operational-plan/recompute
    const resOpRecomp = await request('/api/operational-plan/recompute', { method: 'POST' });
    assert(resOpRecomp.status === 200, 'POST /api/operational-plan/recompute returns 200 OK');

    // 19. Regression Check: Existing endpoints continue functioning
    const resDecisions = await request('/api/decisions');
    assert(resDecisions.status === 200, 'GET /api/decisions continues to operate seamlessly');
    const resVuln = await request('/api/vulnerability');
    assert(resVuln.status === 200, 'GET /api/vulnerability continues to operate seamlessly');
    const resCyclone = await request('/api/cyclone');
    assert(resCyclone.status === 200, 'GET /api/cyclone continues to operate seamlessly');

  } catch (err) {
    console.error('Test execution error:', err);
    failedCount++;
  } finally {
    server.close();
  }

  console.log('\n=================================================================');
  console.log(`📊 PHASE 9 BACKEND API RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run();

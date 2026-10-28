/**
 * Phase 5 Backend API Verification Script — PS-074 Ganjam Disaster Intelligence
 * Tests all Phase 5 Rescue Orchestration + Dispatch Intelligence HTTP Endpoints
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
  console.log(`🧪 PS-074 PHASE 5 BACKEND API VERIFICATION (Port: ${port})`);
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failedCount++;
    } else {
      console.log(`✅ PASS: ${message}`);
      passedCount++;
    }
  }

  try {
    // 1. GET /api/response-units
    const resUnits = await request('/api/response-units');
    assert(resUnits.status === 200, 'GET /api/response-units returns HTTP 200');
    assert(resUnits.body.success === true, 'Response units success flag is true');
    assert(Array.isArray(resUnits.body.data) && resUnits.body.data.length === 5, 'Returns 5 modelled response units');
    assert(resUnits.body.source === 'MODELLED_RESPONSE_CAPACITY', 'Response units source labelled MODELLED_RESPONSE_CAPACITY');

    // 2. GET /api/incidents
    const resIncidents = await request('/api/incidents');
    assert(resIncidents.status === 200, 'GET /api/incidents returns HTTP 200');
    assert(resIncidents.body.success === true, 'Incidents success flag is true');
    assert(Array.isArray(resIncidents.body.data) && resIncidents.body.data.length >= 4, 'Returns canonical Ganjam incidents');

    // 3. GET /api/incidents/:id (Valid ID)
    const resSos = await request('/api/incidents/SOS-003');
    assert(resSos.status === 200, 'GET /api/incidents/SOS-003 returns HTTP 200');
    assert(resSos.body.data.priority === 'CRITICAL', 'SOS-003 priority is CRITICAL');
    assert(resSos.body.data.priorityScore === 96, 'SOS-003 priority score is 96');
    assert(resSos.body.data.assignedUnitId === 'RU-02', 'SOS-003 assigned unit is RU-02');

    // 4. GET /api/incidents/:id (Invalid ID 404 test)
    const resInvalid = await request('/api/incidents/INVALID-999');
    assert(resInvalid.status === 404, 'GET /api/incidents/INVALID-999 returns HTTP 404');
    assert(resInvalid.body.success === false, 'Invalid incident returns success: false');

    // 5. GET /api/dispatch (Default Critical SOS Dispatch)
    const resDispatch = await request('/api/dispatch');
    assert(resDispatch.status === 200, 'GET /api/dispatch returns HTTP 200');
    assert(resDispatch.body.incidentId === 'SOS-003', 'Dispatch targets SOS-003');
    assert(resDispatch.body.responseUnitId === 'RU-02', 'Dispatch assigns RU-02');
    assert(resDispatch.body.action === 'RESCUE', 'Dispatch action is RESCUE');
    assert(resDispatch.body.etaMinutes === 14, 'Dispatch ETA is 14 minutes');
    assert(resDispatch.body.shelterId === 'SH-02', 'Dispatch recommends Shelter SH-02');
    assert(Array.isArray(resDispatch.body.resources) && resDispatch.body.resources.includes('LIFE_JACKETS'), 'Resources include LIFE_JACKETS');
    assert(Array.isArray(resDispatch.body.rationale) && resDispatch.body.rationale.length >= 4, 'Dispatch includes explainable rationale');

    // 6. GET /api/dispatch?scenario=MONITORING
    const resMon = await request('/api/dispatch?scenario=MONITORING');
    assert(resMon.status === 200, 'GET /api/dispatch?scenario=MONITORING returns HTTP 200');
    assert(resMon.body.action === 'MONITOR', 'Monitoring scenario produces action MONITOR');
    assert(resMon.body.priority === 'LOW', 'Monitoring scenario produces priority LOW');

    // 7. GET /api/decisions
    const resDec = await request('/api/decisions');
    assert(resDec.status === 200, 'GET /api/decisions returns HTTP 200');
    assert(Array.isArray(resDec.body.data) && resDec.body.data.length >= 4, 'Returns decision queue (RESCUE, EVACUATE, ROAD_CAUTION, SUPPLY)');
    assert(resDec.body.data[0].rationale.length >= 4, 'Primary decision has explainable rationale list');

    // 8. GET /api/routes
    const resRoutes = await request('/api/routes');
    assert(resRoutes.status === 200, 'GET /api/routes returns HTTP 200');
    assert(resRoutes.body.data.recommendedRoute.status === 'OPEN', 'Recommended route status is OPEN');
    assert(resRoutes.body.data.recommendedRoute.avoidedSegment === 'SH-36', 'Recommended route avoids SH-36');
    assert(resRoutes.body.data.rejectedRoute.status === 'BLOCKED', 'Rejected route status is BLOCKED');

    // 9. GET /api/shelters
    const resShelters = await request('/api/shelters');
    assert(resShelters.status === 200, 'GET /api/shelters returns HTTP 200');
    assert(resShelters.body.recommendedShelterId === 'SH-02', 'Recommended shelter is SH-02');
    assert(resShelters.body.rejectedShelterId === 'SH-04', 'Rejected shelter is SH-04');

    // 10. POST /api/dispatch/recompute
    const resPostDispatch = await request('/api/dispatch/recompute', {
      method: 'POST',
      body: { scenario: 'CRITICAL_INCIDENT' },
    });
    assert(resPostDispatch.status === 200, 'POST /api/dispatch/recompute returns HTTP 200');
    assert(resPostDispatch.body.recomputedAt !== undefined, 'Recomputed response contains recomputedAt timestamp');
    assert(resPostDispatch.body.responseUnitId === 'RU-02', 'Recomputed dispatch selects RU-02');

    // 11. POST /api/decisions/recompute
    const resPostDec = await request('/api/decisions/recompute', {
      method: 'POST',
      body: { scenario: 'MONITORING' },
    });
    assert(resPostDec.status === 200, 'POST /api/decisions/recompute returns HTTP 200');
    assert(resPostDec.body.action === 'MONITOR', 'Recomputed decisions reflect MONITORING scenario');

  } catch (err) {
    console.error(`💥 Unexpected test failure: ${err.message}`);
    failedCount++;
  } finally {
    server.close();
    console.log('\n-----------------------------------------------------------------');
    console.log(`SUMMARY: ${passedCount} passed, ${failedCount} failed`);
    console.log('-----------------------------------------------------------------');

    if (failedCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL PHASE 5 BACKEND API CONTRACT TESTS PASSED!\n');
      process.exit(0);
    }
  }
}

run();

/**
 * Phase 6 Backend API Verification Script — PS-074 Ganjam Disaster Intelligence
 * Tests all Phase 6 Earth Observation + Satellite Verification HTTP Endpoints
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
  console.log(`🧪 PS-074 PHASE 6 BACKEND API VERIFICATION (Port: ${port})`);
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function check(name, testFn) {
    try {
      await testFn();
      console.log(`✅ PASS: ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${err.message}`);
      failedCount++;
    }
  }

  // 1. GET /api/satellite
  await check('GET /api/satellite returns primary Sentinel-1 SAR observation', async () => {
    const res = await request('/api/satellite');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.success) throw new Error('success not true');
    if (res.body.data.satellite !== 'SENTINEL-1') throw new Error('Not Sentinel-1');
    if (res.body.data.sensor !== 'SAR') throw new Error('Not SAR');
    if (!res.body.data.floodDetected) throw new Error('Flood not detected');
  });

  // 2. GET /api/satellite?scenario=NO_SATELLITE
  await check('GET /api/satellite?scenario=NO_SATELLITE returns UNAVAILABLE status', async () => {
    const res = await request('/api/satellite?scenario=NO_SATELLITE');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.dataStatus !== 'UNAVAILABLE') throw new Error(`Expected UNAVAILABLE, got ${res.body.data.dataStatus}`);
  });

  // 3. GET /api/satellite/observations
  await check('GET /api/satellite/observations returns available sensor list', async () => {
    const res = await request('/api/satellite/observations');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body.data)) throw new Error('data not array');
    if (res.body.count < 2) throw new Error('Expected at least 2 observations');
  });

  // 4. GET /api/satellite/:id
  await check('GET /api/satellite/:id returns single observation by ID', async () => {
    const res = await request('/api/satellite/SAT-S1-GANJAM-001');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.id !== 'SAT-S1-GANJAM-001') throw new Error('ID mismatch');
  });

  // 5. GET /api/satellite/:id (404 test)
  await check('GET /api/satellite/:id returns 404 for invalid ID', async () => {
    const res = await request('/api/satellite/NON_EXISTENT_SAT');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (res.body.success !== false) throw new Error('Expected success: false');
  });

  // 6. GET /api/satellite/fusion (Scenario B: SATELLITE_CONFIRMS)
  await check('GET /api/satellite/fusion returns confirmed multimodal fusion metrics', async () => {
    const res = await request('/api/satellite/fusion');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.canonicalRiskScore !== 81) throw new Error(`Expected canonical risk 81, got ${res.body.data.canonicalRiskScore}`);
    if (res.body.data.affectedAreaKm2 !== 57.0) throw new Error(`Expected area 57.0 km², got ${res.body.data.affectedAreaKm2}`);
    if (res.body.data.affectedPopulation !== 8900) throw new Error(`Expected pop 8900, got ${res.body.data.affectedPopulation}`);
    if (res.body.data.spatialAgreement.overlapRatio !== 0.82) throw new Error('Expected 0.82 overlap');
  });

  // 7. GET /api/satellite/fusion?scenario=EVIDENCE_CONFLICT
  await check('GET /api/satellite/fusion?scenario=EVIDENCE_CONFLICT returns conflict alert', async () => {
    const res = await request('/api/satellite/fusion?scenario=EVIDENCE_CONFLICT');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.canonicalRiskScore !== 74) throw new Error(`Expected risk 74, got ${res.body.data.canonicalRiskScore}`);
    if (!res.body.data.evidenceConflict) throw new Error('Missing evidenceConflict');
    if (res.body.data.evidenceConflict.recommendedAction !== 'MANUAL_REVIEW') throw new Error('Expected MANUAL_REVIEW');
  });

  // 8. POST /api/satellite/verify
  await check('POST /api/satellite/verify runs verification and outputs overlap and risk impact', async () => {
    const res = await request('/api/satellite/verify', {
      method: 'POST',
      body: { scenario: 'SATELLITE_CONFIRMS' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.canonicalRiskScore !== 81) throw new Error('Expected risk 81');
    if (res.body.agreement !== 'CONFIRMED') throw new Error('Expected CONFIRMED');
  });

  // 9. POST /api/satellite/recompute
  await check('POST /api/satellite/recompute recomputes full decision loop', async () => {
    const res = await request('/api/satellite/recompute', {
      method: 'POST',
      body: { scenario: 'SATELLITE_CONFIRMS' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.fusionResult.canonicalRiskScore !== 81) throw new Error('Expected fusion risk 81');
    if (res.body.dispatchUpdate.priorityScore !== 94) throw new Error('Expected priority 94');
    if (res.body.dispatchUpdate.recommendedUnit !== 'RU-02 (Aska Boat Unit)') throw new Error('Unit mismatch');
  });

  // 10. GET /api/v1/satellite alias
  await check('GET /api/v1/satellite alias endpoint returns 200', async () => {
    const res = await request('/api/v1/satellite');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.id !== 'SAT-S1-GANJAM-001') throw new Error('Alias mismatch');
  });

  console.log('\n=================================================================');
  console.log(`📊 API VERIFICATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=================================================================');

  server.close();
  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal API test error:', err);
  process.exit(1);
});

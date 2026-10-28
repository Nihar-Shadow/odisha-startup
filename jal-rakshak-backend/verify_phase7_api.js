/**
 * Phase 7 Backend API Verification Script — PS-074 Ganjam Disaster Intelligence
 * Tests all Phase 7 Cyclone Intelligence + Bay of Bengal Track HTTP Endpoints
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
  console.log(`🧪 PS-074 PHASE 7 BACKEND API VERIFICATION (Port: ${port})`);
  console.log('=================================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passedCount++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failedCount++;
    }
  }

  // 1. GET /api/cyclone
  await test('GET /api/cyclone returns primary cyclone observation', async () => {
    const res = await request('/api/cyclone');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.success) throw new Error('success != true');
    if (!res.body.data || !res.body.data.id) throw new Error('Missing cyclone data');
    if (!['APPROACHING', 'SEVERE_CYCLONIC_STORM'].includes(res.body.data.status) && res.body.data.status !== 'SEVERE_CYCLONIC_STORM') {
      throw new Error(`Unexpected status ${res.body.data.status}`);
    }
  });

  // 2. Scenario filtering via query parameter
  await test('GET /api/cyclone?scenario=NO_CYCLONE handles clear basin state', async () => {
    const res = await request('/api/cyclone?scenario=NO_CYCLONE');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.status !== 'NO_CYCLONE') throw new Error(`Expected NO_CYCLONE, got ${res.body.data.status}`);
    if (res.body.data.cycloneRiskScore !== 0) throw new Error(`Expected 0 risk, got ${res.body.data.cycloneRiskScore}`);
  });

  await test('GET /api/cyclone?scenario=DISTANT handles distant system (450 km)', async () => {
    const res = await request('/api/cyclone?scenario=DISTANT');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.distanceToGanjamKm !== 450) throw new Error(`Expected 450 km, got ${res.body.data.distanceToGanjamKm}`);
    if (res.body.data.proximityBand !== 'WATCH') throw new Error(`Expected WATCH band, got ${res.body.data.proximityBand}`);
  });

  await test('GET /api/cyclone?scenario=APPROACHING handles severe approaching storm (182 km)', async () => {
    const res = await request('/api/cyclone?scenario=APPROACHING');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.status !== 'SEVERE_CYCLONIC_STORM') throw new Error(`Expected SEVERE_CYCLONIC_STORM, got ${res.body.data.status}`);
    if (res.body.data.distanceToGanjamKm !== 182) throw new Error(`Expected 182 km, got ${res.body.data.distanceToGanjamKm}`);
    if (res.body.data.cycloneRiskScore !== 68) throw new Error(`Expected 68 risk, got ${res.body.data.cycloneRiskScore}`);
  });

  // 3. GET /api/cyclone/observations
  await test('GET /api/cyclone/observations lists active Bay of Bengal systems', async () => {
    const res = await request('/api/cyclone/observations');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.body.data) || res.body.data.length < 2) throw new Error('Expected at least 2 active observations');
    if (res.body.basin !== 'BAY_OF_BENGAL') throw new Error(`Expected basin BAY_OF_BENGAL, got ${res.body.basin}`);
  });

  // 4. GET /api/cyclone/track
  await test('GET /api/cyclone/track returns historical, forecast, and uncertainty cone', async () => {
    const res = await request('/api/cyclone/track?scenario=APPROACHING');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = res.body.data;
    if (!Array.isArray(data.historicalTrack) || data.historicalTrack.length < 3) throw new Error('Missing historical track');
    if (!Array.isArray(data.forecastTrack) || data.forecastTrack.length < 3) throw new Error('Missing forecast track');
    if (!data.uncertaintyCone || data.uncertaintyCone.type !== 'Feature') throw new Error('Missing uncertainty cone');
    if (!data.currentPosition || data.currentPosition.latitude !== 18.1) throw new Error('Invalid current position');
  });

  // 5. GET /api/cyclone/risk
  await test('GET /api/cyclone/risk returns multi-factor risk scores and surge assessment', async () => {
    const res = await request('/api/cyclone/risk?scenario=APPROACHING');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = res.body.data;
    if (data.cycloneRiskScore !== 68) throw new Error(`Expected 68, got ${data.cycloneRiskScore}`);
    if (data.stormSurgeRisk !== 72) throw new Error(`Expected 72 surge, got ${data.stormSurgeRisk}`);
    if (data.coastalExposure !== 'HIGH') throw new Error(`Expected HIGH exposure, got ${data.coastalExposure}`);
  });

  // 6. GET /api/cyclone/fusion
  await test('GET /api/cyclone/fusion returns bounded multi-hazard risk (81 -> 89)', async () => {
    const res = await request('/api/cyclone/fusion?scenario=APPROACHING');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = res.body.data;
    if (data.baseHazardScore !== 81) throw new Error(`Expected base 81, got ${data.baseHazardScore}`);
    if (data.cycloneContribution !== 8) throw new Error(`Expected +8 contribution, got ${data.cycloneContribution}`);
    if (data.combinedRiskScore !== 89) throw new Error(`Expected 89, got ${data.combinedRiskScore}`);
    if (data.combinedSeverity !== 'CRITICAL') throw new Error(`Expected CRITICAL, got ${data.combinedSeverity}`);
  });

  // 7. GET /api/cyclone/:id
  await test('GET /api/cyclone/:id fetches specific cyclone by unique ID', async () => {
    const res = await request('/api/cyclone/CYC-BOB-2026-01');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.data.id !== 'CYC-BOB-2026-01') throw new Error(`Expected CYC-BOB-2026-01, got ${res.body.data.id}`);
  });

  // 8. POST /api/cyclone/scenario
  await test('POST /api/cyclone/scenario switches the active operational scenario', async () => {
    const res = await request('/api/cyclone/scenario', {
      method: 'POST',
      body: { scenario: 'DISTANT' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.body.scenario !== 'DISTANT') throw new Error(`Expected DISTANT, got ${res.body.scenario}`);
  });

  // 9. POST /api/cyclone/recompute
  await test('POST /api/cyclone/recompute triggers multi-hazard fusion and dispatch prioritization', async () => {
    const res = await request('/api/cyclone/recompute', {
      method: 'POST',
      body: { scenario: 'APPROACHING' },
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.body.fusionResult || res.body.fusionResult.combinedRiskScore !== 89) {
      throw new Error(`Expected combined score 89, got ${res.body.fusionResult?.combinedRiskScore}`);
    }
    if (!res.body.dispatchUpdate || res.body.dispatchUpdate.priorityScore !== 98) {
      throw new Error(`Expected priority 98, got ${res.body.dispatchUpdate?.priorityScore}`);
    }
    if (!res.body.dispatchUpdate.operationalRecommendations.some(r => r.includes('PRE-STAGE BOAT UNIT'))) {
      throw new Error('Missing PRE-STAGE BOAT UNIT recommendation');
    }
  });

  console.log('\n=================================================================');
  console.log(`📊 PHASE 7 BACKEND API RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=================================================================\n');

  server.close();
  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

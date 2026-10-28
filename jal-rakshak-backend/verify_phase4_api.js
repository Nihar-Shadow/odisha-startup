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
  console.log(`Test server running on port ${port}`);

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      server.close();
      process.exit(1);
    }
    console.log(`✅ PASS: ${message}`);
  }

  try {
    // 1. GET /api/citizen/reports
    const repRes = await request('/api/citizen/reports');
    assert(repRes.status === 200, `GET /api/citizen/reports status 200 (got ${repRes.status})`);
    assert(repRes.body.success === true, 'GET /api/citizen/reports success true');
    assert(Array.isArray(repRes.body.data) && repRes.body.data.length > 0, 'Reports array populated');

    // 2. GET /api/citizen/evidence (BASELINE)
    const evBase = await request('/api/citizen/evidence?scenario=BASELINE');
    assert(evBase.status === 200, `GET /api/citizen/evidence?scenario=BASELINE status 200 (got ${evBase.status})`);
    assert(evBase.body.evidenceRiskContribution === 0, 'Scenario BASELINE: 0 evidence risk contribution');

    // 3. GET /api/citizen/evidence (GROUND_EVIDENCE)
    const evGround = await request('/api/citizen/evidence?scenario=GROUND_EVIDENCE');
    assert(evGround.status === 200, `GET /api/citizen/evidence?scenario=GROUND_EVIDENCE status 200 (got ${evGround.status})`);
    assert(evGround.body.evidenceRiskContribution === 14, `Scenario GROUND_EVIDENCE: +14 risk contribution (got ${evGround.body.evidenceRiskContribution})`);
    assert(evGround.body.verifiedCount === 2, `Scenario GROUND_EVIDENCE: 2 verified reports (got ${evGround.body.verifiedCount})`);

    // 4. GET /api/citizen/evidence (CRITICAL_INCIDENT)
    const evCrit = await request('/api/citizen/evidence?scenario=CRITICAL_INCIDENT');
    assert(evCrit.status === 200, `GET /api/citizen/evidence?scenario=CRITICAL_INCIDENT status 200 (got ${evCrit.status})`);
    assert(evCrit.body.evidenceRiskContribution === 22, `Scenario CRITICAL_INCIDENT: +22 risk contribution (got ${evCrit.body.evidenceRiskContribution})`);

    // 5. GET /api/citizen/evidence/:id
    const itemRes = await request('/api/citizen/evidence/E-001');
    assert(itemRes.status === 200, `GET /api/citizen/evidence/E-001 status 200 (got ${itemRes.status})`);
    assert(itemRes.body.data.id === 'E-001', 'Evidence item ID is E-001');
    assert(itemRes.body.data.type === 'FLOOD_REPORT', 'Evidence item type is FLOOD_REPORT');
    assert(itemRes.body.data.confidence === 0.91, 'Evidence item confidence is 0.91');

    // 6. GET /api/citizen/evidence/INVALID -> 404
    const notFound = await request('/api/citizen/evidence/INVALID-ID');
    assert(notFound.status === 404, `GET /api/citizen/evidence/INVALID-ID status 404 (got ${notFound.status})`);

    // 7. GET /api/incidents
    const incRes = await request('/api/incidents');
    assert(incRes.status === 200, `GET /api/incidents status 200 (got ${incRes.status})`);
    assert(Array.isArray(incRes.body.data), 'Incidents data is an array');

    // 8. GET /api/risk (GROUND_EVIDENCE & CRITICAL_INCIDENT)
    const riskGround = await request('/api/risk?scenario=GROUND_EVIDENCE');
    assert(riskGround.status === 200, `GET /api/risk?scenario=GROUND_EVIDENCE status 200 (got ${riskGround.status})`);
    assert(riskGround.body.data.score === 74, `Risk score is 74 for GROUND_EVIDENCE (got ${riskGround.body.data.score})`);
    assert(riskGround.body.data.affectedAreaKm2 === 54.0, `Affected area is 54 km² (got ${riskGround.body.data.affectedAreaKm2})`);

    const riskCrit = await request('/api/risk?scenario=CRITICAL_INCIDENT');
    assert(riskCrit.status === 200, `GET /api/risk?scenario=CRITICAL_INCIDENT status 200 (got ${riskCrit.status})`);
    assert(riskCrit.body.data.score === 82, `Risk score is 82 for CRITICAL_INCIDENT (got ${riskCrit.body.data.score})`);
    assert(riskCrit.body.data.affectedAreaKm2 === 60.0, `Affected area is 60 km² (got ${riskCrit.body.data.affectedAreaKm2})`);

    // 9. GET /api/risk/grid
    const gridRes = await request('/api/risk/grid');
    assert(gridRes.status === 200, `GET /api/risk/grid status 200 (got ${gridRes.status})`);
    assert(gridRes.body.data.type === 'FeatureCollection', 'Risk grid is FeatureCollection');

    // 10. POST /api/risk/recompute
    const recompRes = await request('/api/risk/recompute', {
      method: 'POST',
      body: { scenario: 'CRITICAL_INCIDENT' },
    });
    assert(recompRes.status === 200, `POST /api/risk/recompute status 200 (got ${recompRes.status})`);
    assert(recompRes.body.finalScore === 82, `Recomputed finalScore is 82 (got ${recompRes.body.finalScore})`);

    console.log('\n====================================================');
    console.log('🎉 ALL BACKEND API CONTRACT TESTS PASSED HTTP 200!');
    console.log('====================================================');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

run();

/**
 * Phase 8 Backend API Verification Script — PS-074 Ganjam Disaster Intelligence
 * Tests all Phase 8 Population Exposure, Vulnerability & Critical Infrastructure HTTP Endpoints
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
  console.log(`🧪 PS-074 PHASE 8 BACKEND API VERIFICATION (Port: ${port})`);
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
    // 1. GET /api/exposure
    {
      const res = await request('/api/exposure');
      assert(res.status === 200, 'GET /api/exposure returns 200 OK');
      assert(res.body.success === true, 'GET /api/exposure body.success is true');
      assert(res.body.data.summary.totalExposedPopulation === 8900, 'GET /api/exposure returns total exposed population 8,900');
      assert(res.body.data.provenance === 'MODELLED EXPOSURE', 'GET /api/exposure explicitly tagged with MODELLED EXPOSURE provenance');
    }

    // 2. GET /api/exposure/population
    {
      const res = await request('/api/exposure/population');
      assert(res.status === 200, 'GET /api/exposure/population returns 200 OK');
      assert(Array.isArray(res.body.data) && res.body.data.length >= 3, 'GET /api/exposure/population returns zone demographics');
      const aska = res.body.data.find((z) => z.zoneId === 'ZONE-GANJAM-02');
      assert(aska && aska.vulnerablePopulation === 2600, 'GET /api/exposure/population Aska has 2,600 vulnerable residents');
    }

    // 3. GET /api/exposure/vulnerability
    {
      const res = await request('/api/exposure/vulnerability');
      assert(res.status === 200, 'GET /api/exposure/vulnerability returns 200 OK');
      assert(res.body.data[0].priorityScore >= 80, 'GET /api/exposure/vulnerability top zone has priorityScore >= 80');
    }

    // 4. GET /api/exposure/zones
    {
      const res = await request('/api/exposure/zones');
      assert(res.status === 200, 'GET /api/exposure/zones returns 200 OK');
      assert(res.body.data[0].zoneId === 'ZONE-GANJAM-02', 'GET /api/exposure/zones ranks Aska floodplain top priority');
    }

    // 5. GET /api/infrastructure
    {
      const res = await request('/api/infrastructure');
      assert(res.status === 200, 'GET /api/infrastructure returns 200 OK');
      assert(res.body.data.length >= 8, 'GET /api/infrastructure returns all 8 modelled facilities');
      assert(res.body.provenance === 'DEMO INFRASTRUCTURE INVENTORY', 'GET /api/infrastructure tagged with DEMO INFRASTRUCTURE INVENTORY');
    }

    // 6. GET /api/infrastructure?type=HOSPITAL
    {
      const res = await request('/api/infrastructure?type=HOSPITAL');
      assert(res.status === 200, 'GET /api/infrastructure?type=HOSPITAL returns 200 OK');
      assert(res.body.count === 1 && res.body.data[0].id === 'INFRA-HOSP-01', 'GET /api/infrastructure filters hospital facility correctly');
    }

    // 7. GET /api/infrastructure/:id
    {
      const res = await request('/api/infrastructure/INFRA-HOSP-01');
      assert(res.status === 200, 'GET /api/infrastructure/:id returns 200 OK');
      assert(res.body.data.name === 'Aska Sub-Divisional Hospital', 'GET /api/infrastructure/:id returns Aska Sub-Divisional Hospital');
      assert(res.body.data.serviceDependency.roadAccess === 'BLOCKED', 'GET /api/infrastructure/:id shows SH-36 roadAccess BLOCKED');
    }

    // 8. GET /api/infrastructure/impacts
    {
      const res = await request('/api/infrastructure/impacts');
      assert(res.status === 200, 'GET /api/infrastructure/impacts returns 200 OK');
      assert(res.body.atRiskCount >= 3, 'GET /api/infrastructure/impacts identifies at least 3 at-risk assets');
      assert(res.body.criticalAccessBlockedCount >= 2, 'GET /api/infrastructure/impacts detects critical blocked access');
    }

    // 9. GET /api/vulnerability
    {
      const res = await request('/api/vulnerability');
      assert(res.status === 200, 'GET /api/vulnerability returns 200 OK');
      assert(res.body.data.zones.length >= 3, 'GET /api/vulnerability returns zone vulnerability records');
    }

    // 10. GET /api/vulnerability/zones
    {
      const res = await request('/api/vulnerability/zones');
      assert(res.status === 200, 'GET /api/vulnerability/zones returns 200 OK');
      assert(res.body.data[0].priorityClass === 'CRITICAL', 'GET /api/vulnerability/zones top zone classified as CRITICAL');
    }

    // 11. GET /api/vulnerability/priority
    {
      const res = await request('/api/vulnerability/priority');
      assert(res.status === 200, 'GET /api/vulnerability/priority returns 200 OK');
      assert(res.body.data[0].priorityScore === 96, 'GET /api/vulnerability/priority produces Priority 96 for Aska');
    }

    // 12. POST /api/exposure/recompute
    {
      const res = await request('/api/exposure/recompute', { method: 'POST', body: {} });
      assert(res.status === 200, 'POST /api/exposure/recompute returns 200 OK');
      assert(res.body.totalExposedPopulation === 8900, 'POST /api/exposure/recompute successfully recomputed exposure');
    }

    // 13. POST /api/vulnerability/recompute
    {
      const res = await request('/api/vulnerability/recompute', { method: 'POST', body: {} });
      assert(res.status === 200, 'POST /api/vulnerability/recompute returns 200 OK');
      assert(res.body.topPriorityZone.zoneId === 'ZONE-GANJAM-02', 'POST /api/vulnerability/recompute confirms top priority zone');
    }

    // 14. GET /api/decisions (Continuity Check)
    {
      const res = await request('/api/decisions');
      assert(res.status === 200, 'GET /api/decisions continues to operate seamlessly');
      assert(Array.isArray(res.body.data) && res.body.data.length >= 4, 'GET /api/decisions returns full decision orchestration queue');
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
    failedCount++;
  } finally {
    server.close();
  }

  console.log('\n=================================================================');
  console.log(`📊 PHASE 8 BACKEND API RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run();

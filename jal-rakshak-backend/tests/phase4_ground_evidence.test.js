const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('Phase 4 Citizen Intelligence & Ground Evidence API Contracts', () => {
  it('GET /api/citizen/reports should return HTTP 200 and evidence/reports list', async () => {
    const res = await request(app).get('/api/citizen/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('GET /api/citizen/evidence should return HTTP 200 for BASELINE, GROUND_EVIDENCE, CRITICAL_INCIDENT', async () => {
    // 1. BASELINE scenario
    const baseRes = await request(app).get('/api/citizen/evidence?scenario=BASELINE');
    expect(baseRes.statusCode).toBe(200);
    expect(baseRes.body.success).toBe(true);
    expect(baseRes.body.scenario).toBe('BASELINE');
    expect(baseRes.body.evidenceRiskContribution).toBe(0);

    // 2. GROUND_EVIDENCE scenario
    const groundRes = await request(app).get('/api/citizen/evidence?scenario=GROUND_EVIDENCE');
    expect(groundRes.statusCode).toBe(200);
    expect(groundRes.body.success).toBe(true);
    expect(groundRes.body.scenario).toBe('GROUND_EVIDENCE');
    expect(groundRes.body.evidenceRiskContribution).toBe(14);
    expect(groundRes.body.verifiedCount).toBe(2);

    // 3. CRITICAL_INCIDENT scenario
    const critRes = await request(app).get('/api/citizen/evidence?scenario=CRITICAL_INCIDENT');
    expect(critRes.statusCode).toBe(200);
    expect(critRes.body.success).toBe(true);
    expect(critRes.body.scenario).toBe('CRITICAL_INCIDENT');
    expect(critRes.body.evidenceRiskContribution).toBe(22);
  });

  it('GET /api/citizen/evidence/:id should return single normalized item or 404', async () => {
    const foundRes = await request(app).get('/api/citizen/evidence/E-001');
    expect(foundRes.statusCode).toBe(200);
    expect(foundRes.body.success).toBe(true);
    expect(foundRes.body.data.id).toBe('E-001');
    expect(foundRes.body.data.type).toBe('FLOOD_REPORT');
    expect(foundRes.body.data.confidence).toBe(0.91);
    expect(foundRes.body.data.verificationStatus).toBe('VERIFIED');

    const notFoundRes = await request(app).get('/api/citizen/evidence/NON_EXISTENT');
    expect(notFoundRes.statusCode).toBe(404);
    expect(notFoundRes.body.success).toBe(false);
  });

  it('GET /api/incidents should return HTTP 200 with normalized incident objects', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/risk should support Phase 4 scenarios (GROUND_EVIDENCE -> 74, CRITICAL_INCIDENT -> 82)', async () => {
    const groundRes = await request(app).get('/api/risk?scenario=GROUND_EVIDENCE');
    expect(groundRes.statusCode).toBe(200);
    expect(groundRes.body.success).toBe(true);
    expect(groundRes.body.data.score).toBe(74);
    expect(groundRes.body.data.severity).toBe('HIGH');
    expect(groundRes.body.data.affectedAreaKm2).toBe(54.0);
    expect(groundRes.body.data.affectedPopulation).toBe(8400);

    const critRes = await request(app).get('/api/risk?scenario=CRITICAL_INCIDENT');
    expect(critRes.statusCode).toBe(200);
    expect(critRes.body.success).toBe(true);
    expect(critRes.body.data.score).toBe(82);
    expect(critRes.body.data.severity).toBe('CRITICAL');
    expect(critRes.body.data.affectedAreaKm2).toBe(60.0);
    expect(critRes.body.data.affectedPopulation).toBe(8900);
  });

  it('GET /api/risk/grid should return HTTP 200 with FeatureCollection', async () => {
    const res = await request(app).get('/api/risk/grid');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe('FeatureCollection');
    expect(Array.isArray(res.body.data.features)).toBe(true);
  });

  it('POST /api/risk/recompute should return recomputed risk state', async () => {
    const res = await request(app)
      .post('/api/risk/recompute')
      .send({ scenario: 'CRITICAL_INCIDENT' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.finalScore).toBe(82);
    expect(res.body.evidenceDelta).toBe(22);
  });
});

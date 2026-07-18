const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('returns safe deployment health metadata', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'healthy',
      ok: true,
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      environment: 'test',
    });

    // A health check is public, so it must contain only operational metadata.
    expect(response.text).not.toContain('SUPABASE');
    expect(response.body.stack).toBeUndefined();
  });
});

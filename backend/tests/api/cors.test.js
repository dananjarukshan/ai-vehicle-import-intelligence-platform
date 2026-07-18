const request = require('supertest');
const app = require('../../src/app');

describe('CORS configuration', () => {
  it('allows the configured frontend origin', async () => {
    const response = await request(app)
      .options('/api/v1/vehicles')
      .set('Origin', process.env.CORS_ORIGIN)
      .set('Access-Control-Request-Method', 'GET');

    expect(response.headers['access-control-allow-origin']).toBe(process.env.CORS_ORIGIN);
  });

  it('does not grant an unconfigured origin', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'https://untrusted.example');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});

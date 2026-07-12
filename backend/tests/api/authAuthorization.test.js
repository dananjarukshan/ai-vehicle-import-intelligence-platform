// ============================================================================
// API INTEGRATION TESTS: Auth and Authorization
// ============================================================================
// File: tests/api/authAuthorization.test.js
//
// PURPOSE:
// Tests the full HTTP authorization behavior at the route level.
// We mock supabaseAuthClient and userProfileService so no real
// Supabase/network calls ever occur during tests.
// Vehicle service functions are also mocked to prevent DB calls.
//
// STRATEGY:
// Instead of mocking just the authenticate middleware (which would bypass
// real role checking), we mock the underlying Supabase auth and profile
// service. This lets the real authenticate + authorizeRoles middleware run,
// so the full permission matrix is actually tested.
// ============================================================================

// Mock all external dependencies BEFORE importing the app
jest.mock('../../src/config/supabaseAuthClient');
jest.mock('../../src/services/userProfileService');
jest.mock('../../src/services/vehicleService');

const request = require('supertest');
const app = require('../../src/app');
const supabaseAuthClient = require('../../src/config/supabaseAuthClient');
const { getUserProfileById } = require('../../src/services/userProfileService');
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../../src/services/vehicleService');

// ============================================================================
// TEST FIXTURES
// ============================================================================

const TEST_ID = '11111111-1111-4111-8111-111111111111';

const MOCK_VEHICLE = {
  id: TEST_ID,
  make: 'Toyota',
  model: 'Prius',
  year: 2019,
  auction_price: 1000,
  estimated_import_cost: null,
  estimated_selling_price: null,
};

// Supabase user object (returned by auth.getUser)
function mockSupabaseUser(id = 'user-uuid', email = 'user@example.com') {
  return { id, email };
}

// Configure supabaseAuthClient mock for a VALID token
function setupValidToken(role, userId = 'user-uuid', email = 'user@example.com') {
  supabaseAuthClient.auth = {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockSupabaseUser(userId, email) },
      error: null,
    }),
  };
  getUserProfileById.mockResolvedValue({ id: userId, email, role });
}

// Configure supabaseAuthClient mock for an INVALID token
function setupInvalidToken() {
  supabaseAuthClient.auth = {
    getUser: jest.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid JWT' },
    }),
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('Auth and Authorization API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: vehicle service returns sensible mocks
    getAllVehicles.mockResolvedValue({ data: [MOCK_VEHICLE], pagination: { total: 1 } });
    getVehicleById.mockResolvedValue(MOCK_VEHICLE);
    createVehicle.mockResolvedValue(MOCK_VEHICLE);
    updateVehicle.mockResolvedValue(MOCK_VEHICLE);
    deleteVehicle.mockResolvedValue(MOCK_VEHICLE);
  });

  // ==========================================================================
  // UNAUTHENTICATED REQUESTS
  // ==========================================================================

  it('1. GET /api/v1/vehicles without token returns 401', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.status).toBe(401);
  });

  it('2. POST /api/v1/vehicles without token returns 401', async () => {
    const res = await request(app).post('/api/v1/vehicles').send({});
    expect(res.status).toBe(401);
  });

  it('3. DELETE /api/v1/vehicles/:id without token returns 401', async () => {
    const res = await request(app).delete(`/api/v1/vehicles/${TEST_ID}`);
    expect(res.status).toBe(401);
  });

  it('4. Invalid token returns 401', async () => {
    setupInvalidToken();
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  // ==========================================================================
  // VIEWER ROLE PERMISSIONS
  // ==========================================================================

  it('5. Valid viewer can GET /vehicles (200)', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer viewer-token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('6. Valid viewer cannot POST /vehicles (403)', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', 'Bearer viewer-token')
      .send({ make: 'Toyota', model: 'Prius', year: 2019 });
    expect(res.status).toBe(403);
  });

  it('7. Valid viewer cannot PUT /vehicles/:id (403)', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .put(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer viewer-token')
      .send({ mileage: 5000 });
    expect(res.status).toBe(403);
  });

  it('8. Valid viewer cannot POST estimate (403)', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .post(`/api/v1/vehicles/${TEST_ID}/estimate`)
      .set('Authorization', 'Bearer viewer-token')
      .send({ exchange_rate: 1 });
    expect(res.status).toBe(403);
  });

  it('9. Valid viewer cannot DELETE /vehicles/:id (403)', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer viewer-token');
    expect(res.status).toBe(403);
  });

  // ==========================================================================
  // ANALYST ROLE PERMISSIONS
  // ==========================================================================

  it('10. Valid analyst can GET /vehicles (200)', async () => {
    setupValidToken('analyst');
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer analyst-token');
    expect(res.status).toBe(200);
  });

  it('11. Valid analyst can POST /vehicles (201)', async () => {
    setupValidToken('analyst');
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', 'Bearer analyst-token')
      .send({ make: 'Toyota', model: 'Prius', year: 2019 });
    expect(res.status).toBe(201);
  });

  it('12. Valid analyst can PUT /vehicles/:id (200)', async () => {
    setupValidToken('analyst');
    const res = await request(app)
      .put(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer analyst-token')
      .send({ mileage: 5000 });
    expect(res.status).toBe(200);
  });

  it('13. Valid analyst can POST estimate (200)', async () => {
    setupValidToken('analyst');
    const res = await request(app)
      .post(`/api/v1/vehicles/${TEST_ID}/estimate`)
      .set('Authorization', 'Bearer analyst-token')
      .send({ exchange_rate: 1 });
    expect(res.status).toBe(200);
  });

  it('14. Valid analyst cannot DELETE /vehicles/:id (403)', async () => {
    setupValidToken('analyst');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer analyst-token');
    expect(res.status).toBe(403);
  });

  // ==========================================================================
  // ADMIN ROLE PERMISSIONS
  // ==========================================================================

  it('15. Valid admin can GET /vehicles (200)', async () => {
    setupValidToken('admin');
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer admin-token');
    expect(res.status).toBe(200);
  });

  it('16. Valid admin can POST /vehicles (201)', async () => {
    setupValidToken('admin');
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', 'Bearer admin-token')
      .send({ make: 'Toyota', model: 'Prius', year: 2019 });
    expect(res.status).toBe(201);
  });

  it('16b. Valid admin can PUT /vehicles/:id (200)', async () => {
    setupValidToken('admin');
    const res = await request(app)
      .put(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer admin-token')
      .send({ mileage: 5000 });
    expect(res.status).toBe(200);
  });

  it('16c. Valid admin can DELETE /vehicles/:id (200)', async () => {
    setupValidToken('admin');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer admin-token');
    expect(res.status).toBe(200);
  });

  it('16. Valid admin can run price estimation (200)', async () => {
    setupValidToken('admin');
    const res = await request(app)
      .post(`/api/v1/vehicles/${TEST_ID}/estimate`)
      .set('Authorization', 'Bearer admin-token')
      .send({ exchange_rate: 1 });
    expect(res.status).toBe(200);
  });

  // ==========================================================================
  // RESPONSE SHAPE TESTS
  // ==========================================================================

  it('17. Forbidden response uses code FORBIDDEN', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', 'Bearer viewer-token')
      .send({ make: 'Toyota', model: 'Prius', year: 2019 });
    expect(res.body.code).toBe('FORBIDDEN');
    expect(res.body.success).toBe(false);
  });

  it('18. Unauthenticated response uses an authentication error code', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.body.success).toBe(false);
    expect(['AUTHENTICATION_REQUIRED', 'INVALID_ACCESS_TOKEN', 'INVALID_AUTHORIZATION_HEADER'])
      .toContain(res.body.code);
  });

  // ==========================================================================
  // AUTH/ME ENDPOINT TESTS
  // ==========================================================================

  it('19. GET /api/v1/auth/me returns the current user', async () => {
    setupValidToken('analyst', 'user-uuid-99', 'me@example.com');
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: 'user-uuid-99',
      email: 'me@example.com',
      role: 'analyst',
    });
  });

  it('20. /auth/me does not return tokens or sensitive metadata', async () => {
    setupValidToken('analyst', 'user-uuid-99', 'me@example.com');
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer valid-token');

    const data = res.body.data;
    expect(data.token).toBeUndefined();
    expect(data.access_token).toBeUndefined();
    expect(data.refresh_token).toBeUndefined();
    expect(data.password).toBeUndefined();
    expect(data.user_metadata).toBeUndefined();
  });

  // ==========================================================================
  // PUBLIC ROUTES REMAIN ACCESSIBLE
  // ==========================================================================

  it('21. Public health route remains accessible without authentication (200)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  // ==========================================================================
  // SECURITY: No real Supabase request occurs
  // ==========================================================================

  it('22. No real Supabase/network request occurs (mocks confirmed)', async () => {
    setupValidToken('viewer');
    await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer viewer-token');

    // The mock was called, not a real Supabase HTTP request
    expect(supabaseAuthClient.auth.getUser).toHaveBeenCalled();
    expect(getUserProfileById).toHaveBeenCalled();
  });

  // ==========================================================================
  // SECURITY: Role injection prevention
  // ==========================================================================

  it('M1. req.body.role="admin" does not grant DELETE access to a viewer', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer viewer-token')
      .send({ role: 'admin' }); // attacker injects role in body
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('M2. x-user-role: admin header does not grant DELETE access to a viewer', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer viewer-token')
      .set('x-user-role', 'admin'); // attacker injects role in header
    expect(res.status).toBe(403);
  });

  it('M3. Query parameter ?role=admin does not grant DELETE access to a viewer', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}?role=admin`)
      .set('Authorization', 'Bearer viewer-token');
    expect(res.status).toBe(403);
  });

  it('M4. Invalid tokens cannot reach vehicle services', async () => {
    setupInvalidToken();
    await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer bad-token');
    expect(getAllVehicles).not.toHaveBeenCalled();
  });

  it('M5. Forbidden viewers cannot reach createVehicle service', async () => {
    setupValidToken('viewer');
    await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', 'Bearer viewer-token')
      .send({ make: 'Toyota', model: 'Prius', year: 2019 });
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it('M6. 401 response contains no token, stack, Supabase error, or service-role key', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    const text = res.text;
    expect(text).not.toContain('eyJ'); // JWT prefix
    expect(text).not.toContain('stack');
    expect(text).not.toContain('supabase');
    expect(text).not.toContain('service_role');
    expect(text).not.toContain('test-service-role-key');
  });

  it('M7. 403 response contains no token, stack, or internal cause', async () => {
    setupValidToken('viewer');
    const res = await request(app)
      .delete(`/api/v1/vehicles/${TEST_ID}`)
      .set('Authorization', 'Bearer viewer-token');
    const text = res.text;
    expect(text).not.toContain('stack');
    expect(text).not.toContain('cause');
    expect(text).not.toContain('test-service-role-key');
  });
});

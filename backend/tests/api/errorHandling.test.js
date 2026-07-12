// ============================================================================
// ERROR HANDLING INTEGRATION API TESTS
// ============================================================================
// File: backend/tests/api/errorHandling.test.js
//
// PURPOSE:
// Integration tests verifying HTTP error behavior, including unmatched routes (404),
// validation errors (400), missing records (404), malformed JSON (400),
// database/service failures (500), production-mode masking, and requestId presence.
// ============================================================================

// IMPORTANT: Mock BEFORE requiring the app
jest.mock('../../src/services/vehicleService');

const request = require('supertest');
const app = require('../../src/app');
const { getVehicleById, createVehicle } = require('../../src/services/vehicleService');

describe('Centralized Error Handling API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // UNMATCHED ROUTE TESTS (404)
  // ==========================================================================
  describe('GET /api/v1/unknown-path-that-does-not-exist', () => {
    it('1. Unknown route returns 404', async () => {
      const response = await request(app).get('/api/v1/unknown-path-that-does-not-exist');
      expect(response.status).toBe(404);
    });

    it('2. Unknown route uses code ROUTE_NOT_FOUND', async () => {
      const response = await request(app).get('/api/v1/unknown-path-that-does-not-exist');
      expect(response.body.code).toBe('ROUTE_NOT_FOUND');
    });

    it('3. Unknown route follows standard response shape', async () => {
      const response = await request(app).get('/api/v1/unknown-path-that-does-not-exist');
      expect(response.body).toEqual({
        success: false,
        message: 'Route GET /api/v1/unknown-path-that-does-not-exist was not found.',
        code: 'ROUTE_NOT_FOUND',
        requestId: expect.any(String)
      });
    });
  });

  // ==========================================================================
  // VALIDATION ERROR TESTS (400)
  // ==========================================================================
  describe('POST /api/v1/vehicles validation errors', () => {
    it('4. Validation failure returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({ make: '', model: 'Prius', year: 2019 });

      expect(response.status).toBe(400);
    });

    it('5. Validation failure uses code VALIDATION_ERROR', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({ make: '', model: 'Prius', year: 2019 });

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('6. Validation errors array is preserved', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({ make: '', model: 'Prius', year: 2019 });

      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors).toContain("Missing required field: 'make' is required.");
    });
  });

  // ==========================================================================
  // MISSING VEHICLE TESTS (404)
  // ==========================================================================
  describe('GET /api/v1/vehicles/:id missing record', () => {
    const missingId = '22222222-2222-4222-8222-222222222222';

    it('7. Missing vehicle returns 404', async () => {
      getVehicleById.mockResolvedValue(null);

      const response = await request(app).get(`/api/v1/vehicles/${missingId}`);

      expect(response.status).toBe(404);
    });

    it('8. Missing vehicle uses code VEHICLE_NOT_FOUND', async () => {
      getVehicleById.mockResolvedValue(null);

      const response = await request(app).get(`/api/v1/vehicles/${missingId}`);

      expect(response.body.code).toBe('VEHICLE_NOT_FOUND');
    });
  });

  // ==========================================================================
  // SERVICE ERROR AND EXPOSURE PROTECTION TESTS (500)
  // ==========================================================================
  describe('GET /api/v1/vehicles/:id service failure', () => {
    const testId = '11111111-1111-4111-8111-111111111111';
    const internalErrorMessage = 'Supabase service-role secret ABC123 and SQL details';

    it('9. Service rejection returns 500', async () => {
      getVehicleById.mockRejectedValue(new Error(internalErrorMessage));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.status).toBe(500);
    });

    it('10. A raw service error message is not returned to the client', async () => {
      getVehicleById.mockRejectedValue(new Error(internalErrorMessage));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.body.message).not.toContain(internalErrorMessage);
    });

    it('11. A fake secret-like internal string is not returned to the client', async () => {
      getVehicleById.mockRejectedValue(new Error(internalErrorMessage));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.text).not.toContain('ABC123');
      expect(response.text).not.toContain('Supabase service-role secret');
    });

    it('12. A 500 response uses code INTERNAL_SERVER_ERROR', async () => {
      getVehicleById.mockRejectedValue(new Error(internalErrorMessage));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.body.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('13. A 500 response uses the generic public message', async () => {
      getVehicleById.mockRejectedValue(new Error(internalErrorMessage));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.body.message).toBe('An unexpected error occurred.');
    });
  });

  // ==========================================================================
  // BODY-PARSER MALFORMED JSON TESTS (400)
  // ==========================================================================
  describe('Malformed JSON parsing', () => {
    it('14. Malformed JSON returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .set('Content-Type', 'application/json')
        .send('{ "make": "Toyota", }'); // trailing comma is invalid JSON

      expect(response.status).toBe(400);
    });

    it('15. Malformed JSON uses code INVALID_JSON', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .set('Content-Type', 'application/json')
        .send('{ "make": "Toyota", }');

      expect(response.body.code).toBe('INVALID_JSON');
      expect(response.body.message).toBe('Request body contains invalid JSON.');
    });
  });

  // ==========================================================================
  // REQUEST ID TESTS
  // ==========================================================================
  describe('Request ID in error responses', () => {
    it('16. Error responses include requestId', async () => {
      const response = await request(app).get('/api/v1/unknown-route-for-id');

      expect(response.body.requestId).toBeDefined();
      expect(typeof response.body.requestId).toBe('string');
      expect(response.body.requestId).toContain('req_');
    });
  });

  // ==========================================================================
  // DEV vs PROD/TEST BEHAVIOR TESTS
  // ==========================================================================
  describe('Environment specifics', () => {
    const testId = '11111111-1111-4111-8111-111111111111';

    it('17. Error responses never contain stack in NODE_ENV=test', async () => {
      getVehicleById.mockRejectedValue(new Error('Internal raw error'));

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.body.stack).toBeUndefined();
    });

    it('18. Successful routes remain unchanged', async () => {
      const mockVehicle = {
        id: testId,
        make: 'Toyota',
        model: 'Prius',
        year: 2019
      };
      getVehicleById.mockResolvedValue(mockVehicle);

      const response = await request(app).get(`/api/v1/vehicles/${testId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockVehicle);
    });

    it('19. No real Supabase request occurs', async () => {
      // Verified by mocks
      expect(getVehicleById).not.toHaveBeenCalled();
      await request(app).get(`/api/v1/vehicles/${testId}`);
      expect(getVehicleById).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // PRODUCTION ENVIRONMENT TEST (Section J)
  // ==========================================================================
  describe('Production environment masking', () => {
    const testId = '11111111-1111-4111-8111-111111111111';

    it('21. Confirm that when NODE_ENV is production: raw message, stack, cause are absent and generic 500 is returned', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const errorWithCause = new Error('Raw SQL fail message');
        errorWithCause.cause = new Error('Root database timeout');

        getVehicleById.mockRejectedValue(errorWithCause);

        const response = await request(app).get(`/api/v1/vehicles/${testId}`);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: 'An unexpected error occurred.',
          code: 'INTERNAL_SERVER_ERROR',
          requestId: expect.any(String)
        });

        // Debug details should be absent
        expect(response.body.stack).toBeUndefined();
        expect(response.body.cause).toBeUndefined();
        expect(response.body.debug).toBeUndefined();
        expect(response.text).not.toContain('Raw SQL fail message');
        expect(response.text).not.toContain('Root database timeout');

      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});

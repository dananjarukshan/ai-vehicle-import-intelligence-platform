// ============================================================================
// VEHICLE CRUD ENDPOINTS API TESTS
// ============================================================================
// File: backend/tests/api/vehicleCrudEndpoints.test.js
//
// PURPOSE:
// Tests the HTTP CRUD endpoints for vehicles:
// - GET /api/v1/vehicles/:id
// - POST /api/v1/vehicles
// - PUT /api/v1/vehicles/:id
// - DELETE /api/v1/vehicles/:id
// Uses Supertest and mocks the vehicleService to operate entirely in memory.
// ============================================================================

// IMPORTANT: Mock BEFORE requiring the app
jest.mock('../../src/services/vehicleService');

// Mock the authenticate middleware so existing tests bypass token verification.
// This simulates a fully authenticated admin user without needing a real Supabase token.
// The real authorizeRoles logic still runs — routes that need 'admin' will pass
// because we set role: 'admin' on req.auth.
jest.mock('../../src/middleware/authenticate', () =>
  jest.fn((req, res, next) => {
    req.auth = {
      userId: 'test-admin-id',
      email: 'admin@example.com',
      role: 'admin',
    };
    next();
  })
);

const request = require('supertest');
const app = require('../../src/app');
const {
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../../src/services/vehicleService');

describe('Vehicle CRUD API Endpoints', () => {
  const vehicleId = '11111111-1111-4111-8111-111111111111';

  const mockVehicle = {
    id: vehicleId,
    make: 'Toyota',
    model: 'Prius',
    year: 2019,
    mileage: 85000,
    auction_grade: '4.5',
    auction_price: 1250000,
    estimated_import_cost: null,
    estimated_selling_price: null,
    created_at: '2026-06-08T13:22:26.112738'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // GET /api/v1/vehicles/:id
  // ==========================================================================
  describe('GET /api/v1/vehicles/:id', () => {
    it('1. Existing vehicle returns 200', async () => {
      getVehicleById.mockResolvedValue(mockVehicle);

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(200);
    });

    it('2. success is true', async () => {
      getVehicleById.mockResolvedValue(mockVehicle);

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.body.success).toBe(true);
    });

    it('3. Response data contains the vehicle', async () => {
      getVehicleById.mockResolvedValue(mockVehicle);

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.body.data).toEqual(mockVehicle);
    });

    it('4. getVehicleById receives the route ID', async () => {
      getVehicleById.mockResolvedValue(mockVehicle);

      await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(getVehicleById).toHaveBeenCalledWith(vehicleId);
    });

    it('5. Missing vehicle returns 404', async () => {
      getVehicleById.mockResolvedValue(null);

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(404);
    });

    it('6. Missing vehicle response success is false', async () => {
      getVehicleById.mockResolvedValue(null);

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(`Vehicle with ID ${vehicleId} not found.`);
    });

    it('7. Service rejection returns 500', async () => {
      getVehicleById.mockRejectedValue(new Error('Database error occurred.'));

      const response = await request(app).get(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      // The centralized errorHandler masks raw non-operational errors
      expect(response.body.message).toBe('An unexpected error occurred.');
    });
  });

  // ==========================================================================
  // POST /api/v1/vehicles
  // ==========================================================================
  describe('POST /api/v1/vehicles', () => {
    it('1. Valid request returns 201', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019
        });

      expect(response.status).toBe(201);
    });

    it('2. success is true', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019
        });

      expect(response.body.success).toBe(true);
    });

    it('3. Response contains created vehicle', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019
        });

      expect(response.body.data).toEqual(mockVehicle);
    });

    it('4. createVehicle receives cleaned data', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: '  Toyota  ',
          model: 'Prius',
          year: 2019,
          mileage: 85000
        });

      expect(createVehicle).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        mileage: 85000
      });
    });

    it('5. Numeric strings are converted before createVehicle is called', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: '2019',
          mileage: '85000',
          auction_price: '1250000'
        });

      expect(createVehicle).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        mileage: 85000,
        auction_price: 1250000
      });
    });

    it('6. make and model whitespace is trimmed', async () => {
      createVehicle.mockResolvedValue(mockVehicle);

      await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: '  Toyota  ',
          model: '   Prius   ',
          year: 2019
        });

      expect(createVehicle).toHaveBeenCalledWith({
        make: 'Toyota',
        model: 'Prius',
        year: 2019
      });
    });

    it('7. Missing required fields returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          year: 2019
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain("Missing required field: 'model' is required.");
    });

    it('8. Invalid request does not call createVehicle', async () => {
      await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          year: 2019
        });

      expect(createVehicle).not.toHaveBeenCalled();
    });

    it('9. Unknown field returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019,
          invalid_field: 'hello'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(err => err.includes('Unknown or disallowed fields: invalid_field'))).toBe(true);
    });

    it('10. id field returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019,
          id: vehicleId
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(err => err.includes('Unknown or disallowed fields: id'))).toBe(true);
    });

    it('11. created_at field returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019,
          created_at: '2026-06-08T13:22:26.112738'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(err => err.includes('Unknown or disallowed fields: created_at'))).toBe(true);
    });

    it('12. Negative mileage returns 400', async () => {
      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019,
          mileage: -100
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("'mileage' must be greater than or equal to 0.");
    });

    it('13. Service rejection returns 500', async () => {
      createVehicle.mockRejectedValue(new Error('Insert failed in service.'));

      const response = await request(app)
        .post('/api/v1/vehicles')
        .send({
          make: 'Toyota',
          model: 'Prius',
          year: 2019
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      // The centralized errorHandler masks raw non-operational errors in test/production
      // to avoid leaking internal implementation details.
      expect(response.body.message).toBe('An unexpected error occurred.');
    });
  });

  // ==========================================================================
  // PUT /api/v1/vehicles/:id
  // ==========================================================================
  describe('PUT /api/v1/vehicles/:id', () => {
    const updatedMockVehicle = {
      ...mockVehicle,
      mileage: 90000,
      auction_price: 1300000
    };

    it('1. Valid partial update returns 200', async () => {
      updateVehicle.mockResolvedValue(updatedMockVehicle);

      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          mileage: 90000,
          auction_price: 1300000
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedMockVehicle);
    });

    it('2. updateVehicle receives the route ID', async () => {
      updateVehicle.mockResolvedValue(updatedMockVehicle);

      await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          mileage: 90000
        });

      expect(updateVehicle).toHaveBeenCalledWith(vehicleId, expect.any(Object));
    });

    it('3. updateVehicle receives cleaned data', async () => {
      updateVehicle.mockResolvedValue(updatedMockVehicle);

      await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          make: '  Toyota  ',
          mileage: 90000
        });

      expect(updateVehicle).toHaveBeenCalledWith(vehicleId, {
        make: 'Toyota',
        mileage: 90000
      });
    });

    it('4. Numeric strings are converted', async () => {
      updateVehicle.mockResolvedValue(updatedMockVehicle);

      await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          mileage: '90000',
          auction_price: '1300000'
        });

      expect(updateVehicle).toHaveBeenCalledWith(vehicleId, {
        mileage: 90000,
        auction_price: 1300000
      });
    });

    it('5. Empty body returns 400', async () => {
      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('At least one valid vehicle field must be provided for update.');
    });

    it('6. Empty body does not call updateVehicle', async () => {
      await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({});

      expect(updateVehicle).not.toHaveBeenCalled();
    });

    it('7. Unknown field returns 400', async () => {
      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          unknown_field: 'hello'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(err => err.includes('Unknown or disallowed fields: unknown_field'))).toBe(true);
    });

    it('8. Protected id field returns 400', async () => {
      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          id: vehicleId,
          mileage: 90000
        });

      expect(response.status).toBe(400);
      expect(response.body.errors.some(err => err.includes('Unknown or disallowed fields: id'))).toBe(true);
    });

    it('9. Missing vehicle returns 404', async () => {
      updateVehicle.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          mileage: 90000
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(`Vehicle with ID ${vehicleId} not found.`);
    });

    it('10. Service rejection returns 500', async () => {
      updateVehicle.mockRejectedValue(new Error('Update failed.'));

      const response = await request(app)
        .put(`/api/v1/vehicles/${vehicleId}`)
        .send({
          mileage: 90000
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      // The centralized errorHandler masks raw non-operational errors
      expect(response.body.message).toBe('An unexpected error occurred.');
    });
  });

  // ==========================================================================
  // DELETE /api/v1/vehicles/:id
  // ==========================================================================
  describe('DELETE /api/v1/vehicles/:id', () => {
    it('1. Existing vehicle returns 200', async () => {
      deleteVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(200);
    });

    it('2. Response success is true', async () => {
      deleteVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(response.body.success).toBe(true);
    });

    it('3. Response contains the deleted vehicle if the current controller returns it', async () => {
      deleteVehicle.mockResolvedValue(mockVehicle);

      const response = await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(response.body.data).toEqual(mockVehicle);
    });

    it('4. deleteVehicle receives the route ID', async () => {
      deleteVehicle.mockResolvedValue(mockVehicle);

      await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(deleteVehicle).toHaveBeenCalledWith(vehicleId);
    });

    it('5. Missing vehicle returns 404', async () => {
      deleteVehicle.mockResolvedValue(null);

      const response = await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(`Vehicle with ID ${vehicleId} not found.`);
    });

    it('6. Service rejection returns 500', async () => {
      deleteVehicle.mockRejectedValue(new Error('Delete failed in service.'));

      const response = await request(app).delete(`/api/v1/vehicles/${vehicleId}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      // The centralized errorHandler masks raw non-operational errors
      expect(response.body.message).toBe('An unexpected error occurred.');
    });
  });
});

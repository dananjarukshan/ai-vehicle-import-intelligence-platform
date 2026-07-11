// ============================================================================
// PRICE ESTIMATION ENDPOINT API TESTS
// ============================================================================
// File: tests/api/priceEstimationEndpoint.test.js
//
// PURPOSE:
// These tests verify the full HTTP endpoint for vehicle price estimation.
// We mock the vehicle service to avoid connecting to real Supabase.
// Supertest sends HTTP requests to the Express app and verifies responses.
//
// WHY MOCK THE SERVICE?
// The service uses Supabase (a remote database). In tests, we don't want to:
// 1. Connect to the real database (slower, less reliable)
// 2. Depend on network access during tests
// 3. Modify real data during testing
// Instead, we mock the service functions to return test data.
//
// HOW MOCKING WORKS:
// jest.mock() replaces the actual vehicleService with a fake version.
// We control what getVehicleById and updateVehicle return.
// This lets us test the controller and routes in isolation.
// ============================================================================

// IMPORTANT: Mock BEFORE requiring the app
jest.mock('../../src/services/vehicleService');

const request = require('supertest');
const app = require('../../src/app');
const { getVehicleById, updateVehicle } = require('../../src/services/vehicleService');

describe('POST /api/v1/vehicles/:id/estimate', () => {
  // Reset mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock vehicle used in tests
  const mockVehicle = {
    id: '11111111-1111-4111-8111-111111111111',
    make: 'Toyota',
    model: 'Prius',
    year: 2019,
    auction_price: 1000,
    estimated_import_cost: null,
    estimated_selling_price: null,
  };

  // ========================================================================
  // SUCCESS TESTS (2xx responses)
  // ========================================================================

  /**
   * TEST 1: Successful estimate returns 200 OK
   */
  it('should return 200 status on successful estimate', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(response.status).toBe(200);
  });

  /**
   * TEST 2: Response success field is true on successful estimate
   */
  it('should have success: true in response', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(response.body.success).toBe(true);
  });

  /**
   * TEST 3: Response contains updated vehicle data
   */
  it('should return updated vehicle in data field', async () => {
    const updatedVehicle = {
      ...mockVehicle,
      estimated_import_cost: 1000,
      estimated_selling_price: 1000,
    };
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue(updatedVehicle);

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(response.body.data).toEqual(updatedVehicle);
  });

  /**
   * TEST 4: Response meta contains calculation breakdown
   */
  it('should return calculation breakdown in meta field', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(response.body.meta).toBeDefined();
    expect(response.body.meta).toHaveProperty('auction_price');
    expect(response.body.meta).toHaveProperty('base_import_cost');
    expect(response.body.meta).toHaveProperty('duty_amount');
    expect(response.body.meta).toHaveProperty('vat_amount');
  });

  /**
   * TEST 5: getVehicleById receives the correct id from route
   */
  it('should call getVehicleById with the route id', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    const testId = '11111111-1111-4111-8111-111111111111';
    await request(app)
      .post(`/api/v1/vehicles/${testId}/estimate`)
      .send({ exchange_rate: 1 });

    expect(getVehicleById).toHaveBeenCalledWith(testId);
  });

  /**
   * TEST 6: updateVehicle receives estimated costs
   */
  it('should call updateVehicle with calculated estimated costs', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(updateVehicle).toHaveBeenCalled();
    const callArgs = updateVehicle.mock.calls[0];
    expect(callArgs[1]).toHaveProperty('estimated_import_cost');
    expect(callArgs[1]).toHaveProperty('estimated_selling_price');
  });

  /**
   * TEST 7: Numeric strings are accepted and work correctly
   */
  it('should accept numeric strings in request body', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 2200, estimated_selling_price: 2640 });

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({
        exchange_rate: '2',
        freight_cost: '100',
        duty_rate: '0.25',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // ========================================================================
  // VALIDATION ERROR TESTS (400 responses)
  // ========================================================================

  /**
   * TEST 8: Negative freight_cost returns 400
   */
  it('should return 400 for negative freight_cost', async () => {
    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ freight_cost: -100 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  /**
   * TEST 9: Invalid exchange_rate returns 400
   */
  it('should return 400 for invalid exchange_rate', async () => {
    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 0 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  /**
   * TEST 10: Unknown field returns 400
   */
  it('should return 400 for unknown field', async () => {
    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ mystery_fee: 100 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  /**
   * TEST 11: Validation failure does not call getVehicleById
   * If input validation fails, we should not even try to fetch the vehicle.
   */
  it('should not call getVehicleById on validation failure', async () => {
    await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ freight_cost: -100 });

    expect(getVehicleById).not.toHaveBeenCalled();
  });

  // ========================================================================
  // NOT FOUND TESTS (404 responses)
  // ========================================================================

  /**
   * TEST 12: Missing vehicle returns 404
   */
  it('should return 404 when vehicle not found', async () => {
    getVehicleById.mockResolvedValue(null); // Vehicle not found

    const response = await request(app)
      .post('/api/v1/vehicles/99999999-9999-4999-8999-999999999999/estimate')
      .send({ exchange_rate: 1 });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  /**
   * TEST 13: Missing vehicle does not call updateVehicle
   * If the vehicle doesn't exist, we should not attempt to update.
   */
  it('should not call updateVehicle when vehicle not found', async () => {
    getVehicleById.mockResolvedValue(null);

    await request(app)
      .post('/api/v1/vehicles/99999999-9999-4999-8999-999999999999/estimate')
      .send({ exchange_rate: 1 });

    expect(updateVehicle).not.toHaveBeenCalled();
  });

  // ========================================================================
  // SERVER ERROR TESTS (500 responses)
  // ========================================================================

  /**
   * TEST 14: Database/service failure returns 500
   * If getVehicleById throws an error, we should catch it and return 500.
   */
  it('should return 500 on service error', async () => {
    getVehicleById.mockRejectedValue(new Error('Database connection failed'));

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  // ========================================================================
  // RESPONSE FORMAT TESTS
  // ========================================================================

  /**
   * TEST 15: Successful response uses correct response shape
   * Verify the response structure matches sendSuccess implementation.
   */
  it('should use correct response shape matching sendSuccess', async () => {
    getVehicleById.mockResolvedValue(mockVehicle);
    updateVehicle.mockResolvedValue({ ...mockVehicle, estimated_import_cost: 1000, estimated_selling_price: 1000 });

    const response = await request(app)
      .post('/api/v1/vehicles/11111111-1111-4111-8111-111111111111/estimate')
      .send({ exchange_rate: 1 });

    // sendSuccess response should have: success, message, data, meta
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
    expect(typeof response.body.success).toBe('boolean');
    expect(typeof response.body.message).toBe('string');
  });
});

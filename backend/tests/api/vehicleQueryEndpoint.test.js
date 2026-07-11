// ============================================================================
// VEHICLE QUERY ENDPOINT API TESTS
// ============================================================================
// File: backend/tests/api/vehicleQueryEndpoint.test.js
//
// PURPOSE:
// Tests the HTTP GET /api/v1/vehicles endpoint:
// - Verifies that it passes query params to the service (make, model, year, search, sort, pagination)
// - Verifies it returns the expected data and pagination metadata shape (meta).
// - Uses Supertest and mocks the vehicleService to operate entirely in memory.
// ============================================================================

// IMPORTANT: Mock BEFORE requiring the app
jest.mock('../../src/services/vehicleService');

const request = require('supertest');
const app = require('../../src/app');
const { getAllVehicles } = require('../../src/services/vehicleService');

describe('Vehicle Query API Endpoint (GET /api/v1/vehicles)', () => {
  const mockVehicle = {
    id: '11111111-1111-4111-8111-111111111111',
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

  const defaultPagination = {
    total: 1,
    count: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1. Basic request returns 200', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.status).toBe(200);
  });

  it('2. Response success is true', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.body.success).toBe(true);
  });

  it('3. Response data contains the vehicle array', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.body.data).toEqual([mockVehicle]);
  });

  it('4. Response meta contains pagination information', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.body.meta).toEqual(defaultPagination);
  });

  it('5. GET with no query parameters calls getAllVehicles with the actual empty query object expected by the controller', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    await request(app).get('/api/v1/vehicles');

    expect(getAllVehicles).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
      make: undefined,
      model: undefined,
      year: undefined,
      search: undefined,
      sortBy: undefined,
      sortOrder: undefined
    });
  });

  it('6. Full query request forwards all string parameters', async () => {
    getAllVehicles.mockResolvedValue({
      data: [mockVehicle],
      pagination: defaultPagination
    });

    await request(app).get('/api/v1/vehicles?page=2&limit=5&make=Toyota&model=Prius&year=2019&search=hybrid&sortBy=auction_price&sortOrder=asc');

    expect(getAllVehicles).toHaveBeenCalledWith({
      page: '2',
      limit: '5',
      make: 'Toyota',
      model: 'Prius',
      year: '2019',
      search: 'hybrid',
      sortBy: 'auction_price',
      sortOrder: 'asc'
    });
  });

  it('7. make filter is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?make=Nissan');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      make: 'Nissan'
    }));
  });

  it('8. model filter is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?model=Leaf');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      model: 'Leaf'
    }));
  });

  it('9. year filter is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?year=2020');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      year: '2020'
    }));
  });

  it('10. search is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?search=ev');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      search: 'ev'
    }));
  });

  it('11. sortBy is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?sortBy=mileage');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'mileage'
    }));
  });

  it('12. sortOrder is forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?sortOrder=desc');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      sortOrder: 'desc'
    }));
  });

  it('13. page and limit are forwarded', async () => {
    getAllVehicles.mockResolvedValue({ data: [mockVehicle], pagination: defaultPagination });

    await request(app).get('/api/v1/vehicles?page=3&limit=25');

    expect(getAllVehicles).toHaveBeenCalledWith(expect.objectContaining({
      page: '3',
      limit: '25'
    }));
  });

  it('14. Service failure returns 500', async () => {
    getAllVehicles.mockRejectedValue(new Error('Database select failed.'));

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Database select failed.');
  });

  it('15. Empty results return 200 with an empty data array', async () => {
    getAllVehicles.mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        count: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  it('16. Empty results contain correct zero-result pagination metadata', async () => {
    getAllVehicles.mockResolvedValue({
      data: [],
      pagination: {
        total: 0,
        count: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });

    const response = await request(app).get('/api/v1/vehicles');

    expect(response.body.meta).toEqual({
      total: 0,
      count: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    });
  });
});

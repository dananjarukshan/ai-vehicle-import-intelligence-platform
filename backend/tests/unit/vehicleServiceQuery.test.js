// ============================================================================
// VEHICLE SERVICE QUERY UNIT TESTS
// ============================================================================
// File: backend/tests/unit/vehicleServiceQuery.test.js
//
// PURPOSE:
// Unit tests for the getAllVehicles function in the vehicleService.
// Mocks the supabaseClient to inspect query builder chaining and range maths,
// ensuring no real network requests are made.
// ============================================================================

const mockVehicles = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    make: 'Toyota',
    model: 'Prius',
    year: 2019,
    auction_price: 1250000,
    created_at: '2026-06-08T13:22:26.112738'
  }
];

let mockResponse = {
  data: mockVehicles,
  error: null,
  count: 1
};

const mockQueryBuilder = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  then: jest.fn().mockImplementation((onFulfilled) => {
    return Promise.resolve(mockResponse).then(onFulfilled);
  })
};

// Mock the Supabase client before loading the service
jest.mock('../../src/config/supabaseClient', () => ({
  supabase: mockQueryBuilder
}));

const { getAllVehicles } = require('../../src/services/vehicleService');

describe('vehicleService.getAllVehicles Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResponse = {
      data: mockVehicles,
      error: null,
      count: 1
    };
  });

  it('1. The vehicles table is selected', async () => {
    await getAllVehicles();

    expect(mockQueryBuilder.from).toHaveBeenCalledWith('vehicles');
  });

  it('2. Exact count is requested if the implementation uses count: exact', async () => {
    await getAllVehicles();

    expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
  });

  it('3. Default pagination uses page 1 and limit 10', async () => {
    await getAllVehicles();

    // safePage = 1, safeLimit = 10 -> range(0, 9)
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
  });

  it('4. Default range is 0 through 9', async () => {
    await getAllVehicles();

    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
  });

  it('5. Default sorting uses created_at descending', async () => {
    await getAllVehicles();

    expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('6. page=2 and limit=5 creates range 5 through 9', async () => {
    await getAllVehicles({ page: 2, limit: 5 });

    // (2-1)*5 = 5, 5 + 5 - 1 = 9
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(5, 9);
  });

  it('7. limit greater than 100 is limited to 100', async () => {
    await getAllVehicles({ limit: 150 });

    // clamped to 100 -> range(0, 99)
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 99);
  });

  it('8. page below 1 safely becomes page 1', async () => {
    await getAllVehicles({ page: -5 });

    // page -5 coerced to 1 -> range(0, 9)
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
  });

  it('9. limit below 1 safely becomes the configured minimum/default', async () => {
    // If limit = 0 -> Number(0) || 10 is 10. safeLimit becomes 10.
    await getAllVehicles({ limit: 0 });
    expect(mockQueryBuilder.range).toHaveBeenLastCalledWith(0, 9);

    // If limit = -5 -> Number(-5) || 10 is -5. Math.max(1, -5) is 1. safeLimit becomes 1.
    await getAllVehicles({ limit: -5 });
    expect(mockQueryBuilder.range).toHaveBeenLastCalledWith(0, 0);
  });

  it('10. make uses case-insensitive filtering', async () => {
    await getAllVehicles({ make: 'Toyota' });

    expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('make', '%Toyota%');
  });

  it('11. model uses case-insensitive filtering', async () => {
    await getAllVehicles({ model: 'Prius' });

    expect(mockQueryBuilder.ilike).toHaveBeenCalledWith('model', '%Prius%');
  });

  it('12. year uses exact numeric filtering', async () => {
    await getAllVehicles({ year: '2019' });

    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('year', 2019);
  });

  it('13. search applies make/model OR searching', async () => {
    await getAllVehicles({ search: 'hybrid' });

    expect(mockQueryBuilder.or).toHaveBeenCalledWith('make.ilike.%hybrid%,model.ilike.%hybrid%');
  });

  it('14. valid sortBy is used', async () => {
    await getAllVehicles({ sortBy: 'year' });

    expect(mockQueryBuilder.order).toHaveBeenCalledWith('year', expect.any(Object));
  });

  it('15. sortOrder=asc sets ascending true', async () => {
    await getAllVehicles({ sortOrder: 'asc' });

    expect(mockQueryBuilder.order).toHaveBeenCalledWith(expect.any(String), { ascending: true });
  });

  it('16. invalid sortBy falls back to created_at', async () => {
    await getAllVehicles({ sortBy: 'invalid_field' });

    expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', expect.any(Object));
  });

  it('17. invalid sortOrder falls back to desc', async () => {
    await getAllVehicles({ sortOrder: 'invalid_order' });

    expect(mockQueryBuilder.order).toHaveBeenCalledWith(expect.any(String), { ascending: false });
  });

  it('18. Returned metadata contains page, limit, total, totalPages', async () => {
    mockResponse = {
      data: mockVehicles,
      error: null,
      count: 45
    };

    const result = await getAllVehicles({ page: 2, limit: 10 });

    expect(result.pagination).toEqual({
      total: 45,
      count: 1,
      page: 2,
      limit: 10,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    });
  });

  it('19. A Supabase error causes getAllVehicles to reject with a clear error', async () => {
    mockResponse = {
      data: null,
      error: { message: 'Database selection failed', code: 'P0001' },
      count: null
    };

    await expect(getAllVehicles()).rejects.toThrow('Supabase Query Error: Database selection failed (Code: P0001)');
  });

  it('20. No real network request occurs', async () => {
    // Asserting that mock was used
    expect(mockQueryBuilder.from).not.toHaveBeenCalled();
    await getAllVehicles();
    expect(mockQueryBuilder.from).toHaveBeenCalled();
  });
});

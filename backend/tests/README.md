# Backend Testing Documentation

## Overview

This project uses **Jest** and **Supertest** for automated backend testing. Tests are organized into two categories:

- **Unit Tests** - Test individual functions in isolation
- **API Tests** - Test HTTP endpoints with mocked dependencies

## Test Organization

```
backend/tests/
├── setupEnv.js                    # Environment setup (runs before all tests)
├── unit/
│   ├── estimateValidator.test.js  # Validator function tests
│   └── priceEstimationService.test.js  # Service calculation tests
└── api/
    └── priceEstimationEndpoint.test.js # Full HTTP endpoint tests
```

## Unit Tests

### `estimateValidator.test.js`

Tests the `validateEstimateOptions()` function, which validates and cleans user input.

**What it tests:**
- ✅ Valid numeric input acceptance
- ✅ String-to-number conversion
- ✅ Empty objects (all fields optional)
- ✅ Negative value rejection
- ✅ Unknown field rejection
- ✅ Multiple error collection

**Run unit tests:**
```bash
npm test -- tests/unit/estimateValidator.test.js
```

### `priceEstimationService.test.js`

Tests the `calculateVehicleEstimate()` function, which contains the core pricing formula.

**What it tests:**
- ✅ Correct calculation with full options
- ✅ Default value application
- ✅ Numeric string handling
- ✅ Monetary rounding
- ✅ Error handling for invalid input
- ✅ Breakdown transparency

**Run service tests:**
```bash
npm test -- tests/unit/priceEstimationService.test.js
```

## API Tests

### `priceEstimationEndpoint.test.js`

Tests the full HTTP endpoint `POST /api/v1/vehicles/:id/estimate` using Supertest.

**Key feature: Mocked Services**

This test file uses Jest mocking to replace the actual `vehicleService`. This means:
- No connection to real Supabase database
- No network calls during testing
- Tests run faster and more reliably
- We can control exactly what the database "returns"

**Example mock usage:**
```javascript
jest.mock('../../src/services/vehicleService');

const { getVehicleById, updateVehicle } = require('../../src/services/vehicleService');

// In test:
getVehicleById.mockResolvedValue(mockVehicle);
updateVehicle.mockResolvedValue(updatedVehicle);
```

**What it tests:**
- ✅ 200 status on success
- ✅ Response structure (success, message, data, meta)
- ✅ Mock function call verification
- ✅ 400 validation failures
- ✅ 404 not found errors
- ✅ 500 server errors
- ✅ Numeric string conversion
- ✅ Error handling isolation

**Run API tests:**
```bash
npm test -- tests/api/priceEstimationEndpoint.test.js
```

## Running Tests

### All Tests
```bash
npm test
```

### Run in Watch Mode
Tests re-run automatically when files change (useful during development):
```bash
npm run test:watch
```

### Coverage Report
Generate code coverage report:
```bash
npm run test:coverage
```

Coverage report shows which lines of code are tested and which are not.

## Why No Live Supabase Calls?

Tests do **not** connect to the real Supabase database because:

1. **Speed** - Database queries are slow; mocks are instant
2. **Reliability** - No network dependency; tests work offline
3. **Data Safety** - No risk of modifying real data during testing
4. **Isolation** - One test cannot affect another
5. **Repeatability** - Same results every run, no data drift

## Environment Variables for Tests

The file `tests/setupEnv.js` sets test-only environment variables:

- `NODE_ENV=test` - Tells app it's running in test mode
- `SUPABASE_URL=...` - Dummy URL (never used, just prevents crash)
- `SUPABASE_ANON_KEY=...` - Dummy key (never used, just prevents crash)
- `JWT_SECRET=test-secret` - Required by config, but not used in tests

These dummy values allow the Express app to load and initialize without trying to connect to any real services.

## What Gets Tested vs. What Doesn't

### ✅ Tested
- Validator logic (input validation)
- Service logic (calculations)
- Controller logic (request/response handling)
- Route definitions
- Error responses

### ⏸️ Not Tested Yet
- Database integration (requires live Supabase)
- Authentication/JWT verification
- File uploads
- Email sending
- External API calls

These can be added later as integration tests.

## Mocking Strategy

### Why Mock `vehicleService`?

The `vehicleService` functions (`getVehicleById`, `updateVehicle`) access Supabase. In the API test, we mock these to:

1. **Avoid network calls** - Tests run offline
2. **Control behavior** - We decide what data to "return"
3. **Test error scenarios** - Easy to simulate failures
4. **Verify calls** - Check that controller called service correctly

### What About Other Imports?

- `app` - Not mocked (we want to test the real app)
- `apiResponse.js` - Not mocked (response formatting is critical)
- `estimateValidator.js` - Not mocked (we want to test validation)
- `priceEstimationService.js` - Not mocked in API test (it's called by controller)
- `vehicleController.js` - Not mocked (we're testing it)

Only `vehicleService` is mocked because it depends on external database.

## Debugging Tests

### Run single test file:
```bash
npm test -- estimateValidator.test.js
```

### Run single test by name:
```bash
npm test -- --testNamePattern="should accept valid numeric input"
```

### Verbose output:
```bash
npm test -- --verbose
```

### Check coverage for specific file:
```bash
npm run test:coverage -- --collectCoverageFrom="src/validators/**/*.js"
```

## Test Isolation

Each test includes:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

This ensures each test starts fresh with clean mocks. One test cannot accidentally affect another.

## Next Steps for Testing

1. **Run tests locally** - Verify setup works
2. **Add CI/CD** - Run tests on every git push
3. **Integration tests** - Test with real Supabase (separate suite)
4. **E2E tests** - Test entire flows from frontend to database
5. **Performance tests** - Measure calculation speed at scale

## Common Issues

### "Cannot find module" error
- Make sure you're in the `backend` directory
- Check that relative paths in jest.config.js match your folder structure

### Tests hang/timeout
- Check that mocks are properly configured
- Ensure no actual network calls are being made
- Try running with `--verbose` to see what's happening

### Coverage reports missing
- Run with `npm run test:coverage` (not just `npm test`)
- Check that files match the coverageFrom patterns

## Resources

- **Jest Documentation:** https://jestjs.io/docs/getting-started
- **Supertest Documentation:** https://github.com/visionmedia/supertest
- **Testing Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices#6-testing-best-practices

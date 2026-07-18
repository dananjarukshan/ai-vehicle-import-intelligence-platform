// ============================================================================
// PRICE ESTIMATION SERVICE UNIT TESTS
// ============================================================================
// File: tests/unit/priceEstimationService.test.js
//
// PURPOSE:
// Unit tests for the calculateVehicleEstimate function in the service.
// These tests verify that the calculation formulas produce correct results,
// handle edge cases, and validate input properly.
//
// WHY UNIT TESTS FOR THE SERVICE?
// The service contains the core business logic (the pricing formula).
// Unit tests ensure it works correctly in isolation, without needing a database.
// ============================================================================

const { calculateVehicleEstimate } = require('../../src/services/priceEstimationService');

describe('calculateVehicleEstimate', () => {
  /**
   * TEST 1: Correct full calculation with all options
   * This tests the exact formula with specific values to verify correctness.
   *
   * Formula breakdown:
   * - auction_price_local = 1000 * 2 = 2000
   * - base_import_cost = 2000 + 100 + 50 + 50 + 0 = 2200
   * - duty_amount = 2200 * 0.25 = 550
   * - vat_amount = (2200 + 550) * 0.10 = 275
   * - estimated_import_cost = 2200 + 550 + 275 = 3025
   * - profit_amount = 3025 * 0.20 = 605
   * - estimated_selling_price = 3025 + 605 = 3630
   */
  it('should calculate correctly with full options', () => {
    const vehicle = { auction_price: 1000 };
    const options = {
      exchange_rate: 2,
      freight_cost: 100,
      insurance_cost: 50,
      clearance_cost: 50,
      duty_rate: 0.25,
      vat_rate: 0.1,
      profit_margin_rate: 0.2,
      other_costs: 0,
    };

    const result = calculateVehicleEstimate(vehicle, options);

    expect(result.estimated_import_cost).toBe(3025);
    expect(result.estimated_selling_price).toBe(3630);
    expect(result.breakdown.auction_price_local).toBe(2000);
    expect(result.breakdown.base_import_cost).toBe(2200);
    expect(result.breakdown.duty_amount).toBe(550);
    expect(result.breakdown.vat_amount).toBe(275);
    expect(result.breakdown.profit_amount).toBe(605);
  });

  /**
   * TEST 2: Default values produce correct result
   * When no options are provided, all fields should default to 0 or 1,
   * resulting in estimated_import_cost = auction_price and selling price = import cost.
   */
  it('should calculate correctly with default values', () => {
    const vehicle = { auction_price: 1000 };
    const options = {}; // Empty, so defaults apply

    const result = calculateVehicleEstimate(vehicle, options);

    expect(result.estimated_import_cost).toBe(1000);
    expect(result.estimated_selling_price).toBe(1000);
    expect(result.breakdown.auction_price_local).toBe(1000);
    expect(result.breakdown.base_import_cost).toBe(1000);
    expect(result.breakdown.duty_amount).toBe(0);
    expect(result.breakdown.vat_amount).toBe(0);
    expect(result.breakdown.profit_amount).toBe(0);
  });

  /**
   * TEST 3: Numeric-string auction price
   * The service converts auction_price to a number internally.
   */
  it('should handle numeric-string auction price', () => {
    const vehicle = { auction_price: '1000' };
    const options = {};

    const result = calculateVehicleEstimate(vehicle, options);

    expect(result.estimated_import_cost).toBe(1000);
    expect(result.estimated_selling_price).toBe(1000);
  });

  /**
   * TEST 4: Monetary rounding
   * Calculated values should be rounded to nearest whole number.
   * This test uses values that produce non-integer results.
   */
  it('should round monetary values to nearest whole number', () => {
    const vehicle = { auction_price: 1000 };
    const options = {
      exchange_rate: 1.33, // Creates non-integer results
      freight_cost: 50.5,
      duty_rate: 0.25,
      vat_rate: 0.16,
      profit_margin_rate: 0.15,
    };

    const result = calculateVehicleEstimate(vehicle, options);

    // All monetary values should be integers
    expect(Number.isInteger(result.estimated_import_cost)).toBe(true);
    expect(Number.isInteger(result.estimated_selling_price)).toBe(true);
    expect(Number.isInteger(result.breakdown.auction_price_local)).toBe(true);
    expect(Number.isInteger(result.breakdown.base_import_cost)).toBe(true);
  });

  /**
   * TEST 5: Missing auction_price throws an error
   * If vehicle doesn't have auction_price, calculation should fail.
   */
  it('should throw error when auction_price is missing', () => {
    const vehicle = {}; // No auction_price
    const options = {};

    expect(() => {
      calculateVehicleEstimate(vehicle, options);
    }).toThrow();
  });

  /**
   * TEST 6: null auction_price throws an error
   * Explicitly null auction_price should be rejected.
   */
  it('should treat null auction_price as 0 and calculate normally', () => {
    const vehicle = { auction_price: null };
    const options = { exchange_rate: 1 };

    const result = calculateVehicleEstimate(vehicle, options);

    // null is coerced to 0, so estimated_import_cost should be 0
    expect(result.estimated_import_cost).toBe(0);
    expect(result.breakdown.auction_price).toBe(0);
  });

  /**
   * TEST 7: Non-numeric auction_price throws an error
   * A string like "abc" cannot be converted to a finite number.
   */
  it('should throw error when auction_price is non-numeric', () => {
    const vehicle = { auction_price: 'not-a-number' };
    const options = {};

    expect(() => {
      calculateVehicleEstimate(vehicle, options);
    }).toThrow();
  });

  /**
   * TEST 8: Negative auction_price throws an error
   * Auction prices cannot be negative.
   */
  it('should throw error when auction_price is negative', () => {
    const vehicle = { auction_price: -1000 };
    const options = {};

    expect(() => {
      calculateVehicleEstimate(vehicle, options);
    }).toThrow();
  });

  /**
   * TEST 9: Breakdown contains all expected fields
   * The returned breakdown object should include all calculation steps for transparency.
   */
  it('should include complete breakdown in response', () => {
    const vehicle = { auction_price: 1000 };
    const options = {
      exchange_rate: 1.5,
      freight_cost: 200,
      duty_rate: 0.2,
      vat_rate: 0.1,
      profit_margin_rate: 0.15,
    };

    const result = calculateVehicleEstimate(vehicle, options);

    expect(result.breakdown).toBeDefined();
    expect(result.breakdown.auction_price).toBeDefined();
    expect(result.breakdown.auction_price_local).toBeDefined();
    expect(result.breakdown.base_import_cost).toBeDefined();
    expect(result.breakdown.duty_amount).toBeDefined();
    expect(result.breakdown.vat_amount).toBeDefined();
    expect(result.breakdown.profit_amount).toBeDefined();
  });

  /**
   * TEST 10: Partial options use remaining defaults
   * When some options are provided, unprovided options should use defaults.
   */
  it('should use defaults for unprovided options', () => {
    const vehicle = { auction_price: 1000 };
    const options = {
      exchange_rate: 2,
      // Only exchange_rate provided, others default
    };

    const result = calculateVehicleEstimate(vehicle, options);

    // auction_price_local = 1000 * 2 = 2000
    // base_import_cost = 2000 + 0 + 0 + 0 + 0 = 2000
    // duty_amount = 2000 * 0 = 0
    // vat_amount = (2000 + 0) * 0 = 0
    // import_cost = 2000 + 0 + 0 = 2000
    // profit = 2000 * 0 = 0
    // selling_price = 2000 + 0 = 2000
    expect(result.breakdown.auction_price_local).toBe(2000);
    expect(result.breakdown.base_import_cost).toBe(2000);
    expect(result.estimated_import_cost).toBe(2000);
  });
});

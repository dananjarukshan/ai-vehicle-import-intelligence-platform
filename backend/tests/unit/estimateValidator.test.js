// ============================================================================
// ESTIMATE VALIDATOR UNIT TESTS
// ============================================================================
// File: tests/unit/estimateValidator.test.js
//
// PURPOSE:
// Unit tests for the validateEstimateOptions function in the validator.
// These tests verify that the validator correctly accepts valid data,
// rejects invalid data, and converts numeric strings.
//
// WHY UNIT TESTS?
// Unit tests focus on a single function in isolation.
// They run fast and help catch bugs early.
// ============================================================================

const { validateEstimateOptions } = require('../../src/validators/estimateValidator');

describe('validateEstimateOptions', () => {
  /**
   * TEST 1: Valid numeric input
   * When numeric values are provided, they should be accepted.
   */
  it('should accept valid numeric input', () => {
    const input = {
      exchange_rate: 145.5,
      freight_cost: 1200,
      insurance_cost: 300,
      clearance_cost: 800,
      duty_rate: 0.25,
      vat_rate: 0.16,
      profit_margin_rate: 0.2,
      other_costs: 150,
    };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.cleanedData).toEqual(input);
  });

  /**
   * TEST 2: Conversion of numeric strings
   * When numeric strings like "145.5" are provided,
   * the validator should convert them to actual numbers.
   */
  it('should convert numeric strings to numbers', () => {
    const input = {
      exchange_rate: '145.5',
      freight_cost: '1200',
      duty_rate: '0.25',
    };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(typeof result.cleanedData.exchange_rate).toBe('number');
    expect(typeof result.cleanedData.freight_cost).toBe('number');
    expect(typeof result.cleanedData.duty_rate).toBe('number');
  });

  /**
   * TEST 3: Empty object is valid
   * All fields are optional. An empty object should be valid
   * because defaults exist in the calculation service.
   */
  it('should accept empty object because all fields are optional', () => {
    const input = {};

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.cleanedData).toEqual({});
  });

  /**
   * TEST 4: Negative freight_cost is rejected
   * Cost fields must be >= 0. Negative values should fail.
   */
  it('should reject negative freight_cost', () => {
    const input = { freight_cost: -100 };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'freight_cost' must be greater than or equal to 0.");
  });

  /**
   * TEST 5: exchange_rate of zero is rejected
   * exchange_rate must be > 0 (not just >= 0 like other rates).
   */
  it('should reject exchange_rate of zero', () => {
    const input = { exchange_rate: 0 };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'exchange_rate' must be greater than 0.");
  });

  /**
   * TEST 6: Unknown fields are rejected
   * The validator should only accept fields in ALLOWED_FIELDS.
   * Unknown fields should trigger an error.
   */
  it('should reject unknown fields', () => {
    const input = { mystery_fee: 100, extra_charge: 50 };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors.some((err) => err.includes('Unknown or disallowed fields'))).toBe(true);
  });

  /**
   * TEST 7: Empty-string numeric value is rejected
   * A string like "" should not convert to a valid number.
   */
  it('should reject empty-string numeric value', () => {
    const input = { freight_cost: '' };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'freight_cost' must be a valid number.");
  });

  /**
   * TEST 8: NaN-like text is rejected
   * A string like "abc" cannot be converted to a finite number.
   */
  it('should reject NaN-like text', () => {
    const input = { freight_cost: 'not-a-number' };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'freight_cost' must be a valid number.");
  });

  /**
   * TEST 9: Negative rate is rejected
   * Rate fields (duty_rate, vat_rate, profit_margin_rate) must be >= 0.
   */
  it('should reject negative duty_rate', () => {
    const input = { duty_rate: -0.1 };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("'duty_rate' must be greater than or equal to 0.");
  });

  /**
   * TEST 10: Multiple validation errors can be returned
   * If multiple fields are invalid, all errors should be collected and returned.
   */
  it('should return multiple validation errors', () => {
    const input = {
      freight_cost: -100, // Invalid
      exchange_rate: 0, // Invalid
      mystery_field: 999, // Unknown
    };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors.some((err) => err.includes('freight_cost'))).toBe(true);
    expect(result.errors.some((err) => err.includes('exchange_rate'))).toBe(true);
    expect(result.errors.some((err) => err.includes('Unknown or disallowed'))).toBe(true);
  });

  /**
   * BONUS TEST: String trimming
   * Numeric strings with leading/trailing whitespace should be trimmed and converted.
   */
  it('should trim whitespace from numeric strings', () => {
    const input = { exchange_rate: '  145.5  ', freight_cost: '  1200  ' };

    const result = validateEstimateOptions(input);

    expect(result.isValid).toBe(true);
    expect(result.cleanedData.exchange_rate).toBe(145.5);
    expect(result.cleanedData.freight_cost).toBe(1200);
  });
});

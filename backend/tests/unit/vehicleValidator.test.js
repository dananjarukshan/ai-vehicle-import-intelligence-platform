// ============================================================================
// VEHICLE VALIDATOR UNIT TESTS
// ============================================================================
// File: backend/tests/unit/vehicleValidator.test.js
//
// PURPOSE:
// Unit tests for the validateCreateVehicle and validateUpdateVehicle functions
// in the vehicleValidator.
// Verifies that the validator accepts valid configurations, trims strings,
// parses numeric strings, rejects missing/empty fields, future years, negative costs,
// unknown/protected fields, handles multiple errors, and does not mutate inputs.
// ============================================================================

const { validateCreateVehicle, validateUpdateVehicle } = require('../../src/validators/vehicleValidator');

describe('vehicleValidator Unit Tests', () => {
  const nextYear = new Date().getFullYear() + 1;

  describe('validateCreateVehicle', () => {
    /**
     * Test 1: A valid complete vehicle is accepted.
     */
    it('should accept a valid complete vehicle', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        mileage: 85000,
        auction_grade: '4.5',
        auction_price: 1250000,
        estimated_import_cost: 1500000,
        estimated_selling_price: 2000000
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.cleanedData).toEqual(input);
    });

    /**
     * Test 2: Required minimum fields make, model, and year are accepted.
     */
    it('should accept only required minimum fields (make, model, year)', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.cleanedData.make).toBe('Toyota');
      expect(result.cleanedData.model).toBe('Prius');
      expect(result.cleanedData.year).toBe(2019);
    });

    /**
     * Test 3: Leading and trailing whitespace is removed from make and model.
     */
    it('should trim leading and trailing whitespace from make and model', () => {
      const input = {
        make: '   Nissan   ',
        model: '  Leaf  ',
        year: 2018
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.cleanedData.make).toBe('Nissan');
      expect(result.cleanedData.model).toBe('Leaf');
    });

    /**
     * Test 4: Numeric strings are converted.
     */
    it('should convert numeric strings to numbers for year, mileage, and prices', () => {
      const input = {
        make: 'Honda',
        model: 'Civic',
        year: '2020',
        mileage: '45000',
        auction_price: '1100000',
        estimated_import_cost: '1350000',
        estimated_selling_price: '1800000'
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.cleanedData.year).toBe(2020);
      expect(result.cleanedData.mileage).toBe(45000);
      expect(result.cleanedData.auction_price).toBe(1100000);
      expect(result.cleanedData.estimated_import_cost).toBe(1350000);
      expect(result.cleanedData.estimated_selling_price).toBe(1800000);
    });

    /**
     * Test 5: Missing make is rejected.
     */
    it('should reject when make is missing', () => {
      const input = {
        model: 'Prius',
        year: 2019
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: 'make' is required.");
    });

    /**
     * Test 6: Missing model is rejected.
     */
    it('should reject when model is missing', () => {
      const input = {
        make: 'Toyota',
        year: 2019
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: 'model' is required.");
    });

    /**
     * Test 7: Missing year is rejected.
     */
    it('should reject when year is missing', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius'
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: 'year' is required.");
    });

    /**
     * Test 8: Blank make is rejected.
     */
    it('should reject when make is blank', () => {
      const input = {
        make: '   ',
        model: 'Prius',
        year: 2019
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: 'make' is required.");
    });

    /**
     * Test 9: Blank model is rejected.
     */
    it('should reject when model is blank', () => {
      const input = {
        make: 'Toyota',
        model: '',
        year: 2019
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Missing required field: 'model' is required.");
    });

    /**
     * Test 10: Invalid year below the minimum is rejected.
     */
    it('should reject when year is below 1990', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 1989
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`'year' must be a number between 1990 and ${nextYear}.`);
    });

    /**
     * Test 11: Year above next calendar year is rejected.
     */
    it('should reject when year is above next calendar year', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: nextYear + 1
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`'year' must be a number between 1990 and ${nextYear}.`);
    });

    /**
     * Test 12: Negative mileage is rejected.
     */
    it('should reject negative mileage', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        mileage: -10
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'mileage' must be greater than or equal to 0.");
    });

    /**
     * Test 13: Negative auction_price is rejected.
     */
    it('should reject negative auction_price', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        auction_price: -1
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'auction_price' must be greater than or equal to 0.");
    });

    /**
     * Test 14: Negative estimated_import_cost is rejected.
     */
    it('should reject negative estimated_import_cost', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        estimated_import_cost: -500
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'estimated_import_cost' must be greater than or equal to 0.");
    });

    /**
     * Test 15: Negative estimated_selling_price is rejected.
     */
    it('should reject negative estimated_selling_price', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        estimated_selling_price: -100
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'estimated_selling_price' must be greater than or equal to 0.");
    });

    /**
     * Test 16: Unknown fields are rejected.
     */
    it('should reject unknown fields', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        mystery_field: 'unknown_value'
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: mystery_field'))).toBe(true);
    });

    /**
     * Test 17: id is rejected.
     */
    it('should reject protected id field', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        id: '11111111-1111-4111-8111-111111111111'
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: id'))).toBe(true);
    });

    /**
     * Test 18: created_at is rejected.
     */
    it('should reject protected created_at field', () => {
      const input = {
        make: 'Toyota',
        model: 'Prius',
        year: 2019,
        created_at: '2026-06-08T13:22:26.112738'
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: created_at'))).toBe(true);
    });

    /**
     * Test 19: Multiple errors can be returned together.
     */
    it('should return multiple validation errors together', () => {
      const input = {
        make: '', // blank make
        model: 'Prius',
        year: 1980, // invalid year below min
        mileage: -100, // negative mileage
        unknown_val: 123 // unknown field
      };

      const result = validateCreateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors.some(err => err.includes("Missing required field: 'make' is required."))).toBe(true);
      expect(result.errors.some(err => err.includes("'year' must be a number between 1990"))).toBe(true);
      expect(result.errors.some(err => err.includes("'mileage' must be greater than or equal to 0"))).toBe(true);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: unknown_val'))).toBe(true);
    });

    /**
     * Test 20: Raw input is not mutated by validation.
     */
    it('should not mutate the raw input data', () => {
      const input = {
        make: '  Toyota  ',
        model: 'Prius',
        year: '2019',
        mileage: '85000'
      };
      const inputCopy = { ...input };

      validateCreateVehicle(input);

      expect(input).toEqual(inputCopy);
    });
  });

  describe('validateUpdateVehicle', () => {
    /**
     * Test 1: Valid partial update is accepted.
     */
    it('should accept a valid partial update', () => {
      const input = {
        mileage: 90000,
        auction_price: 1300000
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.cleanedData).toEqual(input);
    });

    /**
     * Test 2: Numeric strings are converted.
     */
    it('should convert numeric strings in partial update', () => {
      const input = {
        year: '2018',
        mileage: '90000'
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.cleanedData.year).toBe(2018);
      expect(result.cleanedData.mileage).toBe(90000);
    });

    /**
     * Test 3: Empty update object is rejected.
     */
    it('should reject empty update body', () => {
      const input = {};

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one valid vehicle field must be provided for update.');
    });

    /**
     * Test 4: Update containing only unknown fields is rejected.
     */
    it('should reject update containing only unknown fields', () => {
      const input = {
        mystery_field: 'hello'
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: mystery_field'))).toBe(true);
      expect(result.errors.some(err => err.includes('At least one valid vehicle field must be provided'))).toBe(true);
    });

    /**
     * Test 5: Protected id field is rejected.
     */
    it('should reject protected id field in update', () => {
      const input = {
        id: '11111111-1111-4111-8111-111111111111',
        mileage: 95000
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: id'))).toBe(true);
    });

    /**
     * Test 6: Protected created_at field is rejected.
     */
    it('should reject protected created_at field in update', () => {
      const input = {
        created_at: '2026-06-08T13:22:26.112738',
        mileage: 95000
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(err => err.includes('Unknown or disallowed fields: created_at'))).toBe(true);
    });

    /**
     * Test 7: Negative mileage is rejected.
     */
    it('should reject negative mileage in update', () => {
      const input = {
        mileage: -100
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("'mileage' must be greater than or equal to 0.");
    });

    /**
     * Test 8: Invalid year is rejected.
     */
    it('should reject invalid year in update', () => {
      const input = {
        year: 1980
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`'year' must be a number between 1990 and ${nextYear}.`);
    });

    /**
     * Test 9: Make/model strings are trimmed.
     */
    it('should trim make and model strings in update', () => {
      const input = {
        make: '  Subaru  ',
        model: '   Forester   '
      };

      const result = validateUpdateVehicle(input);

      expect(result.isValid).toBe(true);
      expect(result.cleanedData.make).toBe('Subaru');
      expect(result.cleanedData.model).toBe('Forester');
    });

    /**
     * Test 10: Raw input is not mutated.
     */
    it('should not mutate the raw update input data', () => {
      const input = {
        make: '  Subaru  ',
        mileage: '90000'
      };
      const inputCopy = { ...input };

      validateUpdateVehicle(input);

      expect(input).toEqual(inputCopy);
    });
  });
});

// ============================================================================
// ESTIMATE VALIDATOR
// ============================================================================
// File: src/validators/estimateValidator.js
//
// PURPOSE:
// This file validates and cleans the request body for the price estimation
// endpoint before any calculation is performed.
// ============================================================================

// These are the only fields allowed in the estimation request body.
const ALLOWED_FIELDS = [
  'exchange_rate',
  'freight_cost',
  'insurance_cost',
  'clearance_cost',
  'duty_rate',
  'vat_rate',
  'profit_margin_rate',
  'other_costs',
];

// Fields that represent money amounts.
const COST_FIELDS = [
  'freight_cost',
  'insurance_cost',
  'clearance_cost',
  'other_costs',
];

// Fields that represent rates or multipliers.
const RATE_FIELDS = [
  'exchange_rate',
  'duty_rate',
  'vat_rate',
  'profit_margin_rate',
];

/**
 * Converts a numeric-looking value into a number.
 *
 * This lets the API accept values like "1.25" or "5000" from JSON forms or
 * frontend inputs without forcing the client to convert them first.
 *
 * @param {*} value - The value to convert.
 * @returns {number|undefined} The numeric value, or undefined when invalid.
 */
function toNumber(value) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  return undefined;
}

/**
 * Validates the price estimation options sent by the client.
 *
 * Rules:
 * - Unknown fields are rejected.
 * - Numeric strings are converted to numbers.
 * - exchange_rate must be greater than 0 when provided.
 * - cost fields must be >= 0.
 * - rate fields must be >= 0.
 *
 * @param {Object} inputData - Raw request body data.
 * @returns {Object} { isValid, errors, cleanedData }
 */
function validateEstimateOptions(inputData) {
  const errors = [];
  const cleanedData = {};
  const unknownFields = [];

  // Read each property from the request body and keep only the allowed fields.
  for (const key of Object.keys(inputData || {})) {
    if (!ALLOWED_FIELDS.includes(key)) {
      unknownFields.push(key);
      continue;
    }

    const numericValue = toNumber(inputData[key]);

    // If a value was provided but could not be converted to a finite number,
    // mark it as invalid.
    if (inputData[key] !== undefined && numericValue === undefined) {
      errors.push(`'${key}' must be a valid number.`);
      continue;
    }

    if (numericValue !== undefined) {
      cleanedData[key] = numericValue;
    }
  }

  // Reject any fields that are not part of the estimation API contract.
  if (unknownFields.length > 0) {
    errors.push(`Unknown or disallowed fields: ${unknownFields.join(', ')}`);
  }

  // Validate each cost field if it was provided.
  for (const field of COST_FIELDS) {
    if (cleanedData[field] !== undefined && cleanedData[field] < 0) {
      errors.push(`'${field}' must be greater than or equal to 0.`);
    }
  }

  // Validate each rate field if it was provided.
  for (const field of RATE_FIELDS) {
    if (cleanedData[field] !== undefined && cleanedData[field] < 0) {
      errors.push(`'${field}' must be greater than or equal to 0.`);
    }
  }

  // exchange_rate has one extra rule: it must be greater than zero.
  if (cleanedData.exchange_rate !== undefined && cleanedData.exchange_rate <= 0) {
    errors.push("'exchange_rate' must be greater than 0.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData,
  };
}

// Export the validator for the controller.
module.exports = {
  validateEstimateOptions,
};
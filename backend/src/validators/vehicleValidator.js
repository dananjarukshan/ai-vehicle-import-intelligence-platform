// ============================================================================
// VEHICLE VALIDATOR
// ============================================================================
// File: src/validators/vehicleValidator.js
//
// PURPOSE:
// This validator file validates and cleans incoming request body data for vehicles.
// It ensures that only allowed fields are saved to the database, converts types 
// where necessary (like strings to numbers), and returns descriptive errors for invalid inputs.
//
// ============================================================================

// 1. Define allowed vehicle fields
// These are the only keys we will accept and store in the database.
const ALLOWED_FIELDS = [
  'make',
  'model',
  'year',
  'mileage',
  'auction_grade',
  'auction_price',
  'estimated_import_cost',
  'estimated_selling_price'
];

// These fields are numeric and must be validated as valid numbers.
const NUMBER_FIELDS = [
  'year',
  'mileage',
  'auction_price',
  'estimated_import_cost',
  'estimated_selling_price'
];

/**
 * Cleans the input object by removing disallowed keys, trimming strings,
 * converting empty strings to null, and casting numeric strings to standard numbers.
 * 
 * @param {Object} inputData - Raw request body from the client (req.body).
 * @returns {Object} An object containing:
 *   - cleanedData: The sanitized/validated object ready for the database.
 *   - unknownFields: An array of keys from inputData that were not allowed.
 */
function cleanVehicleData(inputData) {
  const cleanedData = {};
  const unknownFields = [];

  // Iterate over all keys sent in the client's request
  for (const key of Object.keys(inputData)) {
    if (ALLOWED_FIELDS.includes(key)) {
      let value = inputData[key];

      // Trim whitespace from string values
      if (typeof value === 'string') {
        value = value.trim();
      }

      // Convert empty strings to null for optional database columns
      if (value === '') {
        value = null;
      }

      // If the field is supposed to be numeric and is not null/undefined,
      // attempt to cast it to a Javascript Number.
      if (NUMBER_FIELDS.includes(key) && value !== null && value !== undefined) {
        const parsedValue = Number(value);
        // Only convert if it parsed successfully as a number
        if (!isNaN(parsedValue)) {
          value = parsedValue;
        }
      }

      cleanedData[key] = value;
    } else {
      // Keep track of disallowed or unknown fields (e.g. 'id', 'created_at', or random keys)
      unknownFields.push(key);
    }
  }

  return { cleanedData, unknownFields };
}

/**
 * Validates vehicle data for a CREATE (POST) request.
 * 
 * Requirements:
 * - Must clean raw data first.
 * - 'make', 'model', and 'year' are required fields.
 * - 'make' and 'model' must be non-empty strings.
 * - 'year' must be a number between 1990 and next calendar year.
 * - Optional fields (mileage, auction_price, estimated_import_cost, estimated_selling_price)
 *   must be numbers greater than or equal to 0 if provided.
 * - If unknown fields are present, it is considered invalid.
 * 
 * @param {Object} inputData - Raw req.body object.
 * @returns {Object} { isValid: boolean, errors: string[], cleanedData: Object }
 */
function validateCreateVehicle(inputData) {
  const errors = [];
  
  // 1. Clean the raw data
  const { cleanedData, unknownFields } = cleanVehicleData(inputData);

  // 2. Reject if any unknown/disallowed fields were sent (like id or created_at)
  if (unknownFields.length > 0) {
    errors.push(`Unknown or disallowed fields: ${unknownFields.join(', ')}`);
  }

  // 3. Validate 'make' (Required)
  if (cleanedData.make === undefined || cleanedData.make === null) {
    errors.push("Missing required field: 'make' is required.");
  } else if (typeof cleanedData.make !== 'string' || cleanedData.make.trim() === '') {
    errors.push("'make' must be a non-empty string.");
  }

  // 4. Validate 'model' (Required)
  if (cleanedData.model === undefined || cleanedData.model === null) {
    errors.push("Missing required field: 'model' is required.");
  } else if (typeof cleanedData.model !== 'string' || cleanedData.model.trim() === '') {
    errors.push("'model' must be a non-empty string.");
  }

  // 5. Validate 'year' (Required)
  const nextYear = new Date().getFullYear() + 1;
  if (cleanedData.year === undefined || cleanedData.year === null) {
    errors.push("Missing required field: 'year' is required.");
  } else {
    if (typeof cleanedData.year !== 'number') {
      errors.push("'year' must be a valid number.");
    } else if (cleanedData.year < 1990 || cleanedData.year > nextYear) {
      errors.push(`'year' must be a number between 1990 and ${nextYear}.`);
    }
  }

  // 6. Validate optional numeric fields (if they are provided)
  // Validate mileage
  if (cleanedData.mileage !== undefined && cleanedData.mileage !== null) {
    if (typeof cleanedData.mileage !== 'number') {
      errors.push("'mileage' must be a valid number.");
    } else if (cleanedData.mileage < 0) {
      errors.push("'mileage' must be greater than or equal to 0.");
    }
  }

  // Validate auction_price
  if (cleanedData.auction_price !== undefined && cleanedData.auction_price !== null) {
    if (typeof cleanedData.auction_price !== 'number') {
      errors.push("'auction_price' must be a valid number.");
    } else if (cleanedData.auction_price < 0) {
      errors.push("'auction_price' must be greater than or equal to 0.");
    }
  }

  // Validate estimated_import_cost
  if (cleanedData.estimated_import_cost !== undefined && cleanedData.estimated_import_cost !== null) {
    if (typeof cleanedData.estimated_import_cost !== 'number') {
      errors.push("'estimated_import_cost' must be a valid number.");
    } else if (cleanedData.estimated_import_cost < 0) {
      errors.push("'estimated_import_cost' must be greater than or equal to 0.");
    }
  }

  // Validate estimated_selling_price
  if (cleanedData.estimated_selling_price !== undefined && cleanedData.estimated_selling_price !== null) {
    if (typeof cleanedData.estimated_selling_price !== 'number') {
      errors.push("'estimated_selling_price' must be a valid number.");
    } else if (cleanedData.estimated_selling_price < 0) {
      errors.push("'estimated_selling_price' must be greater than or equal to 0.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData
  };
}

/**
 * Validates vehicle data for an UPDATE (PUT) request.
 * 
 * Requirements:
 * - Must clean raw data first.
 * - No fields are strictly required, but at least one allowed field must be provided.
 * - Any fields provided must pass the same type/range checks as Create.
 * - If unknown fields are present, it is considered invalid.
 * 
 * @param {Object} inputData - Raw req.body object.
 * @returns {Object} { isValid: boolean, errors: string[], cleanedData: Object }
 */
function validateUpdateVehicle(inputData) {
  const errors = [];

  // 1. Clean the raw data
  const { cleanedData, unknownFields } = cleanVehicleData(inputData);

  // 2. Reject if any unknown/disallowed fields were sent (like id or created_at)
  if (unknownFields.length > 0) {
    errors.push(`Unknown or disallowed fields: ${unknownFields.join(', ')}`);
  }

  // 3. Ensure at least one allowed field is being updated
  const keysToUpdate = Object.keys(cleanedData);
  if (keysToUpdate.length === 0) {
    errors.push("At least one valid vehicle field must be provided for update.");
  }

  // 4. Validate fields IF they are provided (not undefined)
  // Validate make
  if (cleanedData.make !== undefined && cleanedData.make !== null) {
    if (typeof cleanedData.make !== 'string' || cleanedData.make.trim() === '') {
      errors.push("'make' must be a non-empty string.");
    }
  }

  // Validate model
  if (cleanedData.model !== undefined && cleanedData.model !== null) {
    if (typeof cleanedData.model !== 'string' || cleanedData.model.trim() === '') {
      errors.push("'model' must be a non-empty string.");
    }
  }

  // Validate year
  const nextYear = new Date().getFullYear() + 1;
  if (cleanedData.year !== undefined && cleanedData.year !== null) {
    if (typeof cleanedData.year !== 'number') {
      errors.push("'year' must be a valid number.");
    } else if (cleanedData.year < 1990 || cleanedData.year > nextYear) {
      errors.push(`'year' must be a number between 1990 and ${nextYear}.`);
    }
  }

  // Validate mileage
  if (cleanedData.mileage !== undefined && cleanedData.mileage !== null) {
    if (typeof cleanedData.mileage !== 'number') {
      errors.push("'mileage' must be a valid number.");
    } else if (cleanedData.mileage < 0) {
      errors.push("'mileage' must be greater than or equal to 0.");
    }
  }

  // Validate auction_price
  if (cleanedData.auction_price !== undefined && cleanedData.auction_price !== null) {
    if (typeof cleanedData.auction_price !== 'number') {
      errors.push("'auction_price' must be a valid number.");
    } else if (cleanedData.auction_price < 0) {
      errors.push("'auction_price' must be greater than or equal to 0.");
    }
  }

  // Validate estimated_import_cost
  if (cleanedData.estimated_import_cost !== undefined && cleanedData.estimated_import_cost !== null) {
    if (typeof cleanedData.estimated_import_cost !== 'number') {
      errors.push("'estimated_import_cost' must be a valid number.");
    } else if (cleanedData.estimated_import_cost < 0) {
      errors.push("'estimated_import_cost' must be greater than or equal to 0.");
    }
  }

  // Validate estimated_selling_price
  if (cleanedData.estimated_selling_price !== undefined && cleanedData.estimated_selling_price !== null) {
    if (typeof cleanedData.estimated_selling_price !== 'number') {
      errors.push("'estimated_selling_price' must be a valid number.");
    } else if (cleanedData.estimated_selling_price < 0) {
      errors.push("'estimated_selling_price' must be greater than or equal to 0.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData
  };
}

module.exports = {
  validateCreateVehicle,
  validateUpdateVehicle
};

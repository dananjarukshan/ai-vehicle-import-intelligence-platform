// ============================================================================
// VEHICLE CONTROLLER
// ============================================================================
// File: src/controllers/vehicleController.js
//
// PURPOSE:
// This controller file handles all HTTP requests and responses related to Vehicles.
// It acts as the "middleman" between the router and the database service.
//
// WHAT IS A CONTROLLER?
// A Controller is a layer that manages HTTP request handling.
// Its primary responsibilities are:
// 1. Receiving the HTTP request from the router.
// 2. Extracting parameters or data from the request (headers, query params, body).
// 3. Calling the appropriate Service function to fetch or manipulate data.
// 4. Formatting and sending back the HTTP response with appropriate status codes.
//
// WHY USE A CONTROLLER LAYER?
// By isolating request/response logic here, we separate HTTP concerns (like status
// codes and headers) from database logic. The Controller doesn't need to know
// how Supabase works—it just calls the Service and sends the result back to the user.
//
// ============================================================================

// Import the required service functions from our database service layer.
const { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../services/vehicleService');

// Import the reusable API response helpers.
// Instead of writing res.status(200).json({ success: true, ... }) everywhere,
// we call sendSuccess() or sendError() and get a consistent, clean response shape.
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Import the validator functions that clean and validate incoming request body data.
const { validateCreateVehicle, validateUpdateVehicle } = require('../validators/vehicleValidator');

// ============================================================================
// GET /api/v1/vehicles
// ============================================================================

/**
 * Express controller handler to fetch all vehicles.
 *
 * WHY IS THIS FUNCTION ASYNC?
 * Because it calls `getAllVehicles()`, which is an asynchronous database operation.
 * We must use `await` when calling the service, so we mark `getVehicles` as `async`.
 *
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function getVehicles(req, res) {
  try {
    // 1. Call the service layer to get the list of vehicles from Supabase.
    const vehicles = await getAllVehicles();

    // 2. Send a 200 OK success response.
    //    We include a 'meta' object with the count so the API caller knows
    //    how many records were returned without counting the array manually.
    return sendSuccess(res, 200, 'Vehicles fetched successfully.', vehicles, {
      count: vehicles.length,
    });
  } catch (error) {
    // 3. Log the error on the server so developers can investigate.
    console.error('Error caught in getVehicles controller:', error);

    // 4. Send a 500 Internal Server Error response with no errors array
    //    (we only know it failed unexpectedly, not due to bad input).
    return sendError(res, 500, error.message || 'An unexpected error occurred while fetching vehicles.');
  }
}

// ============================================================================
// GET /api/v1/vehicles/:id
// ============================================================================

/**
 * Express controller handler to fetch a single vehicle by its ID.
 *
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function getVehicle(req, res) {
  try {
    // 1. Read the 'id' route parameter from the URL.
    const { id } = req.params;

    // 2. Guard clause: ID should always be present because the route is /vehicles/:id,
    //    but we check defensively.
    if (!id) {
      return sendError(res, 400, 'Vehicle ID is required.');
    }

    // 3. Ask the service to find the vehicle in the database.
    const vehicle = await getVehicleById(id);

    // 4. If null was returned, no record matched the ID.
    if (!vehicle) {
      return sendError(res, 404, `Vehicle with ID ${id} not found.`);
    }

    // 5. Vehicle found — return it with 200 OK.
    return sendSuccess(res, 200, 'Vehicle fetched successfully.', vehicle);
  } catch (error) {
    console.error(`Error caught in getVehicle controller for ID ${req.params?.id}:`, error);
    return sendError(res, 500, error.message || 'An unexpected error occurred while fetching the vehicle.');
  }
}

// ============================================================================
// POST /api/v1/vehicles
// ============================================================================

/**
 * Express controller handler to create a new vehicle record.
 *
 * WHY DO WE VALIDATE BEFORE CALLING THE SERVICE?
 * Validating at the controller level stops bad data from ever reaching the
 * database. This protects data integrity and gives the client a descriptive
 * list of exactly what was wrong instead of a cryptic database error.
 *
 * @param {express.Request} req - The Express HTTP Request object (contains body data).
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function createVehicleRecord(req, res) {
  try {
    // 1. Run the request body through our validator.
    //    validateCreateVehicle() cleans the data AND checks for required fields and valid values.
    //    It returns { isValid, errors, cleanedData }.
    const { isValid, errors, cleanedData } = validateCreateVehicle(req.body);

    // 2. If validation failed, return 400 Bad Request with the list of errors.
    //    We pass the errors array as the third argument to sendError() so the
    //    client knows exactly what to fix.
    if (!isValid) {
      return sendError(res, 400, 'Validation failed. Please correct the errors and try again.', errors);
    }

    // 3. Call the service with the CLEANED data — never raw req.body.
    //    cleanedData has trimmed strings, converted numbers, and stripped disallowed fields.
    const newVehicle = await createVehicle(cleanedData);

    // 4. Return 201 Created with the newly inserted vehicle record.
    return sendSuccess(res, 201, 'Vehicle record created successfully.', newVehicle);
  } catch (error) {
    console.error('Error caught in createVehicleRecord controller:', error);
    return sendError(res, 500, error.message || 'An unexpected error occurred while creating the vehicle record.');
  }
}

// ============================================================================
// PUT /api/v1/vehicles/:id
// ============================================================================

/**
 * Express controller handler to update an existing vehicle record.
 *
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function updateVehicleRecord(req, res) {
  try {
    // 1. Read the vehicle ID from the URL route parameter.
    const { id } = req.params;

    // 2. Guard clause: ID must be present.
    if (!id) {
      return sendError(res, 400, 'Vehicle ID is required.');
    }

    // 3. Run the request body through the update validator.
    //    validateUpdateVehicle() checks that at least one allowed field is provided
    //    and that all provided fields have valid values.
    const { isValid, errors, cleanedData } = validateUpdateVehicle(req.body);

    // 4. If validation failed, return 400 with the errors array.
    if (!isValid) {
      return sendError(res, 400, 'Validation failed. Please correct the errors and try again.', errors);
    }

    // 5. Call the service with the cleaned update data.
    const updatedVehicle = await updateVehicle(id, cleanedData);

    // 6. If null was returned, the vehicle ID does not exist.
    if (!updatedVehicle) {
      return sendError(res, 404, `Vehicle with ID ${id} not found.`);
    }

    // 7. Return the updated vehicle with 200 OK.
    return sendSuccess(res, 200, 'Vehicle record updated successfully.', updatedVehicle);
  } catch (error) {
    console.error(`Error caught in updateVehicleRecord controller for ID ${req.params?.id}:`, error);
    return sendError(res, 500, error.message || 'An unexpected error occurred while updating the vehicle record.');
  }
}

// ============================================================================
// DELETE /api/v1/vehicles/:id
// ============================================================================

/**
 * Express controller handler to delete an existing vehicle record.
 *
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function deleteVehicleRecord(req, res) {
  try {
    // 1. Read the vehicle ID from the URL route parameter.
    const { id } = req.params;

    // 2. Guard clause: ID must be present.
    if (!id) {
      return sendError(res, 400, 'Vehicle ID is required.');
    }

    // 3. Ask the service to delete the vehicle from the database.
    const deletedVehicle = await deleteVehicle(id);

    // 4. If null was returned, no record matched the ID.
    if (!deletedVehicle) {
      return sendError(res, 404, `Vehicle with ID ${id} not found.`);
    }

    // 5. Return the deleted vehicle data with 200 OK so the client can confirm what was removed.
    return sendSuccess(res, 200, 'Vehicle record deleted successfully.', deletedVehicle);
  } catch (error) {
    console.error(`Error caught in deleteVehicleRecord controller for ID ${req.params?.id}:`, error);
    return sendError(res, 500, error.message || 'An unexpected error occurred while deleting the vehicle record.');
  }
}

// Export the controller handler functions so they can be registered in the router.
module.exports = {
  getVehicles,
  getVehicle,
  createVehicleRecord,
  updateVehicleRecord,
  deleteVehicleRecord,
};

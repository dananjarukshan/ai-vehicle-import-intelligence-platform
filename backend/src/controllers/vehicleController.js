// ============================================================================
// VEHICLE CONTROLLER
// ============================================================================
// File: src/controllers/vehicleController.js
//
// PURPOSE:
// This controller file handles all HTTP requests and responses related to Vehicles.
// It maps incoming requests to database services and forwards any errors to
// the centralized error handler.
// ============================================================================

// Import the required service functions from our database service layer.
const { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../services/vehicleService');

// Import the reusable API response helpers.
const { sendSuccess } = require('../utils/apiResponse');

// Import the validator functions that clean and validate incoming request body data.
const { validateCreateVehicle, validateUpdateVehicle } = require('../validators/vehicleValidator');

// Import the custom operational error class.
const AppError = require('../errors/AppError');

// ============================================================================
// GET /api/v1/vehicles
// ============================================================================

/**
 * Express controller handler to fetch vehicles with optional filtering,
 * searching, sorting, and pagination.
 *
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 * @param {express.NextFunction} next - The Express Next callback.
 */
async function getVehicles(req, res, next) {
  try {
    // 1. Extract all supported query parameters from the URL.
    const {
      page,
      limit,
      make,
      model,
      year,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    // 2. Bundle the query options into a single plain object and pass it to the service.
    const { data: vehicles, pagination } = await getAllVehicles({
      page,
      limit,
      make,
      model,
      year,
      search,
      sortBy,
      sortOrder,
    });

    // 3. Send a 200 OK response.
    return sendSuccess(res, 200, 'Vehicles fetched successfully.', vehicles, pagination);

  } catch (error) {
    next(error);
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
 * @param {express.NextFunction} next - The Express Next callback.
 */
async function getVehicle(req, res, next) {
  try {
    // 1. Read the 'id' route parameter from the URL.
    const { id } = req.params;

    // 2. Guard clause: ID should always be present
    if (!id) {
      throw new AppError('Vehicle ID is required.', 400, 'VALIDATION_ERROR');
    }

    // 3. Ask the service to find the vehicle in the database.
    const vehicle = await getVehicleById(id);

    // 4. If null was returned, no record matched the ID.
    if (!vehicle) {
      throw new AppError(`Vehicle with ID ${id} not found.`, 404, 'VEHICLE_NOT_FOUND');
    }

    // 5. Vehicle found — return it with 200 OK.
    return sendSuccess(res, 200, 'Vehicle fetched successfully.', vehicle);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// POST /api/v1/vehicles
// ============================================================================

/**
 * Express controller handler to create a new vehicle record.
 *
 * @param {express.Request} req - The Express HTTP Request object (contains body data).
 * @param {express.Response} res - The Express HTTP Response object.
 * @param {express.NextFunction} next - The Express Next callback.
 */
async function createVehicleRecord(req, res, next) {
  try {
    // 1. Run the request body through our validator.
    const { isValid, errors, cleanedData } = validateCreateVehicle(req.body);

    // 2. If validation failed, throw an AppError.
    if (!isValid) {
      throw new AppError('Validation failed. Please correct the errors and try again.', 400, 'VALIDATION_ERROR', errors);
    }

    // 3. Call the service with the CLEANED data.
    const newVehicle = await createVehicle(cleanedData);

    // 4. Return 201 Created with the newly inserted vehicle record.
    return sendSuccess(res, 201, 'Vehicle record created successfully.', newVehicle);
  } catch (error) {
    next(error);
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
 * @param {express.NextFunction} next - The Express Next callback.
 */
async function updateVehicleRecord(req, res, next) {
  try {
    // 1. Read the vehicle ID from the URL route parameter.
    const { id } = req.params;

    // 2. Guard clause: ID must be present.
    if (!id) {
      throw new AppError('Vehicle ID is required.', 400, 'VALIDATION_ERROR');
    }

    // 3. Run the request body through the update validator.
    const { isValid, errors, cleanedData } = validateUpdateVehicle(req.body);

    // 4. If validation failed, throw an AppError.
    if (!isValid) {
      throw new AppError('Validation failed. Please correct the errors and try again.', 400, 'VALIDATION_ERROR', errors);
    }

    // 5. Call the service with the cleaned update data.
    const updatedVehicle = await updateVehicle(id, cleanedData);

    // 6. If null was returned, the vehicle ID does not exist.
    if (!updatedVehicle) {
      throw new AppError(`Vehicle with ID ${id} not found.`, 404, 'VEHICLE_NOT_FOUND');
    }

    // 7. Return the updated vehicle with 200 OK.
    return sendSuccess(res, 200, 'Vehicle record updated successfully.', updatedVehicle);
  } catch (error) {
    next(error);
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
 * @param {express.NextFunction} next - The Express Next callback.
 */
async function deleteVehicleRecord(req, res, next) {
  try {
    // 1. Read the vehicle ID from the URL route parameter.
    const { id } = req.params;

    // 2. Guard clause: ID must be present.
    if (!id) {
      throw new AppError('Vehicle ID is required.', 400, 'VALIDATION_ERROR');
    }

    // 3. Ask the service to delete the vehicle from the database.
    const deletedVehicle = await deleteVehicle(id);

    // 4. If null was returned, no record matched the ID.
    if (!deletedVehicle) {
      throw new AppError(`Vehicle with ID ${id} not found.`, 404, 'VEHICLE_NOT_FOUND');
    }

    // 5. Return the deleted vehicle data with 200 OK.
    return sendSuccess(res, 200, 'Vehicle record deleted successfully.', deletedVehicle);
  } catch (error) {
    next(error);
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

// ============================================================================
// PRICE ESTIMATION CONTROLLER
// ============================================================================
// File: src/controllers/priceEstimationController.js
//
// PURPOSE:
// This controller receives the estimate request, validates the input,
// loads the vehicle, runs the calculation, saves the result, and sends a
// clean HTTP response back to the client.
// ============================================================================

// Import the existing vehicle service functions so we can read and update the vehicle.
const { getVehicleById, updateVehicle } = require('../services/vehicleService');

// Import the calculator service that performs the price estimation math.
const { calculateVehicleEstimate } = require('../services/priceEstimationService');

// Import the validator that cleans and checks the estimate options.
const { validateEstimateOptions } = require('../validators/estimateValidator');

// Import the reusable response helpers so the endpoint uses the same response format as the rest of the API.
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/v1/vehicles/:id/estimate
 *
 * This endpoint estimates the import cost and selling price for a vehicle.
 *
 * Flow:
 * 1. Validate the request body.
 * 2. Load the vehicle by ID.
 * 3. Run the calculation.
 * 4. Save the calculated prices to the database.
 * 5. Return the updated vehicle and the calculation breakdown.
 *
 * @param {express.Request} req - The Express request object.
 * @param {express.Response} res - The Express response object.
 */
async function estimateVehiclePrice(req, res) {
  try {
    // 1. Read the vehicle ID from the route parameter.
    const { id } = req.params;

    // 2. Validate the estimation options sent in the request body.
    const { isValid, errors, cleanedData } = validateEstimateOptions(req.body);

    // 3. Stop immediately if the input is invalid.
    if (!isValid) {
      return sendError(res, 400, 'Validation failed. Please correct the errors and try again.', errors);
    }

    // 4. Load the vehicle from the database.
    const vehicle = await getVehicleById(id);

    // 5. If the vehicle does not exist, return a 404 response.
    if (!vehicle) {
      return sendError(res, 404, `Vehicle with ID ${id} not found.`);
    }

    // 6. Calculate the estimate using the stored vehicle data and the validated options.
    const estimateResult = calculateVehicleEstimate(vehicle, cleanedData);

    // 7. Save the new estimated prices back into the vehicle record.
    const updatedVehicle = await updateVehicle(id, {
      estimated_import_cost: estimateResult.estimated_import_cost,
      estimated_selling_price: estimateResult.estimated_selling_price,
    });

    // 8. Return a 200 OK response with the updated vehicle and the breakdown.
    return sendSuccess(
      res,
      200,
      'Vehicle price estimated successfully.',
      updatedVehicle,
      estimateResult.breakdown
    );
  } catch (error) {
    console.error(`Error caught in estimateVehiclePrice controller for ID ${req.params?.id}:`, error);
    return sendError(res, 500, error.message || 'An unexpected error occurred while estimating the vehicle price.');
  }
}

// Export the controller handler so it can be added to the router.
module.exports = {
  estimateVehiclePrice,
};
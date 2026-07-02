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
// 4. Formatting and sending back the HTTP response with appropriate status codes (like 200, 404, 500).
//
// WHY USE A CONTROLLER LAYER?
// By isolating request/response logic here, we separate HTTP concerns (like status
// codes and headers) from database logic. The Controller doesn't need to know 
// how Supabase works—it just calls the Service and sends the result back to the user.
//
// ============================================================================

// Import the required service functions from our database service layer.
const { getAllVehicles, getVehicleById } = require('../services/vehicleService');

/**
 * Express controller handler to fetch all vehicles.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Because it calls `getAllVehicles()`, which is an asynchronous database operation.
 * We must use `await` when calling the service, so we mark `getVehicles` as `async`.
 * 
 * @param {express.Request} req - The Express HTTP Request object (contains request info).
 * @param {express.Response} res - The Express HTTP Response object (used to send data back).
 */
async function getVehicles(req, res) {
  try {
    // 1. Call the service layer to get the list of vehicles.
    //    We 'await' the database result so execution pauses here until data is ready.
    const vehicles = await getAllVehicles();

    // 2. Send a success response.
    //    - res.status(200): Sets the HTTP status code to 200 (OK).
    //    - .json({...}): Converts the JavaScript object into JSON string and sends it.
    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    // 3. Log the error on the server side so developers can see it.
    console.error('Error caught in getVehicles controller:', error);

    // 4. Send an error response back to the client.
    //    - res.status(500): Sets status to 500 (Internal Server Error).
    //    - We send success: false and a descriptive message so the client knows what failed.
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while fetching vehicles.',
    });
  }
}

/**
 * Express controller handler to fetch a single vehicle by its ID.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * It needs to call `getVehicleById(id)` which connects to Supabase via the internet.
 * Since that database query is asynchronous and returns a Promise, we must mark this 
 * controller function as `async` and use the `await` keyword.
 * 
 * @param {express.Request} req - The Express HTTP Request object.
 * @param {express.Response} res - The Express HTTP Response object.
 */
async function getVehicle(req, res) {
  try {
    // 1. Read the 'id' parameter from the request URL (req.params.id).
    //    For example, if the user visits /api/vehicles/123, then req.params.id will be "123".
    const { id } = req.params;

    // 2. Validate that the ID parameter was actually provided.
    //    Although Express routes matching '/vehicles/:id' normally guarantee req.params.id is present,
    //    doing an explicit validation is a great fallback and safe coding practice.
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required.',
      });
    }

    // 3. Call the service function to retrieve the vehicle from the database.
    //    We use `await` because it's a network request.
    const vehicle = await getVehicleById(id);

    // 4. If no vehicle record is found (service returned null), respond with a 404 (Not Found).
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID ${id} not found.`,
      });
    }

    // 5. If found, return the vehicle data with a 200 (OK) status code.
    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    // 6. Log the error to the server console so developers can debug it.
    console.error(`Error caught in getVehicle controller for ID ${req.params?.id}:`, error);

    // 7. Return a 500 (Internal Server Error) code to the client.
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while fetching the vehicle.',
    });
  }
}

// Export the controller handler functions so they can be registered in the router.
module.exports = {
  getVehicles,
  getVehicle,
};

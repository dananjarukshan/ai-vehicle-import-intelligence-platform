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

// Import the getVehicles database query function from our service layer.
const vehicleService = require('../services/vehicleService');

/**
 * Express controller handler to fetch all vehicles.
 * 
 * WHY IS THIS FUNCTION ASYNC?
 * Because it calls `vehicleService.getAllVehicles()`, which is an asynchronous database operation.
 * We must use `await` when calling the service, so we mark `getVehicles` as `async`.
 * 
 * @param {express.Request} req - The Express HTTP Request object (contains request info).
 * @param {express.Response} res - The Express HTTP Response object (used to send data back).
 */
async function getVehicles(req, res) {
  try {
    // 1. Call the service layer to get the list of vehicles.
    //    We 'await' the database result so execution pauses here until data is ready.
    const vehicles = await vehicleService.getAllVehicles();

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

// Export the controller handler functions so they can be registered in the router.
module.exports = {
  getVehicles,
};

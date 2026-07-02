// ============================================================================
// VEHICLE ROUTES
// ============================================================================
// File: src/routes/vehicleRoutes.js
//
// PURPOSE:
// This file defines the URL paths (endpoints) for all Vehicle-related requests.
//
// WHAT IS A ROUTE / ROUTER?
// A Router is like a directory or switchboard. When an HTTP request comes in, the 
// router inspects the HTTP Method (GET, POST, etc.) and the Path (/vehicles) 
// to decide which Controller function should handle the request.
//
// WHY USE ROUTE FILES?
// 1. Clean Organization: Groups endpoints by feature (e.g., all vehicle URLs in one place).
// 2. High-level Overview: Anyone looking at this file can see all available endpoints at a glance.
// 3. Delegation: The router has NO logic. It only says "if request matches this URL, call this controller".
//
// ============================================================================

// Import Express to access its Router module.
const express = require('express');

// Create a new router instance.
// This is a mini Express application that will group our vehicle routes.
const router = express.Router();

// Import the vehicle controller handlers that will process the requests.
const vehicleController = require('../controllers/vehicleController');

// ============================================================================
// DEFINE ENDPOINTS
// ============================================================================

// GET /vehicles
//
// HOW THIS WORKS:
// - `router.get`: Tells Express to listen only for HTTP GET requests.
// - `'/vehicles'`: The path we are listening on.
// - `vehicleController.getVehicles`: The function that runs when a user hits this endpoint.
//
// Note: In app.js, this router is registered under the prefix '/api'.
// This means the full URL path will be: GET http://localhost:3000/api/vehicles
router.get('/vehicles', vehicleController.getVehicles);

// GET /vehicles/:id
//
// HOW THIS WORKS:
// - `router.get`: Configures this path to respond only to GET requests.
// - `'/vehicles/:id'`: Uses a colon (:id) to define a route parameter named 'id'.
//   Express will parse whatever value is provided at this position in the path 
//   and place it in `req.params.id`.
// - `vehicleController.getVehicle`: Registers our controller function as the handler.
//
// Full URL path: GET http://localhost:3000/api/vehicles/:id
router.get('/vehicles/:id', vehicleController.getVehicle);

// POST /vehicles
//
// HOW THIS WORKS:
// - `router.post`: Tells Express to listen only for HTTP POST requests.
// - `'/vehicles'`: The path we are listening on for creating a new vehicle.
// - `vehicleController.createVehicleRecord`: The function that runs when a user hits this endpoint.
//
// Full URL path: POST http://localhost:3000/api/vehicles
router.post('/vehicles', vehicleController.createVehicleRecord);

// PUT /vehicles/:id
//
// HOW THIS WORKS:
// - `router.put`: Tells Express to listen only for HTTP PUT requests.
// - `'/vehicles/:id'`: Uses a colon (:id) to define a route parameter named 'id'.
//   Express will parse whatever value is provided at this position in the path 
//   and place it in `req.params.id`.
// - `vehicleController.updateVehicleRecord`: Registers our controller function as the handler.
//
// Full URL path: PUT http://localhost:3000/api/vehicles/:id
router.put('/vehicles/:id', vehicleController.updateVehicleRecord);

// Export the router so it can be registered (mounted) in the main app.js file.
module.exports = router;




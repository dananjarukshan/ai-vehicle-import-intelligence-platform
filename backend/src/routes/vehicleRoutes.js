// ============================================================================
// VEHICLE ROUTES
// ============================================================================
// File: src/routes/vehicleRoutes.js
//
// PURPOSE:
// This file defines the URL paths (endpoints) for all Vehicle-related requests.
// Every vehicle route is protected by authentication and role-based authorization.
//
// PERMISSION MATRIX:
// ┌────────────────────────────────┬────────┬─────────┬───────┐
// │ Route                          │ viewer │ analyst │ admin │
// ├────────────────────────────────┼────────┼─────────┼───────┤
// │ GET  /vehicles                 │   ✓    │    ✓    │   ✓   │
// │ GET  /vehicles/:id             │   ✓    │    ✓    │   ✓   │
// │ POST /vehicles                 │   ✗    │    ✓    │   ✓   │
// │ PUT  /vehicles/:id             │   ✗    │    ✓    │   ✓   │
// │ POST /vehicles/:id/estimate    │   ✗    │    ✓    │   ✓   │
// │ DELETE /vehicles/:id           │   ✗    │    ✗    │   ✓   │
// └────────────────────────────────┴────────┴─────────┴───────┘
//
// MIDDLEWARE ORDER ON EACH ROUTE:
// 1. authenticate   — verifies the Bearer token, attaches req.auth
// 2. authorizeRoles — checks req.auth.role against the allowed list
// 3. controller     — runs the actual business logic
//
// ROUTE ORDER NOTE:
// Express matches routes in order. The specific route '/vehicles/:id/estimate'
// must be registered BEFORE the generic '/vehicles/:id' route to prevent
// Express from treating 'estimate' as an :id value.
// ============================================================================

const express = require('express');
const router = express.Router();

// Import vehicle controller handlers
const vehicleController = require('../controllers/vehicleController');

// Import price estimation controller
const { estimateVehiclePrice } = require('../controllers/priceEstimationController');

// Import authentication and authorization middleware
const authenticate = require('../middleware/authenticate');
const authorizeRoles = require('../middleware/authorizeRoles');

// ============================================================================
// ROLE CONSTANTS
// ============================================================================
// Grouping roles into constants avoids typos and makes the permission
// matrix easy to understand at a glance.

// These roles can READ vehicle data
const READ_ROLES = ['viewer', 'analyst', 'admin'];

// These roles can CREATE, UPDATE, or ESTIMATE vehicles
const WRITE_ROLES = ['analyst', 'admin'];

// Only admins can permanently DELETE records
const DELETE_ROLES = ['admin'];

// ============================================================================
// DEFINE PROTECTED ENDPOINTS
// ============================================================================

// GET /vehicles  —  List all vehicles (with optional filtering/pagination)
// Allowed: viewer, analyst, admin
router.get(
  '/vehicles',
  authenticate,
  authorizeRoles(...READ_ROLES),
  vehicleController.getVehicles
);

// POST /vehicles/:id/estimate  —  Calculate and save price estimate
// IMPORTANT: This MUST come before GET /vehicles/:id
// Otherwise Express would match 'estimate' as the :id parameter.
// Allowed: analyst, admin
router.post(
  '/vehicles/:id/estimate',
  authenticate,
  authorizeRoles(...WRITE_ROLES),
  estimateVehiclePrice
);

// GET /vehicles/:id  —  Fetch a single vehicle by ID
// Allowed: viewer, analyst, admin
router.get(
  '/vehicles/:id',
  authenticate,
  authorizeRoles(...READ_ROLES),
  vehicleController.getVehicle
);

// POST /vehicles  —  Create a new vehicle record
// Allowed: analyst, admin
router.post(
  '/vehicles',
  authenticate,
  authorizeRoles(...WRITE_ROLES),
  vehicleController.createVehicleRecord
);

// PUT /vehicles/:id  —  Update an existing vehicle record
// Allowed: analyst, admin
router.put(
  '/vehicles/:id',
  authenticate,
  authorizeRoles(...WRITE_ROLES),
  vehicleController.updateVehicleRecord
);

// DELETE /vehicles/:id  —  Permanently delete a vehicle record
// Allowed: admin only
router.delete(
  '/vehicles/:id',
  authenticate,
  authorizeRoles(...DELETE_ROLES),
  vehicleController.deleteVehicleRecord
);

// Export the router so it can be mounted in app.js
module.exports = router;
